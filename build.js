const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "Templates");
const output = path.join(__dirname, "dist");
const required = ["index.html", "style.css", "script.js"];

for (const file of required) {
  if (!fs.existsSync(path.join(source, file))) {
    throw new Error(`Missing required frontend file: Templates/${file}`);
  }
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of required) {
  fs.copyFileSync(path.join(source, file), path.join(output, file));
}

console.log("Build complete: static website files are in dist/");
