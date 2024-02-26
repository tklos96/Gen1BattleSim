import * as ps from '@smogon/calc';
import * as psI from '@smogon/calc/dist/data/interface';

const STATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as psI.StatID[];

export class PokemonExt {
    calcData: ps.Pokemon;
    accuracy: number;
    evasion: number;
    critStage: number;
    badgeBoosts: ps.StatID[];
    exp: number;
    invisible: boolean;
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
            badgeBoosts?: ps.StatID[],
            rawStatsOverride?: psI.StatsTable
        } = {}
    ) {
        this.calcData = new ps.Pokemon(gen, name, options);
        this.accuracy = 0;
        this.evasion = 0;
        this.critStage = 0;
        this.badgeBoosts = options_custom.badgeBoosts || [];
        this.exp = options_custom.exp || 0;
        this.invisible = false;
        this.moveCarryOver = -1;

        if(options_custom.rawStatsOverride != undefined) {
            this.calcData.rawStats = options_custom.rawStatsOverride;
        }
        this.recalculateStats();
    }

    // Apply the 12.5% badge boost to specified stat
    applyBadgeBoost(stat: psI.StatID) {
        if (this.badgeBoosts.includes(stat)) {
            this.calcData.stats[stat] = Math.floor(1.125 * this.calcData.stats[stat]);
        }
    }
    // Use to recalculate stats (from raw stats with badge boosts applied once)
    recalculateStats() {
        for(const stat of STATS) {
            this.calcData.stats[stat] = this.calcData.rawStats[stat];
            this.applyBadgeBoost(stat);
        }
    }
}
