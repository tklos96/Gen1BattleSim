import * as ps from '@smogon/calc';
import * as psI from '@smogon/calc/dist/data/interface';
import {PokemonExt} from './pokemonExt';


export class Trainer {
    name: string;
    gen: psI.Generation;
    team: PokemonExt[];
    itemName: string;
    itemNum: number;
    itemNumPerPok: number[]; //per pokemon for Gen 1 enemy trainers
    currentPokemon: number;
    isEnemyTrainer = false;

    constructor(
        gen: psI.Generation,
        name: string,
        team: PokemonExt[],
        itemName?: string,
        itemNum?: number
    ) {
        this.name = name;
        this.gen = gen;
        this.team = team;
        this.itemName = itemName || '';
        this.itemNum = itemNum || 0;
        this.itemNumPerPok = [];

        if(this.gen.num==1) {
            for(let i=0; i < this.team.length; i++) {
                this.itemNumPerPok.push(this.itemNum);
            }
        }
        this.currentPokemon = 0;
    }

    reset() {
        // Can override for enemy and use super.reset()
        if(this.gen.num==1) {
            for(let i=0; i < this.team.length; i++) {
                this.itemNumPerPok.push(this.itemNum);
            }
        }
        this.currentPokemon = 0;
        for(let i=0; i < this.team.length; i++) {
            this.team[i].reset();
        }
    }
    
    // Return true if all the trainer's pokemon are fainted
    defeated() : boolean {
        for( const pok of  this.team ) {
            if(!pok.fainted()) return false;
        }
        return true;
    }

    getActiveMon() : PokemonExt {
        return this.team[this.currentPokemon];
    }

    chooseMove() : number {
        return 0;
    }
}
