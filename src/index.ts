import * as ps from '@smogon/calc';
import {PokemonExt} from './pokemonExt';

const gen = ps.Generations.get(1);
const p1 = new PokemonExt(gen,
                        'Jolteon',
                        {'level':5},
                        {'badgeBoosts':['atk']
                         //'rawStatsOverride':{hp:23,atk:130,def:12,spa:17,spd:17,spe:19 }
                         }
                       );
console.log(p1);
//// Can use default stats (with the appropriate ivs) for enemy pokemon
const p2 = new ps.Pokemon(gen,'Eevee',
                          {level:5,
                           ivs:{atk:18, def:16, spa:16, spd:16, spe:16} });
const move = new ps.Move(gen,'Quick Attack');

let result = ps.calculate(gen, p1.calcData, p2, move);
console.log(result.damage);

move.isCrit = true;
result = ps.calculate(gen, p1.calcData, p2, move);
console.log(result.damage);
