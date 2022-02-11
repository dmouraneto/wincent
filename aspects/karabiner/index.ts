import { command, file, path, resource, skip, template, task } from "fig";

const node = path.root.join("bin/node");

task("make directories", async () => {
  await file({ path: "~/.config", state: "directory" });
  await file({ path: "~/.config/karabiner", state: "directory" });
});

task("test karabiner.json generator", async () => {
  const test = resource.support("karabiner-test.js");

  await command(node, [test]);
});

let config: string | undefined;

task("prepare karabiner.json", async () => {
  const script = resource.support("karabiner.js");

  const result = await command(node, [script, "--emit-karabiner-config"]);

  if (result) {
    config = result.stdout;
  }
});

task("write karabiner.json", async () => {
  if (!config) {
    return skip("no contents prepared for karabiner.json");
  }

  await template({
    path: "~/.config/karabiner/karabiner.json",
    src: resource.template(".config/karabiner/karabiner.json.erb"),
    variables: { config },
  });
});
