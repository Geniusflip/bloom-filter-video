import { v4 } from 'uuid';
import { convertTileListToTileMap, drawTile, HEIGHT, iterateOnMap, WIDTH } from './utils';


const genCanvas = document.getElementById('generated');
const genCtx = (genCanvas as HTMLCanvasElement).getContext('2d');
genCtx.imageSmoothingEnabled = false;
genCtx.canvas.height = HEIGHT;
genCtx.canvas.width = WIDTH;

genCtx.setTransform(1,0,0,1,0,0);

const clone = (obj:any) => JSON.parse(JSON.stringify(obj));
const getValidNeighbours = (tileIds: string[], tileList: any) => {
    const validNeighbours: any = {
        l: [],
        tl:[],
        t: [],
        tr: [],
        r: [],
        b: [],
        br: [],
        bl: [],
    };
    
    [...new Set(tileIds)].forEach(id => {
        const prototype = Object.values(tileList).find((x: any) => x.id === id);
        Object.entries((prototype as any).neighbors).forEach(([key, value]) => {
            validNeighbours[key] = validNeighbours[key].concat(value);
        })
    });
    return validNeighbours;
}

const getNeighbourList = (x: number, y: number ) => ({
    l: [x - 1, y],
    tl: [x - 1, y - 1],
    t: [x, y - 1],
    tr: [x + 1, y - 1],
    r: [x + 1, y],
    b: [x, y + 1],
    br: [x + 1, y + 1],
    bl: [x - 1, y + 1],
});

const propogate = async (x: number, y: number, tileMap: any, tileList: any, tileSize: number) => {
    const getNeighbourTile = (x: number, y: number) => {
        if (x >= tileMap.length ||  y >= tileMap[0].length || x < 0 ||  y < 0 ) { return undefined }
        return getTile(tileMap, 1, x, y)[0][0];
    }
    const stack = [{ x, y }];
    let iterations = 0
    while (stack.length > 0 && iterations < 10) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        iterations++;
        const coords = stack.pop();
        const currentTile = getNeighbourTile(coords.x, coords.y);
        let validTileNeighbours = getValidNeighbours([...new Set(currentTile.superposition)] as string[], tileList);
        iterateOnMap(convertTileListToTileMap(tileMap, tileList, tileSize), genCtx, drawTile)
        if (currentTile.superposition.length === 0) {
            validTileNeighbours = getValidNeighbours(Object.values(tileList).map((x: any) => x.id,), tileList);
        }
        for (let [direction, directionCoord] of Object.entries(getNeighbourList(coords.x, coords.y))) {

            const neighbourTile = getNeighbourTile(directionCoord[0], directionCoord[1]);
            if (neighbourTile) {
                const originalSuperpostion = clone(neighbourTile.superposition);
                const originalSuperpostionLength = neighbourTile.superposition.length;
                if (originalSuperpostionLength !== 1 ) {

                    neighbourTile.superposition = neighbourTile.superposition
                        .filter((id: string) => validTileNeighbours[direction].includes(id));
                } 

                // if (neighbourTile.superposition.length === 0 ) {
                //     neighbourTile.superposition = Object.values(tileList).map((x: any) => x.id);
                // }
                // console.log(direction, currentTile, neighbourTile.superposition, validTileNeighbours[direction])
                if (originalSuperpostionLength !== neighbourTile.superposition.length && !neighbourTile.superposition.length) {
                    // console.log('Changed position of: ',
                    //     clone(neighbourTile), originalSuperpostion,
                    //     ' using valid neighbours of: ',
                    //     clone(currentTile),
                    //     direction,
                    //     clone(validTileNeighbours[direction])
                    // );
                    stack.push({ x: neighbourTile.x, y: neighbourTile.y });
                }
            }

        }
    }
}

const wfc = async (tileList: any, colNum: number = 4, rowNum: number = 4, tileSize: number = 2) => {
    const tileMap: any = new Array(colNum).fill('').map((n, x) =>
        new Array(rowNum).fill('').map( (_, y) => {
            return {
                x,
                y,
                superposition: Object.values(tileList).map((tile: any) => tile.id)
            }
        })
    )
    let iterations = 0;
    while (!tileMap.flatMap((x: any) => x).every((x: any) => x.superposition.length <= 1) && iterations < 100) {
        iterations++;
        // console.log(tileMap.flatMap((x: any)=> x).map((x: any) => x.superposition.length))
        const smallestSuperPositionAmount = tileMap.flatMap((x: any) => x)
            .filter((x: any) => x.superposition.length > 1)
            .sort((a: any, b: any) => a.superposition.length < b.superposition.length ? 1 : -1 )[0].superposition.length;

        const setOfSmallest = tileMap.flatMap((x: any) => x).filter((x: any) => x.superposition.length === smallestSuperPositionAmount);
        // const smallestSuperPositionTile = setOfSmallest[Math.floor(Math.random() * setOfSmallest.length)];
        const smallestSuperPositionTile = setOfSmallest.pop();
        // collapse to random position
        // console.log(smallestSuperPositionTile)
        smallestSuperPositionTile.superposition = [
            smallestSuperPositionTile.superposition[Math.floor(Math.random() * smallestSuperPositionTile.superposition.length)],
        ];
        await propogate(smallestSuperPositionTile.x, smallestSuperPositionTile.y, tileMap, tileList, tileSize);
    }


    return tileMap;

}

const getTile = (tm: any, tileSize: number, x: number, y: number) => {
    const tile = [];
    for( let m = 0; m < tileSize; m++) {
        let tmp = [];
        for( let n = 0; n < tileSize; n++) {
            tmp.push(tm[x + m][y + n])
        }
        tile.push(tmp)
    }
    return tile;
}

function generateTileList(tm: any, tileSize: number = 2): any {
    const colSize = tm.length;
    const rowSize = tm[0].length;

    const list = [];
    for(let j = 0; j < colSize; j += 1) {
        for(let k = 0; k < rowSize; k += 1) {
            // not out of bounds
            if (!(j + tileSize > colSize ||  k + tileSize > rowSize) ) {
                let tile = getTile(tm, tileSize, j, k);
                list.push({ data: tile, x: j , y : k });
            }
        }
    }
    // get unique tile prototypes.
    const uniqueTiles = Array.from(new Set(list.map( x => JSON.stringify(x)))).map(x => JSON.parse(x));

    const prototypeTileMap = uniqueTiles.reduce(( sum, curr ) => {
        sum[JSON.stringify(curr.data)] = {
            ...curr,
            id: v4(),
            neighbors: {
                l: [],
                tl: [],
                t: [],
                tr: [],
                r: [],
                br: [],
                b: [],
                bl: [],
            }
        };
        return sum;
    }, {})
    // console.log(prototypeTileMap);
    // find neighbors
    const getNeighbour = (x: number, y: number) => {
        if (x + tileSize > colSize ||  y + tileSize > rowSize || x < 0 || y < 0 ) { return undefined }
        return getTile(tm, tileSize, x, y);
    }
    for(let j = 0; j < colSize; j += 1) { // x
        for(let k = 0; k < rowSize; k += 1) { // y
            if (!(j + tileSize > colSize ||  k + tileSize > rowSize) ) {
                let compTile = getTile(tm, tileSize, j, k);
                const prototype = prototypeTileMap[JSON.stringify(compTile)];
                // const right = getNeighbour(j + tileSize, k);
                // console.log(prototype, (prototypeTileMap[JSON.stringify(right)] || {}).id)
                const populateNeighbor = (label: string, x: number, y: number) => {
                    const neighbour = getNeighbour(x, y);
                    if (neighbour) {
                        prototype.neighbors[label].push(prototypeTileMap[JSON.stringify(neighbour)].id);
                    }
                }
                populateNeighbor('l', j - tileSize, k);
                populateNeighbor('tl', j - tileSize, k - tileSize);
                populateNeighbor('t', j, k - tileSize);
                populateNeighbor('tr', j + tileSize, k - tileSize);
                populateNeighbor('r', j + tileSize, k);
                populateNeighbor('b', j, k + tileSize);
                populateNeighbor('br', j + tileSize, k + tileSize);
                populateNeighbor('bl', j - tileSize, k + tileSize);
            }
        }
    }
    return prototypeTileMap;
}

export { wfc, generateTileList }