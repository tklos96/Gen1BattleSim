import * as psI from '@smogon/calc/dist/data/interface';
import {PokemonExt} from './pokemonExt';
import {getRandomInt,getRandomByte} from './random';


export abstract class Trainer {
    name: string;
    gen: psI.Generation;
    team: PokemonExt[];
    currentPokemon: number;
    isAITrainer = false;

    constructor(
        gen: psI.Generation,
        name: string,
        team: PokemonExt[]
    ) {
        this.name = name;
        this.gen = gen;
        this.team = team;

        this.currentPokemon = 0;
    }

    reset() {
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

    abstract chooseMove(enemy: Trainer) : number;

    // Implemented only for AI Trainers
    useItem() : boolean {
        return false;
    }
}

export class AITrainer extends Trainer {
    item: string;
    itemNum: number;
    itemNumPerPok: number[]; //per pokemon for Gen 1 enemy trainers
    isAITrainer = true;

    constructor(
        gen: psI.Generation,
        name: string,
        team: PokemonExt[],
        options: {
            item?: string,
            itemNum?: number
        } = {}
    ) {
        super(gen,name,team);

        this.item = options.item || '';
        this.itemNum = options.itemNum || 0;
        this.itemNumPerPok = [];
        for(let i=0; i < this.team.length; i++) {
            this.itemNumPerPok.push(this.itemNum);
        }
    }

    reset() {
        super.reset();
        this.itemNumPerPok = [];
        for(let i=0; i < this.team.length; i++) {
            this.itemNumPerPok.push(this.itemNum);
        }
    }

    // AI move choice algorithm
    chooseMove(enemy: Trainer) : number {
        let choice = 0;

        // Choose randomly
        choice = getRandomInt(this.getActiveMon().moves.length);

        return choice;
    }

    useItem() : boolean {
        if(this.itemNumPerPok[this.currentPokemon]>0) {
            if( getRandomByte() < 64 ) {
                this.itemNumPerPok[this.currentPokemon]--;

                if(this.item == 'XSpeed') {
                    this.team[this.currentPokemon].applyStatModifier('spe',1);
                }

                return true;
            }
        }

        return false;
    }
}
