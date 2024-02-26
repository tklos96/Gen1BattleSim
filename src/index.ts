import * as ps from '@smogon/calc';

const gen = ps.Generations.get(1);
let p1 = new ps.Pokemon(gen,'Jolteon',
                          {'level':5});
// Need to manually set stats for player pokemon to account for badge boosts and stat exp
p1.stats = {hp:23,atk:13,def:12,spa:170,spd:170,spe:19}; //used for non-crits
p1.rawStats = {hp:23,atk:13,def:12,spa:17,spd:17,spe:19}; //used for crits

// Can use default stats (with the appropriate ivs) for enemy pokemon
let p2 = new ps.Pokemon(gen,'Eevee',
                          {level:5,
                           ivs:{atk:18, def:16, spa:16, spd:16, spe:16} });
const move = new ps.Move(gen,'Thunder Shock');

let result = ps.calculate(gen, p1, p2, move);
console.log(result.damage);

move.isCrit = true;
result = ps.calculate(gen, p1, p2, move);
console.log(result.damage);
