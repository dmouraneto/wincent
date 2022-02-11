import {
  attributes,
  command,
  file,
  handler,
  path,
  skip,
  task as defineTask,
  variable,
} from 'fig';

// TODO: need to come up with a better pattern for arch-specific stuff
function task(name: string, callback: () => Promise<void>) {
  defineTask(name, async () => {
    if (attributes.distribution === 'arch') {
      await callback();
    } else {
      skip('not on Arch Linux');
    }
  });
}

task('set up hostname', async () => {
  // Note that "hostname" is the variable configured in the aspect.json, which
  // overwrites the "hostname" that comes in from the Attributes class (via
  // Node's `os.hostname()`).
  const hostname = variable.string('hostname');
  const result = await command('hostname', []);

  if (
    variable('identity') === 'wincent' &&
    result!.stdout.trim() !== hostname
  ) {
    await command('hostnamectl', ['set-hostname', hostname], {sudo: true});
  } else {
    skip();
  }
});

task('create ~/.config/systemd/user', async () => {
  // TODO: I am doing something similar with a `for` loop in the "aur" aspect;
  // maybe I should add `recurse: true` support to the `file` DSL.
  await file({path: '~/.config', state: 'directory'});
  await file({path: '~/.config/systemd', state: 'directory'});
  await file({path: '~/.config/systemd/user', state: 'directory'});
});

task('set up ~/.config/systemd/user/ssh-agent.service', async () => {
  const unit = '.config/systemd/user/ssh-agent.service';
  await file({
    notify: 'enable ssh-agent.service',
    path: path.home.join(unit),
    src: path.aspect.join('files', unit),
    state: 'link',
  });
});

handler('enable ssh-agent.service', async () => {
  await command('systemctl', ['--user', 'daemon-reload']);
  await command('systemctl', [
    '--user',
    'enable',
    'ssh-agent.service',
    '--now',
  ]);
});
