import * as ps from '@smogon/calc';
import * as psI from '@smogon/calc/dist/data/interface';
import {PokemonExt} from './pokemonExt';


export class Trainer {
    name: string;
    team: PokemonExt[];
    fainted: boolean[];
    itemName: string;
    itemNum: number[]; //per pokemon for Gen 1 enemy trainers
    currentPokemon: number;

    constructor(
        gen: psI.Generation,
        name: string,
        team: PokemonExt[],
        itemName?: string,
        itemNum?: number
    ) {
        this.name = name;
        this.team = team;
        this.itemName = itemName || '';
        this.itemNum = [];
        if(gen.num==1 && itemNum != undefined) {
            for(let i=0; i<this.team.length; i++) {
                this.itemNum.push(itemNum);
            }
        }
        this.currentPokemon = 0;
        this.fainted = [];
        for(let i=0; i<this.team.length; i++) {
            this.fainted.push(false);
        }
    }
}
