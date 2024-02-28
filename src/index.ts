import * as ps from '@smogon/calc';
import {PokemonExt} from './pokemonExt';
import {Trainer} from './trainer';
import {TrainerData} from './data/trainers';
import {Battle} from './battle';
import {MoveExt} from './moveExt';

const gen = ps.Generations.get(1);
const p1 = new PokemonExt(gen,
                          'Jolteon',
                          {level:5
                           },
                          {badgeBoosts:['atk'],
                           moves:[new MoveExt(gen,'Thunder Shock',{'highCritRatio':false}),
                                  new MoveExt(gen,'Quick Attack')],
                           rawStatsOverride:{hp:23,atk:13,def:12,spa:17,spd:17,spe:10 }
                           //rawStatsOverride:{hp:23,atk:13,def:12,spa:17,spd:17,spe:19 }
                           }
                          );

const player = new Trainer(gen,'Player',[p1]);
const enemy = TrainerData.LabRival;

const b = new Battle(player, enemy);
for(let battleNum=0; battleNum <1000; ++battleNum) {
    b.doBattleFromScratch(battleNum < 10);
}

console.log();
console.log(`Done with simulations.`);
console.log(`Outcomes (wins, losses, ties): `);
console.log(b.outcomes);
const CoS = 100 * b.outcomes[0] / (b.outcomes[0]+b.outcomes[1]+b.outcomes[2]);
console.log(`Chance of success: ${CoS}%`);

