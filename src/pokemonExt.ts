import * as ps from '@smogon/calc';
import * as psI from '@smogon/calc/dist/data/interface';

import {MoveExt} from './moveExt';
import {getRandomByte} from './random';

const nonHPStats = ['atk', 'def', 'spa', 'spd', 'spe'] as psI.StatID[];
type StatIDExt = psI.StatID | 'acc' | 'eva';
const stageMods = [.25,.28,.33,.4,.5,.66,1,1.5,2,3,4,5,6];

type StatusExt = psI.StatusName | 'con' | '';
const nonVolStatus = ['par'] as StatusExt[];

export class PokemonExt {
    data: ps.Pokemon;
    moves: MoveExt[];
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
            moves?: MoveExt[],
            badgeBoosts?: ps.StatID[],
            rawStatsOverride?: psI.StatsTable
        } = {}
    ) {
        this.data = new ps.Pokemon(gen, name, options);
        this.moves = optionsExt.moves || [];
        this.coreStatStage = {hp:0,atk:0,def:0,spa:0,spd:0,spe:0 };
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
        this.data.status = '';
        this.coreStatStage = {hp:0, atk:0,def:0,spa:0,spd:0,spe:0 };
        this.accStage = 0;
        this.evaStage = 0;
        this.volStatus = '';
        this.invulnerable = false;
        this.inTwoTurnMove = false;
        this.moveCarryOver = -1;

        this.recalculateStats();
    }

    // Apply a new stat stage modifier
    applyStatModifier(stat: StatIDExt | '', stage: number) : boolean {
        if(stat=='') return false;

        // Do nothing if stat can't be raised/lowered more
        let currentStage: number;
        if(stat=='acc') currentStage = this.accStage;
        else if (stat=='eva') currentStage = this.evaStage;
        else currentStage = this.coreStatStage[stat as psI.StatID];
        if( (stage >=0 && currentStage >=6) || (stage <=0 && currentStage <= -6)) return false;

        // Update the stage modifier and calculate that specific stat
        if(stat=='acc') this.accStage += stage;
        else if(stat=='eva') this.evaStage += stage;
        else {
            const newStage = Math.max(-6, Math.min(6,currentStage + stage));
            this.coreStatStage[stat as psI.StatID] = newStage; 
            this.calcRawStat(stat);
        }

        // Badge boost all stats
        for(const s of nonHPStats) {
            this.applyBadgeBoost(s);
        }

        return true;
    }

    afflictNonVolStatus(status: StatusExt) : boolean {
        if(!nonVolStatus.includes(this.data.status) ) {
            this.data.status = status as psI.StatusName;
            return true;
        }
        return false;
    }

    applyStatusEffectToStats() {
        if(this.data.hasStatus('par')) {
            this.data.stats['spe'] = Math.max(1, Math.floor( 0.25 * this.data.stats['spe'] ));
        }
        else if(this.data.hasStatus('brn')) {
            this.data.stats['atk'] = Math.max(1, Math.floor( 0.5 * this.data.stats['atk'] ));
        }
    }

    // Use to recalculate stats (from raw stats with badge boosts applied once)
    recalculateStats() {
        this.data.stats['hp'] = this.data.rawStats['hp'];

        for(const stat of nonHPStats) {
            this.calcRawStat(stat);
            this.applyBadgeBoost(stat);
        }
    }

    // Get a move from its index, including whether it crits
    getMoveObj(num: number, randByte = 255) {
        if(num>=this.moves.length) num = 0;

        const critRate = this.moves[num].highCritRatio ? this.highCrit : this.baseCrit;
        this.moves[num].isCrit = (randByte < critRate);
        return this.moves[num];
    }

    // Test if a move will succeed or be stopped by status
    attemptMove(num: number) : number {
        if(this.data.hasStatus('par' as psI.StatusName)) {
            if (getRandomByte() < 64) return 0;
        }
        return 1;
    }

    // Returns speed, +1000 if the move has priority
    getPriority(moveNum = 0) : number {
        return this.data.stats['spe'] + 1000*this.moves[moveNum].priority
    }

    // Take damage
    takeDmg(dmg: number) {
        const newHP = Math.max(this.data.originalCurHP - dmg, 0);
        this.data.originalCurHP = Math.min(newHP, this.data.rawStats['hp']);
    }

    // If the Pokemon is at 0 HP
    fainted() : boolean {
        return this.data.originalCurHP == 0;
    }

    private calcRawStat(stat: psI.StatID) {
        const mult = stageMods[6+this.coreStatStage[stat]];
        this.data.stats[stat] = Math.min(999, Math.floor(mult * this.data.rawStats[stat]));
    }

    // Apply the 12.5% badge boost to specified stat
    private applyBadgeBoost(stat: psI.StatID) {
        if (this.badgeBoosts.includes(stat)) {
            this.data.stats[stat] = Math.min(999, Math.floor(1.125 * this.data.stats[stat]));
        }
    }
}
