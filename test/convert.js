const fs = require("fs");

fs.readdir("./", (_err, files) => {
  for (const f of files) {
    if (f.startsWith("response") && f.endsWith(".js")) {
      console.log(f);
      const d = require(`./${f}`);
      const out = JSON.stringify(d, null, 2);
      const out_name = f.replace(".js", ".json");
      fs.writeFileSync(out_name, out);
    }
  }
});
