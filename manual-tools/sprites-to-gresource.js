const fs = require('fs');
const path = require('path');

const spriteNames = fs.readdirSync(
    path.resolve(__dirname, '../data/icons/hires')
);

const sprites = spriteNames.map((spriteName) => {
    return `<file>icons/hires/${spriteName}</file>`;
});
fs.writeFileSync(
    path.resolve(__dirname, './sprites-in-xml.xml'),
    sprites.join('\n')
);
console.log(sprites);
