import * as ps from '@smogon/calc';
import {PokemonExt} from './pokemonExt';
import {Trainer} from './trainer';

const gen = ps.Generations.get(1);
const move = new ps.Move(gen,'Quick Attack');
const move2 = new ps.Move(gen,'Thunder Shock');
const p1 = new PokemonExt(gen,
                        'Jolteon',
                        {'level':5},
                        {'badgeBoosts':['atk'],
                         'moves':[new ps.Move(gen,'Quick Attack'), new ps.Move(gen,'Thunder Shock')],
                         'rawStatsOverride':{hp:23,atk:130,def:12,spa:17,spd:17,spe:19 }
                         }
                       );
const player = new Trainer(gen,'Player',[p1,p1],'Guard Spec',2);
console.log(player);
//// Can use default stats (with the appropriate ivs) for enemy pokemon
const p2 = new ps.Pokemon(gen,'Eevee',
                          {level:5,
                           ivs:{atk:18, def:16, spa:16, spd:16, spe:16} });


let result = ps.calculate(gen, p1.calcData, p2, p1.getMove(0,true));
console.log(result.damage);

result = ps.calculate(gen, p1.calcData, p2, p1.getMove(0));
console.log(result.damage);
//console.log(p1);
