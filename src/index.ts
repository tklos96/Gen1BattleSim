import * as ps from '@smogon/calc';
import {PokemonExt} from './pokemonExt';
import {Trainer} from './trainer';

const gen = ps.Generations.get(1);
const p1 = new PokemonExt(gen,
                          'Jolteon',
                          {level:5
                           },
                          {badgeBoosts:['atk'],
                           moves:[new ps.Move(gen,'Quick Attack'),
                                  new ps.Move(gen,'Thunder Shock')],
                           rawStatsOverride:{hp:23,atk:13,def:12,spa:17,spd:17,spe:19 }
                           }
                          );
//// Can use default stats (with the appropriate ivs) for enemy pokemon
const p2 = new PokemonExt(gen,
                          'Eevee',
                          {level:5,
                           ivs:{atk:18, def:16, spa:16, spd:16, spe:16}
                           },
                          {moves:[new ps.Move(gen,'Tackle'),
                                  new ps.Move(gen,'Tail Whip')]
                           }
                          );

const player = new Trainer(gen,'Player',[p1]);
const enemy = new Trainer(gen,'Enemy',[p2]);

let result = ps.calculate(gen, p1.data, p2.data, p1.getMove(0,true));
console.log(result.damage);

result = ps.calculate(gen, p1.data, p2.data, p1.getMove(0,true));
console.log(result.damage);

console.log(enemy.defeated());
const damageRange = result.damage as number[];
p2.changeHP( -1*damageRange[0]);
console.log(enemy.getCurrentPokemon());
console.log(enemy.defeated());
