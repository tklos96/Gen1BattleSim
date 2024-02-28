import * as ps from '@smogon/calc';
import * as psI from '@smogon/calc/dist/data/interface';

import {AITrainer} from '../trainer';
import {PokemonExt} from '../pokemonExt';
import {MoveExt} from '../moveExt';

const gen = ps.Generations.get(1);
const defaultIVs = {atk:18, def:16, spa:16, spd:16, spe:16} as Partial<psI.StatsTable>;

export namespace TrainerData {
    export const LabRival = new AITrainer(gen, 'Rival',
                      [ new PokemonExt(gen,
                          'Eevee',
                          {level:5, ivs:defaultIVs},
                          {moves:[new MoveExt(gen,'Tackle',{acc:.95}),
                                  new MoveExt(gen,'Tail Whip',{secChance:1,stat:'def',statStage:-1})]
                           })
                      ]);

    export const LtSurge = new AITrainer(gen, 'Surge',
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

}
