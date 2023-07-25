const fs = require('fs');
const path = require('path');

const pokemons = fs.readFileSync(path.resolve(__dirname, './pokemons.json'), {
    encoding: 'utf-8',
});

console.log(JSON.parse(pokemons).flatMap((pokemon) => pokemon.type));
console.log(new Set(JSON.parse(pokemons).flatMap((pokemon) => pokemon.type)));
