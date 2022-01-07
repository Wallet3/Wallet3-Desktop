#!/usr/bin/env node

const fs = require('fs');
const yaml = require('yaml');
const { version } = require('../package.json');
const { execSync } = require('child_process');
const path = require('path');

const oss = ['mac', 'win', 'linux'];
const arches = ['x64', 'arm64','x86_64'];
const exts = ['exe', 'dmg', 'AppImage'];

const latest = {
  version,
  files: [],
  releaseDate: new Date().toISOString(),
};

for (let os of oss) {
  for (let arch of arches) {
    for (let ext of exts) {
      const artifactName = `wallet3-${os}-${arch}-${version}.${ext}`;

      const pkg = path.join(__dirname, '..', 'dist', artifactName);

      let size = 0;
      try {
        size = fs.statSync(pkg).size;
      } catch (error) {
        continue;
      }

      const checksum = execSync(`shasum -a 512 ${pkg}`).toString('utf-8').split(' ')[0];

      latest.files.push({ url: artifactName, sha512: checksum, size });
    }
  }
}

const result = yaml.stringify(latest);
console.log(result);
fs.writeFileSync(path.join(__dirname, '..', 'dist', 'latest.yml'), result);
