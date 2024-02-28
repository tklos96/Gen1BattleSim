import * as ps from '@smogon/calc';
import * as psI from '@smogon/calc/dist/data/interface';

const nonHPStats = ['atk', 'def', 'spa', 'spd', 'spe'] as psI.StatID[];

export class PokemonExt {
    data: ps.Pokemon;
    moves: ps.Move[];
    coreStatStage: psI.StatsTable;
    accStage: number;
    evaStage: number;
    baseCrit: number;
    highCrit: number;
    badgeBoosts: ps.StatID[];
    volStatus: string;
    invulnerable: boolean;
    inTwoTurnMove: boolean;
    moveCarryOver: number;

    // Constructor for PokemonExt
    // options field is directly passed to ps.Pokemon
    // optionsExt is for PokemonExt parameters
    constructor(
        gen: psI.Generation,
        name: string,
        options: Partial<ps.State.Pokemon> & {
            curHP?: number;
            ivs?: Partial<psI.StatsTable> & {spc?: number};
            evs?: Partial<psI.StatsTable> & {spc?: number};
            boosts?: Partial<psI.StatsTable> & {spc?: number};
        } = {},
        optionsExt: {
            moves?: ps.Move[],
            badgeBoosts?: ps.StatID[],
            rawStatsOverride?: psI.StatsTable
        } = {}
    ) {
        this.data = new ps.Pokemon(gen, name, options);
        this.moves = optionsExt.moves || [];
        this.coreStatStage = {hp:0, atk:0,def:0,spa:0,spd:0,spe:0 };
        this.accStage = 0;
        this.evaStage = 0;
        this.badgeBoosts = optionsExt.badgeBoosts || [];
        this.volStatus = '';
        this.invulnerable = false;
        this.inTwoTurnMove = false;
        this.moveCarryOver = -1;

        if(optionsExt.rawStatsOverride != undefined) {
            this.data.rawStats = optionsExt.rawStatsOverride;
        }
        this.recalculateStats();
        this.baseCrit = Math.floor(this.data.species.baseStats['spe']/2 );
        this.highCrit = Math.min(8*this.baseCrit,255);
    }

    reset() {
        this.data.originalCurHP = this.data.rawStats['hp'];
        this.coreStatStage = {hp:0, atk:0,def:0,spa:0,spd:0,spe:0 };
        this.accStage = 0;
        this.evaStage = 0;
        this.volStatus = '';
        this.invulnerable = false;
        this.inTwoTurnMove = false;
        this.moveCarryOver = -1;

        this.recalculateStats();
    }

    // Use to recalculate stats (from raw stats with badge boosts applied once)
    recalculateStats() {
        this.data.stats['hp'] = this.data.rawStats['hp'];
        for(const stat of nonHPStats) {
            this.data.stats[stat] = this.data.rawStats[stat];
            this.applyBadgeBoost(stat);
        }
    }

    // Get a move from its index
    getMove(num: number, crit = false) {
        if(num>=this.moves.length) num = 0;
        this.moves[num].isCrit = crit;
        return this.moves[num];
    }

    // Take damage or heal
    changeHP(delta: number) {
        const newHP = Math.max(this.data.originalCurHP + delta, 0);
        this.data.originalCurHP = Math.min(newHP, this.data.rawStats['hp']);
    }

    // If the Pokemon is at 0 HP
    fainted() : boolean {
        return this.data.originalCurHP == 0;
    }

    // Apply the 12.5% badge boost to specified stat
    private applyBadgeBoost(stat: psI.StatID) {
        if (this.badgeBoosts.includes(stat)) {
            this.data.stats[stat] = Math.floor(1.125 * this.data.stats[stat]);
        }
    }
}
