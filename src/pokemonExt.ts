import * as ps from '@smogon/calc';
import * as psI from '@smogon/calc/dist/data/interface';

const STATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as psI.StatID[];

export class PokemonExt {
    calcData: ps.Pokemon;
    moves: ps.Move[];
    coreStatStage: psI.StatsTable;
    accStage: number;
    evaStage: number;
    crtStage: number;
    badgeBoosts: ps.StatID[];
    exp: number;
    volStatus: string;
    invisible: boolean;
    inTwoTurnMove: boolean;
    moveCarryOver: number;

    // Constructor for PokemonExt
    // options field is directly passed to ps.Pokemon
    // options_custom is for PokemonExt parameters
    constructor(
        gen: psI.Generation,
        name: string,
        options: Partial<ps.State.Pokemon> & {
            curHP?: number;
            ivs?: Partial<psI.StatsTable> & {spc?: number};
            evs?: Partial<psI.StatsTable> & {spc?: number};
            boosts?: Partial<psI.StatsTable> & {spc?: number};
        } = {},
        options_custom: {
            exp?: number,
            moves?: ps.Move[],
            badgeBoosts?: ps.StatID[],
            rawStatsOverride?: psI.StatsTable
        } = {}
    ) {
        this.calcData = new ps.Pokemon(gen, name, options);
        this.moves = options_custom.moves || [];
        this.coreStatStage = {hp:0, atk:0,def:0,spa:0,spd:0,spe:0 };
        this.accStage = 0;
        this.evaStage = 0;
        this.crtStage = 0;
        this.badgeBoosts = options_custom.badgeBoosts || [];
        this.exp = options_custom.exp || 0;
        this.volStatus = '';
        this.invisible = false;
        this.inTwoTurnMove = false;
        this.moveCarryOver = -1;

        if(options_custom.rawStatsOverride != undefined) {
            this.calcData.rawStats = options_custom.rawStatsOverride;
        }
        this.recalculateStats();
    }

    // Use to recalculate stats (from raw stats with badge boosts applied once)
    recalculateStats() {
        for(const stat of STATS) {
            this.calcData.stats[stat] = this.calcData.rawStats[stat];
            this.applyBadgeBoost(stat);
        }
    }

    // Get a move
    getMove(num: number, crit = false) {
        if(num>=this.moves.length) num = 0;
        this.moves[num].isCrit = crit;
        return this.moves[num];
    }

    // Apply the 12.5% badge boost to specified stat
    private applyBadgeBoost(stat: psI.StatID) {
        if (this.badgeBoosts.includes(stat)) {
            this.calcData.stats[stat] = Math.floor(1.125 * this.calcData.stats[stat]);
        }
    }
}
