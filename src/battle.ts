import * as ps from '@smogon/calc';
import * as psI from '@smogon/calc/dist/data/interface';
import {PokemonExt} from './pokemonExt';
import {Trainer} from './trainer';
import {getRandomByte, getRandomOfList} from './random';

const evaModifiers = [1,.66,.5,.4,.33,.28,.25];
type StatusExt = psI.StatusName | 'con' | '';
//const nonVolStatus = ['slp', 'psn', 'brn', 'frz', 'par', 'tox'] as StatusExt[];
const nonVolStatus = ['par'] as StatusExt[];

export class Battle {
    player: Trainer;
    enemy: Trainer;
    battleNum: number;
    outcomes: number[];
    turnEnded: number [];
    turnAtWin: number[];
    turnAtLoss: number[];
    logStr: string;

    constructor(player: Trainer,
                enemy: Trainer
    ) {
        this.player = player;
        this.enemy = enemy;
        this.battleNum = 0;
        this.outcomes = [0,0,0];
        this.turnEnded = [];
        this.turnAtWin = [];
        this.turnAtLoss = [];
        this.logStr = '';
    }

    calcAverageTurns() : number[] {
        let totalSum = 0;
        let totalDenom = 0;
        for(let i=0; i < this.turnEnded.length; i++) {
            totalSum += (i+1)*this.turnEnded[i];
            totalDenom += this.turnEnded[i];
        }
        const turnsTotal = totalSum/totalDenom;
        let winSum = 0;
        let winDenom = 0;
        for(let i=0; i < this.turnAtWin.length; i++) {
            winSum += (i+1)*this.turnAtWin[i];
            winDenom += this.turnAtWin[i];
        }
        const turnsPerWin = winSum/winDenom;
        let lossSum = 0;
        let lossDenom = 0;
        for(let i=0; i < this.turnAtLoss.length; i++) {
            lossSum += (i+1)*this.turnAtLoss[i];
            lossDenom += this.turnAtLoss[i];
        }
        const turnsPerLoss = lossSum/lossDenom;
        return [turnsTotal, turnsPerWin, turnsPerLoss];
    }

    doBattleFromScratch() : string {
        this.player.reset();
        this.enemy.reset();
        
        this.logStr = '';
        this.logStr += `----- Battle: ${this.battleNum} ----------\n\n`;
        for( const  t of [this.player, this.enemy]) {
            this.logStr += `${t.name} sent in ` + t.getActiveMon().report() + '\n';
        }

        // Turn loop. Max 200 turns.
        let turn = 0;
        for(turn=0; turn < 200; turn++) {
            this.logStr += `Turn ${turn}\n`;

            this.doTurn();

            this.logStr += '\n';

            if( this.player.defeated() || this.enemy.defeated() ) break;
        }

        // Log result
        while( turn >= this.turnEnded.length ) this.turnEnded.push(0);
        this.turnEnded[ turn ]++;
        if( turn==200 ) {
            this.outcomes[2]++;
            this.logStr += "TIE: Battle went to turn 200\n";
        }
        else if( this.player.defeated() ) {
            this.outcomes[1]++;
            while( turn >= this.turnAtLoss.length) this.turnAtLoss.push(0);
            this.turnAtLoss[turn]++;
            this.logStr += `LOSS: Player lost to enemy Pokemon: ${this.enemy.getActiveMon().data.name}\n`;
        }
        else {
            this.outcomes[0]++;
            while( turn >= this.turnAtWin.length) this.turnAtWin.push(0);
            this.turnAtWin[turn]++;
            this.logStr += `WIN: Player won!\n`;
        }

        this.battleNum++;

        this.logStr += `\n--------------------------`;
        return this.logStr;
    }

    private doTurn() {
        // Player and enemy pick moves
        const pMove = this.player.chooseMove(this.enemy);
        const eMove = this.enemy.chooseMove(this.player);

        // Choose who goes first
        const pPriority = this.player.getActiveMon().getPriority(pMove);
        const ePriority = this.enemy.getActiveMon().getPriority(eMove);
        let playerFirst: boolean;
        if      (pPriority > ePriority) playerFirst = true;
        else if (ePriority > pPriority) playerFirst = false;
        else                            playerFirst = (getRandomByte() < 128);

        const t1 = playerFirst ? this.player : this.enemy;
        const t2 = playerFirst ? this.enemy : this.player;
        const m1 = playerFirst ? pMove : eMove;
        const m2 = playerFirst ? eMove : pMove;

        // Execute the moves 
        this.executeMove(t1,t2,m1);
        if(!t2.getActiveMon().fainted()) this.executeMove(t2,t1,m2);

        // Report on Pokemon
        for(const t of [this.player,this.enemy]) {
            this.logStr += `    ${t.getActiveMon().report()}\n`;
        }

        // If enemy pokemon is defeated, switch to next pokemon
        //if(this.enemy.getActiveMon().fainted()) this.enemy.switchPokemon();
    }

    // Do a move, including checking for status, miss, damage, etc
    private executeMove(attacker: Trainer, defender: Trainer, move: number) {
        const usedItem = attacker.useItem();
        if(usedItem) {
            this.logStr += `  ${attacker.name} used item.\n`;
            return;
        }

        const attMon = attacker.getActiveMon();
        const defMon = defender.getActiveMon();

        // Check if the move will succeed, based on status
        const code = attMon.attemptMove();
        if(code > 0) {
            const hit = this.getAccRoll(attMon, defMon, move);
            if(hit) {
                const dmg = this.getDamageRoll(attMon, defMon, move);
                defMon.takeDmg(dmg);

                // TODO check for immunities e.g. TWave on Ground types
                this.applySecondaryEffect(attMon, defMon, move);
            } else {
                this.logStr += `  ${attMon.data.name} missed ${attMon.moves[move].name}.`;
            }

        }
        else if (code==0) {
            //failed due to status
            this.logStr += `  ${attMon.data.name} can't move due to status.`;
        }
        else {
            //hit self in confusion
            attMon.takeDmg(200);
        }
        this.logStr += '\n';
    }

    private getAccRoll(attMon: PokemonExt, defMon: PokemonExt, move: number) : boolean {
        const acc = Math.floor( Math.floor(attMon.moves[move].acc * 255) *
                                evaModifiers[-1*attMon.accStage] *
                                evaModifiers[defMon.evaStage] );
        // TODO modify hit for Swift and other special cases
        // https://www.youtube.com/watch?v=hyCQf8teE7w&ab_channel=KangaskDan

        return getRandomByte() < acc;
    }

    private getDamageRoll(attMon: PokemonExt, defMon: PokemonExt, move: number) : number {
        // Get the move object. This includes a check for critical hit.
        const moveObj = attMon.getMoveObj(move, getRandomByte() );
        // TODO if guard spec, no crit

        let dmg: number;
        if (moveObj.category == 'Status') dmg = 0;
        else {
            const result = ps.calculate(attMon.data.gen, attMon.data, defMon.data, moveObj);
            dmg = getRandomOfList(result.damage as number[]);
        }

        this.logStr += `  ${attMon.data.name} used ${moveObj.name}.`;
        if(dmg > 0 && moveObj.isCrit) this.logStr += ` Critial hit!`;
        if(dmg > 0) this.logStr += ` ${dmg} dmg.`;
        return dmg;
    }

    private applySecondaryEffect(attMon: PokemonExt, defMon: PokemonExt, move: number) {
        const chance = attMon.moves[move].secChance;
        let didSomething = false;
        if( getRandomByte() < Math.floor(chance*255) ) {
            // Status effect to apply
            const status = attMon.moves[move].status;

            // Non-volatile status effects
            if(nonVolStatus.includes(status)) {
                const moveObj = attMon.moves[move];
                if( moveObj.category == 'Status' || !defMon.data.hasType(moveObj.type)) {
                    didSomething = defMon.afflictNonVolStatus(status);

                    if(didSomething) this.logStr += ` Applied ${status}.`;
                }
            }

            // Stat boosts/drops
            const stat = attMon.moves[move].stat;
            const stageMod = attMon.moves[move].statStage;
            if(stageMod < 0) didSomething = defMon.applyStatModifier(stat, stageMod);
            if(stageMod > 0) didSomething = attMon.applyStatModifier(stat, stageMod);

            if(stageMod != 0) this.logStr += ` Affected ${stat}.`;

        }

        if(didSomething) defMon.applyStatusEffectToStats();
    }
}
