import {backup, file, path, task, variable} from "fig";

task('make directories', async () => {
    await file({path: '~/.backups', state: 'directory'});
    await file({path: '~/.config', state: 'directory'});
});

task('move originals to ~/.backups', async () => {
    const files = [...variable.paths('files')];

    for (const file of files) {
        const src = file.strip('.erb');

        await backup({src});
    }
});

task('create symlinks', async () => {
    const files = variable.paths('files');

    for (const src of files) {
        await file({
            force: true,
            path: path.home.join(src),
            src: path.aspect.join('files', src),
            state: 'link',
        });
    }
});
