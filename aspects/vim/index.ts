import { backup, file, path, task, variable } from "fig";

task("make directories", async () => {
  // Some overlap with "dotfiles" aspect here.
  await file({ path: "~/.backups", state: "directory" });
  await file({ path: "~/.config", state: "directory" });
});


task("link ~/.config/nvim to ~/.vim", async () => {
  await file({
    path: "~/.config/nvim",
    src: "~/.vim",
    state: "link",
  });
});

task("move originals to ~/.backups", async () => {
  const files = variable.paths("files");

  for (const src of files) {
    await backup({ src });
  }
});

task("create symlinks", async () => {
  // Some overlap with "dotfiles" aspect here.
  const files = variable.paths("files");

  for (const src of files) {
    await file({
      force: true,
      path: path.home.join(src.basename),
      src: path.aspect.join("files", src.basename),
      state: "link",
    });
  }
});
