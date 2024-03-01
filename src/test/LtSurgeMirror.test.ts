import * as ps from '@smogon/calc';
import {PokemonExt} from             '../pokemonExt';
import {AITrainer} from      '../trainer';
import * as TrainerData from '../data/trainers';
import {Battle} from                 '../battle';
import {MoveExt} from                '../moveExt';

describe('Sim', () => {
test('LtSurgeMirrorMatch', () => {


const numToSim = 100000;
const gen = ps.Generations.get(1);
const player = new AITrainer(gen, 'Surge',
                      [ new PokemonExt(gen,
                           'Raichu',
                           {level:28, ivs:TrainerData.defaultIVs},
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

const CoS = b.outcomes[0] / (b.outcomes[0]+b.outcomes[1]+b.outcomes[2]);

expect(CoS).toBeCloseTo(0.5,2);

});
});
