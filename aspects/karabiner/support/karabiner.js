function fromTo(from, to) {
  return [
    {
      from: {
        key_code: from,
      },
      to: {
        key_code: to,
      },
    },
  ];
}

export function bundleIdentifier(identifier) {
  return '^' + identifier.replace(/\./g, '\\.') + '$';
}

function swap(a, b) {
  return [...fromTo(a, b), ...fromTo(b, a)];
}

const DEVICE_DEFAULTS = {
  disable_built_in_keyboard_if_exists: false,
  fn_function_keys: [],
  ignore: false,
  manipulate_caps_lock_led: true,
  simple_modifications: [
  ],
};

const IDENTIFIER_DEFAULTS = {
  is_keyboard: true,
  is_pointing_device: false,
};

const APPLE_INTERNAL_US = {
  ...DEVICE_DEFAULTS,
  identifiers: {
    ...IDENTIFIER_DEFAULTS,
    product_id: 628,
    vendor_id: 1452,
  },
};

const RAZER = {
  ...DEVICE_DEFAULTS,
  identifiers: {
    ...IDENTIFIER_DEFAULTS,
    product_id: 565,
    vendor_id: 5426,
  },
  simple_modifications: [
    ...swap('left_command', 'left_option'),
    ...swap('right_command', 'right_option'),
  ],
};

const PARAMETER_DEFAULTS = {
  'basic.simultaneous_threshold_milliseconds': 50,
  'basic.to_delayed_action_delay_milliseconds': 1000,
  'basic.to_if_alone_timeout_milliseconds': 300,
  'basic.to_if_held_down_threshold_milliseconds': 500,
};

const VANILLA_PROFILE = {
  complex_modifications: {
    parameters: PARAMETER_DEFAULTS,
    rules: [],
  },
  devices: [],
  name: 'Vanilla',
  selected: false,
  simple_modifications: [],
  virtual_hid_keyboard: {
    caps_lock_delay_milliseconds: 0,
    keyboard_type: 'ansi',
  },
};

export function isObject(item) {
  return (
    item !== null && Object.prototype.toString.call(item) === '[object Object]'
  );
}

export function deepCopy(item) {
  if (Array.isArray(item)) {
    return item.map(deepCopy);
  } else if (isObject(item)) {
    const copy = {};
    Object.entries(item).forEach(([k, v]) => {
      copy[k] = deepCopy(v);
    });
    return copy;
  }
  return item;
}

/**
 * Visit the data structure, `item`, navigating to `path` and passing the
 * value(s) at that location into the `updater` function, which may return a
 * substitute value or the original item (if no changes are made, the original
 * item is returned).
 *
 * `path` is a tiny JSONPath subset, and may contain:
 *
 * - `$`: selects the root object.
 * - `.child`: selects a child property.
 * - `[start:end]`: selects an array slice; `end` is optional.
 */
export function visit(item, path, updater) {
  const match = path.match(
    /^(?<root>\$)|\.(?<child>\w+)|\[(?<slice>.+?)\]|(?<done>$)/
  );
  const {
    groups: {root, child, slice},
  } = match;
  const subpath = path.slice(match[0].length);
  if (root) {
    return visit(item, subpath, updater);
  } else if (child) {
    const next = visit(item[child], subpath, updater);
    if (next !== undefined) {
      return {
        ...item,
        [child]: next,
      };
    }
  } else if (slice) {
    const {
      groups: {start, end},
    } = slice.match(/^(?<start>\d+):(?<end>\d+)?$/);
    let array;
    for (let i = start, max = end == null ? item.length : end; i < max; i++) {
      const next = visit(item[i], subpath, updater);
      if (next !== undefined) {
        if (!array) {
          array = item.slice(0, i);
        }
        array[i] = next;
      } else if (array) {
        array[i] = item[i];
      }
    }
    return array;
  } else {
    const next = updater(item);
    return next === item ? undefined : next;
  }
}

const EXEMPTIONS = [];

function applyExemptions(profile) {
  const exemptions = {
    type: 'frontmost_application_unless',
    bundle_identifiers: EXEMPTIONS.map(bundleIdentifier),
  };

  return visit(
    profile,
    '$.complex_modifications.rules[0:].manipulators[0:].conditions',
    (conditions) => {
      if (conditions) {
        if (
          conditions.some(
            (condition) => condition.type === 'frontmost_application_if'
          )
        ) {
          return conditions;
        }
        return [...deepCopy(conditions), exemptions];
      } else {
        return [exemptions];
      }
    }
  );
}

const DEFAULT_PROFILE = applyExemptions({
  ...VANILLA_PROFILE,
  complex_modifications: {
    parameters: {
      ...PARAMETER_DEFAULTS,
      'basic.to_if_alone_timeout_milliseconds': 300 /* Default: 1000 */,
    },
    rules: [
      {
        manipulators: [
          {
            description:
              'Change caps_lock to esc when used alone, to control when used as modifier.',
            from: {
              key_code: 'caps_lock',
              modifiers: {
                optional: ['any'],
              },
            },
            to: [
              {
                key_code: 'left_control',
              },
            ],
            to_if_alone: [
              {
                key_code: 'escape',
              },
            ],
            type: 'basic',
          },
        ],
      },
      {
        description: 'Change left_shift to ( when used alone.',
        manipulators: [
          {
            from: {
              key_code: 'left_shift',
              modifiers: {
                optional: ['any'],
              },
            },
            to: [
              {
                key_code: 'left_shift',
              },
            ],
            to_if_alone: [
              {
                key_code: '9',
                modifiers: ['left_shift'],
              },
            ],
            type: 'basic',
          },
        ],
      },
      {
        description: 'Change right_shift to ) when used alone.',
        manipulators: [
          {
            from: {
              key_code: 'right_shift',
              modifiers: {
                optional: ['any'],
              },
            },
            to: [
              {
                key_code: 'right_shift',
              },
            ],
            to_if_alone: [
              {
                key_code: '0',
                modifiers: ['right_shift'],
              },
            ],
            type: 'basic',
          },
        ],
      },
      {
        description: 'Change home to start of line.',
        manipulators: [
          {
            from: {
              key_code: 'home',
              modifiers: {
                optional: ['any'],
              },
            },
            to: [
              {
                key_code: 'left_arrow',
                modifiers: ['left_command'],
              },
            ],
            type: 'basic',
          },
        ],
      },
      {
        description: 'Change end to end of line.',
        manipulators: [
          {
            from: {
              key_code: 'end',
              modifiers: {
                optional: ['any'],
              },
            },
            to: [
              {
                key_code: 'right_arrow',
                modifiers: ['left_command'],
              },
            ],
            type: 'basic',
          },
        ],
      },
      {
        description: 'Equals plus delete together to forward delete',
        manipulators: [
          {
            from: {
              modifiers: {
                optional: ['any'],
              },
              simultaneous: [
                {
                  key_code: 'equal_sign',
                },
                {
                  key_code: 'delete_or_backspace',
                },
              ],
            },
            to: [
              {
                key_code: 'delete_forward',
              },
            ],
            type: 'basic',
          },
        ],
      },
    ],
  },
  devices: [RAZER, APPLE_INTERNAL_US],
  name: 'Default',
  selected: true,
});

const CONFIG = {
  global: {
    check_for_updates_on_startup: true,
    show_in_menu_bar: true,
    show_profile_name_in_menu_bar: false,
  },
  profiles: [DEFAULT_PROFILE, VANILLA_PROFILE],
};

if (process.argv.includes('--emit-karabiner-config')) {
  process.stdout.write(JSON.stringify(CONFIG, null, 2) + '\n');
}
