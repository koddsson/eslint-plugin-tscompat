import { readFile, writeFile } from "node:fs/promises";

const TAG_NAME = process.argv[2];
console.log(process.argv);

const existingJSRConfig = JSON.parse(await readFile("./jsr.json", "utf8"));
existingJSRConfig.version = TAG_NAME;
writeFile("./jsr.json", JSON.stringify(existingJSRConfig, null, 2), "utf8");
