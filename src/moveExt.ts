import * as ps from '@smogon/calc';
import * as psI from '@smogon/calc/dist/data/interface';

const highCritMoves = ['Crabhammer', 'Slash', 'Karate Chop', 'Razor Leaf'];

export class MoveExt extends ps.Move {
    acc: number;
    highCritRatio: boolean;

    constructor(
        gen: psI.Generation,
        name: string,
        options: Partial<ps.State.Move> & {
            ability?: psI.AbilityName;
            item?: psI.ItemName;
            species?: psI.SpeciesName;
            } = {},
        optionsExt: {
            acc?: number;
            highCritRatio?: boolean;
        } = {}
  ) {
    super(gen, name, options);
    this.acc = optionsExt.acc || 1;
    this.highCritRatio = optionsExt.highCritRatio || highCritMoves.includes(name);
  }
}
