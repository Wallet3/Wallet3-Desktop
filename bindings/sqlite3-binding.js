const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const files = entries.filter((file) => !file.isDirectory()).map((file) => ({ ...file, path: path.join(dir, file.name) }));

  const folders = entries.filter((folder) => folder.isDirectory());

  for (const folder of folders) files.push(...getFiles(path.join(dir, folder.name)));

  return files;
}

const node_modules = path.resolve('./') + '/node_modules/sqlite3';
const files = getFiles(node_modules);

const lib = files.find((f) => f.path.endsWith('node_sqlite3.node'));

const binding = require(lib.path);
module.exports = exports = binding;
