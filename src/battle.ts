import * as ps from '@smogon/calc';
import {PokemonExt} from './pokemonExt';
import {Trainer} from './trainer';
import {getRandomByte, getRandomOfList} from './random';

const evaModifiers = [1,.66,.5,.4,.33,.28,.25]

export class Battle {
    player: Trainer;
    enemy: Trainer;
    logOutput = false;
    battleNum: number;
    outcomes: number[];
    turnEnded: number[];

    constructor(player: Trainer,
                enemy: Trainer
    ) {
        this.player = player;
        this.enemy = enemy;
        this.battleNum = 0;
        this.outcomes = [0,0,0];
        this.turnEnded = [];
    }

    doBattleFromScratch(logOutput = false) {
        this.logOutput = logOutput;
        this.player.reset();
        this.enemy.reset();

        if(this.logOutput) {
            console.log(`\n----- Battle: ${this.battleNum} ----------`);
            console.log(`Starting battle between ${this.player.name} and ${this.enemy.name}`);
        }

        // Turn loop. Max 200 turns.
        let turn = 0;
        for(turn=0; turn < 200; turn++) {
            this.doTurn();
            if( this.player.defeated() || this.enemy.defeated() ) break;
        }

        // Log result
        if( turn==200 ) this.outcomes[2]++;
        else if( this.player.defeated() ) this.outcomes[1]++;
        else this.outcomes[0]++;
        // Update turnEnded histogram
        while( turn >= this.turnEnded.length ) this.turnEnded.push(0);
        this.turnEnded[ turn ]++;

        if(this.logOutput) {
            if( turn==200 ) {
                console.log("TIE: Battle went to turn 200");
            }
            else if( this.player.defeated() ) {
                console.log(`LOSS: Player lost to enemy Pokemon: ${this.enemy.getActiveMon().data.name}`);
                console.log(`Battle ended on Turn ${turn}`);
            }
            else {
                console.log(`WIN: Player won!`);
                console.log(`Battle ended on Turn ${turn}`);
            }
        }

        this.battleNum++;
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

        if(this.logOutput) {
            console.log(`  End of turn. Player HP: ${this.player.getActiveMon().data.curHP()}, Enemy HP: ${this.enemy.getActiveMon().data.curHP()}`);
        }

        // If enemy pokemon is defeated, switch to next pokemon
        //if(this.enemy.getActiveMon().fainted()) this.enemy.switchPokemon();
    }

    // Do a move, including checking for status, miss, damage, etc
    private executeMove(attacker: Trainer, defender: Trainer, move: number) {
        if( attacker.useItem() ) {
            if(this.logOutput) {
                console.log(` ${attacker.name} used item.`);
                return;
            }
        }

        const attMon = attacker.getActiveMon();
        const defMon = defender.getActiveMon();

        // Check if the move will succeed, based on status
        const code = attMon.attemptMove(move);
        if(code > 0) {
            const hit = this.getAccRoll(attMon, defMon, move);
            if(hit) {
                const dmg = this.getDamageRoll(attMon, defMon, move);
                defMon.takeDmg(dmg);

                this.applySecondaryEffect(attMon, defMon, move);
            } else {
                if(this.logOutput) {
                    console.log(` ${attMon.data.name} missed ${attMon.moves[move].name}.`);
                }
            }

        }
        else if (code==0) {
            //failed due to status
        }
        else {
            //hit self in confusion
            attMon.takeDmg(200);
        }
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


        if(this.logOutput) {
            const critString = moveObj.isCrit ? '. Critical hit!' : '.';
            if(dmg>0) console.log(` ${attMon.data.name} used ${moveObj.name} for ${dmg} damage${critString}`);
            else console.log(` ${attMon.data.name} used ${moveObj.name}`);
        }
        return dmg;
    }

    private applySecondaryEffect(attMon: PokemonExt, defMon: PokemonExt, move: number) {
        const chance = attMon.moves[move].secChance;
        if( getRandomByte() < Math.floor(chance*255) ) {
            // TODO Status effects
            const status = attMon.moves[move].status as string;
            if(this.logOutput && status!='') {
                console.log(`   ${attMon.moves[move].name} applied ${status}.`);
            }

            // Stat boosts/drops
            const stat = attMon.moves[move].stat;
            const stageMod = attMon.moves[move].statStage;
            if(stageMod < 0) defMon.applyStatModifier(stat, stageMod);
            if(stageMod > 0) attMon.applyStatModifier(stat, stageMod);

            if(this.logOutput && stageMod <0) {
                console.log(`   ${attMon.moves[move].name} lowered enemy ${stat}.`);
                console.log(defMon.data.stats);
                console.log(defMon.coreStatStage);
            }
            if(stageMod > 0 && this.logOutput) {
                console.log(attMon.data.stats);
                console.log(attMon.coreStatStage);
            }

        }
    }
}
