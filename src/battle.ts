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

    constructor(player: Trainer,
                enemy: Trainer
    ) {
        this.player = player;
        this.enemy = enemy;
        this.battleNum = 0;
        this.outcomes = [0,0,0];
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

        if(this.logOutput) {
            if( turn==200 ) {
                console.log("TIE: Battle went to turn 200");
            }
            else if( this.player.defeated() ) {
                console.log(`LOSS: Player lost to enemy Pokemon: ${this.enemy.getActiveMon().data.name}`);
                console.log(`Battle ended on Turn ${turn+1}`);
            }
            else {
                console.log(`WIN: Player won!`);
                console.log(`Battle ended on Turn ${turn+1}`);
            }
        }

        this.battleNum++;
    }

    private doTurn() {
        // Player and enemy pick moves
        const pMove = this.player.chooseMove();
        const eMove = this.enemy.chooseMove();

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
        if(attacker.isEnemyTrainer) {
            // check for item use
            return;
        }

        const attMon = attacker.getActiveMon();
        const defMon = defender.getActiveMon();

        // Check if the move will succeed, based on status
        const code = attMon.attemptMove(move);
        if(code > 0) {
            const dmg = this.getDamageRoll(attMon, defMon, move);
            defMon.takeDmg(dmg);
        }
        else if (code==0) {
            //failed due to status
        }
        else {
            //hit self in confusion
            attMon.takeDmg(200);
        }
    }

    private getDamageRoll(attMon: PokemonExt, defMon: PokemonExt, move: number) {
        // Get the move object. This includes a check for critical hit.
        const moveObj = attMon.getMoveObj(move, getRandomByte() );
        // TODO if guard spec, no crit

        const acc = Math.floor( Math.floor(moveObj.acc * 255) *
                                evaModifiers[-1*attMon.accStage] *
                                evaModifiers[defMon.evaStage] );
        const hit = getRandomByte() < acc;
        // TODO modify hit for Swift and other special cases
        // https://www.youtube.com/watch?v=hyCQf8teE7w&ab_channel=KangaskDan

        if(hit) {
            if(this.logOutput) {
                const critString = moveObj.isCrit ? '. Critical hit!' : '.';
                console.log(` ${acc} used ${moveObj.name}${critString}`);
                //console.log(` ${attMon.data.name} used ${moveObj.name}${critString}`);
            }
            return 200;

        } else {
            if(this.logOutput) {
               console.log(` ${acc} missed ${moveObj.name}.`);
               //console.log(` ${attMon.data.name} missed ${moveObj.name}.`);
            }

            return 0;
        };

        return -1;
    }
}
