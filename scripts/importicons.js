const fs = require('fs');

const files = fs.readdirSync('./src/assets/icons/crypto');

let file = ``;

const all = files.map((filename) => {
  const symbol = filename.split('.')[0];

  const s = `import ${symbol} from '../../assets/icons/crypto/${filename}'\n`;
  file += s;

  return { symbol, s };
});

file += `\nconst icons = { ${all.map((i) => i.symbol).join(',')} }`;

fs.writeFileSync('./src/ui/misc/Icons.ts', file, { encoding: 'utf-8' });
