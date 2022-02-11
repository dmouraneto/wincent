import {
  attributes,
  command,
  file,
  handler,
  resource,
  skip,
  task as defineTask,
  variable,
} from 'fig';
import {join} from 'path';

// TODO: DRY this up; it is in three files now
function task(name: string, callback: () => Promise<void>) {
  defineTask(name, async () => {
    if (attributes.distribution === 'arch') {
      await callback();
    } else {
      skip('not on Arch Linux');
    }
  });
}

task('fetch yay', async () => {
  // TODO: make a `git` operation? (if I need to do this in more than one
  // place; second place has arrived now, in the vim aspect.)
  await command('git', ['clone', 'https://aur.archlinux.org/yay.git/'], {
    chdir: 'vendor',
    creates: 'vendor/yay',
    raw: true,
  });
});

task('install yay', async () => {
  await command('makepkg', ['-si', '--noconfirm'], {
    chdir: 'vendor/yay',
    creates: '/usr/bin/yay',
  });
});

task('install packages', async () => {
  await command('yay', ['-S', '--noconfirm', ...variable.strings('packages')]);
});

task('create ~/.config/systemd/user', async () => {
  for (const directory of [
    '~/.config',
    '~/.config/systemd',
    '~/.config/systemd/user',
  ]) {
    await file({
      path: directory,
      state: 'directory',
    });
  }
});

task('install ~/.config/systemd/user/clipper.service', async () => {
  await file({
    notify: 'enable clipper.service',
    path: '~/.config/systemd/user/clipper.service',
    src: '/usr/share/clipper/clipper.service',
    state: 'file',
  });
});

task('set up sensors', async () => {
  for (const conf of [
    'etc/modprobe.d/it87.conf',
    'etc/modules-load.d/it87.conf',
    'etc/sensors.d/gigabyte-x570.conf',
  ]) {
    await file({
      path: join('/', conf),
      src: resource.file(conf),
      state: 'file',
      sudo: true,
    });
  }
});

task('set Microsoft Edge as default browser', async () => {
  const result = await command('xdg-settings', [
    'check',
    'default-web-browser',
    'microsoft-edge.desktop',
  ]);

  if (result?.status === 0 && result.stdout.includes('yes')) {
    skip('already default');
  } else {
    await command('xdg-settings', [
      'set',
      'default-web-browser',
      'microsoft-edge.desktop',
    ]);
  }
});

handler('enable clipper.service', async () => {
  await command('systemctl', ['--user', 'daemon-reload']);
  await command('systemctl', ['--user', 'enable', 'clipper.service', '--now']);
});
