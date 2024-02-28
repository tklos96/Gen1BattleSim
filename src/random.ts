export function getRandomByte() : number {
    return Math.floor( Math.random() * 256 );
}

export function getRandomOfList(l: number[]) : number {
    const num = Math.floor( Math.random() * l.length );
    return l[num];
}
