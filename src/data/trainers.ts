import * as ps from '@smogon/calc';
import {AITrainer} from '../trainer';
import {PokemonExt} from '../pokemonExt';
import {MoveExt} from '../moveExt';

const gen = ps.Generations.get(1);

export namespace TrainerData {
    export const LabRival = new AITrainer(gen, 'Rival',
                      [ new PokemonExt(gen,
                          'Eevee',
                          {level:5,
                           ivs:{atk:18, def:16, spa:16, spd:16, spe:16}
                           },
                          {moves:[new MoveExt(gen,'Tackle',{'acc':.95}),
                                  new MoveExt(gen,'Tail Whip')]
                           }
                          )
                      ]
                     );
}
