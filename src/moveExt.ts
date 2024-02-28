import * as ps from '@smogon/calc';
import * as psI from '@smogon/calc/dist/data/interface';

const highCritMoves = ['Crabhammer', 'Slash', 'Karate Chop', 'Razor Leaf'];
type StatusExt = psI.StatusName | 'con' | '';
type StatIDExt = psI.StatID | 'acc' | 'eva';

export class MoveExt extends ps.Move {
    acc: number;
    highCritRatio: boolean;
    secChance: number;
    status: StatusExt;
    stat: StatIDExt | '';
    statStage: number;

    constructor(
        gen: psI.Generation,
        name: string,
        optionsExt: {
            acc?: number;
            highCritRatio?: boolean;
            secChance?: number;
            status?: StatusExt;
            stat?: StatIDExt;
            statStage?: number;
        } = {},
        options: Partial<ps.State.Move> & {
            ability?: psI.AbilityName;
            item?: psI.ItemName;
            species?: psI.SpeciesName;
        } = {}
  ) {
    super(gen, name, options);
    this.acc = optionsExt.acc || 1;
    this.highCritRatio = optionsExt.highCritRatio || highCritMoves.includes(name);
    this.secChance = optionsExt.secChance || 0;
    this.status = optionsExt.status || '';
    this.stat = optionsExt.stat || '';
    this.statStage = optionsExt.statStage || 0;
  }
}
