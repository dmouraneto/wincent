import { command, fetch, task} from "fig";

task('download installation script', async () => {
  // await command('mkdir', ['vendor/ohmyzsh'], {creates: 'vendor/ohmyzsh'});
  await fetch({
    dest: 'vendor/ohmyzsh/install.sh',
    mode: '0755',
    url: 
    'https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh',
  });
});

task('install ohmyzsh', async () => {
  await command('vendor/ohmyzsh/install.sh', []);
});
