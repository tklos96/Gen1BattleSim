import * as ps from '@smogon/calc';
import {PokemonExt} from             '../pokemonExt';
import {Trainer,AITrainer} from      '../trainer';
import {TrainerData,defaultIVs} from '../data/trainers';
import {Battle} from                 '../battle';
import {MoveExt} from                '../moveExt';

describe('Sim', () => {
test('LtSurgeMirrorMatch', () => {


const numToSim = 10000;
const numToLog = 0; // Write full log of the first n battles

// Define Player Move Selection
//class PlayerTrainer extends Trainer {
//    chooseMove(enemy: Trainer) {
//        if(enemy.getActiveMon().accStage >= 0) {
//            return 3;
//        }
//        if(this.getActiveMon().coreStatStage['atk'] < 0) return 0;
//        return 2;
//    }
//}


// Initialize Player Team
//const p1 = new PokemonExt(gen,
//                          'Vaporeon',
//                          {level:25
//                           },
//                          {badgeBoosts:['atk'],
//                           moves:[new MoveExt(gen,'Bubble Beam'),
//                                  new MoveExt(gen,'Water Gun'),
//                                  new MoveExt(gen,'Body Slam',{secChance:.3,status:'par'}),
//                                  new MoveExt(gen,'Sand Attack',{secChance:1,stat:'acc',statStage:-1})],
//                           rawStatsOverride:{hp:110,atk:48,def:46,spa:70,spd:70,spe:48 }
//                           }
//                          );

//const player = new PlayerTrainer(gen,'Player',[p1]);
const gen = ps.Generations.get(1);
const player = new AITrainer(gen, 'Surge',
                      [ new PokemonExt(gen,
                           'Raichu',
                           {level:28, ivs:defaultIVs},
                           {moves:[new MoveExt(gen,'Thunderbolt',{secChance:.1,status:'par'}),
                                   new MoveExt(gen,'Mega Punch',{acc:.85}),
                                   new MoveExt(gen,'Mega Kick',{acc:.75}),
                                   new MoveExt(gen,'Growl',{secChance:1,stat:'atk',statStage:-1})]
                            })
                       ],
                       {item:'XSpeed',itemNum:1}
                       );

// Pick Enemy Trainer
const enemy = TrainerData.LtSurge;


// Simulate Battles
const b = new Battle(player, enemy);
for(let battleNum=0; battleNum < numToSim; ++battleNum) {
    b.doBattleFromScratch();
}


// Log simulation results
//console.log();
//console.log(`Done with simulations.`);
//console.log(`Outcomes (wins, losses, ties): `);
//console.log(b.outcomes);
console.log(`Turns At Win: `);
console.log(b.turnAtWin);
console.log(`Turns At Loss: `);
console.log(b.turnAtLoss);
const CoS = b.outcomes[0] / (b.outcomes[0]+b.outcomes[1]+b.outcomes[2]);
console.log(`Chance of success: ${CoS}`);

expect(CoS).toBeCloseTo(0.5,2);

});
});
