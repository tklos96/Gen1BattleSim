export function getRandomByte() : number {
    return Math.floor( Math.random() * 256 );
}

// Get random int less than num (exclusive)
export function getRandomInt(num: number) : number {
    return Math.floor( Math.random() * num );
}

export function getRandomOfList(l: number[]) : number {
    const num = Math.floor( Math.random() * l.length );
    return l[num];
}
