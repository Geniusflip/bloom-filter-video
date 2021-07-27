import { range } from 'lodash-es';

export const HEIGHT = window.innerHeight
export const WIDTH = window.innerHeight;

export const convertTileListToTileMap = (tiles: any, tileList: any, tileSize = 2) => {
    const newTileMap = JSON.parse(JSON.stringify(new Array(tiles.length * tileSize).fill(new Array(tiles[0].length * tileSize).fill('black'))));

    tiles.forEach((col: any[], colNum: number) => {
        col.forEach((row: number, rowNum: number) => {
            const tile = tiles[colNum][rowNum];

            const ids = tile.superposition;
            if (!ids.length) {
                for (let j of range(tileSize)) {
                    for (let k of range(tileSize)) {
                        newTileMap[(colNum * tileSize) + j ][(rowNum * tileSize) + k] = `rgba(0, 0, 0, 0}`;
                    }
                }
                return;
             };

            for (let j of range(tileSize)) {
                for (let k of range(tileSize)) {
                    const average = [0,0,0,0];
                    const count = [0,0,0,0];
                    ids.forEach((id: string) => {

                        const prototype = Object.values(tileList).find((x: any) => x.id === id) as any;
                        const colour =  prototype.data[j][k];
                        const getColour = (str: string, index: number) => parseInt( str.substring(5).split(',')[index]);
                        average[0] += getColour(colour, 0);
                        average[1] += getColour(colour, 1);
                        average[2] += getColour(colour, 2);
                        average[3] += getColour(colour, 3);
                        count[0]++;
                        count[1]++;
                        count[2]++;
                        count[3]++;
                    })
                    average[0] = average[0] / count[0];
                    average[1] = average[1] / count[1];
                    average[2] = average[2] / count[2];
                    average[3] = average[3] / count[3];
                    newTileMap[(colNum * tileSize) + j ][(rowNum * tileSize) + k] = `rgba(${average[0]},${average[1]},${average[2]},${average[3]}`;
                    // rgba(191,232,242,255)
                }
            }
            
            

            
            // ids.forEach((x: string) => {
            //     const prototype = Object.values(tileList).find((x: any) => x.id === id) as any;
            //     prototype.data.forEach((ptileCol: any, pTileColNum: number ) => {
            //         ptileCol.forEach((ptileRow: any, pTileRowNum: number ) => {
            //             console.log(ptileRow);
                        
            //         });
            //     });
                
            // });
            
        });
    });
    return newTileMap;
}

export const drawRect = (ctx: CanvasRenderingContext2D, color: string, top: number, left: number, width:number, height:number) => {
    ctx.fillStyle = color;
    ctx.fillRect(top, left, width, height);
}

export const drawTile = (ctx: CanvasRenderingContext2D, col: number, row: number, tm: any) => {
    const height = HEIGHT / tm[0].length;
    const width = WIDTH / tm.length;
    drawRect(ctx, tm[col][row], width * col, height * row, width, height);
}

export const iterateOnMap = (tm: any, ctx: CanvasRenderingContext2D, callback: (ctx: CanvasRenderingContext2D, colNum: number, rowNum: number, tm: any) => any) => {
    tm.forEach((col: any[], colNum: number) => {
        col.forEach((row: number, rowNum: number) => {
            callback(ctx, colNum, rowNum, tm);
        });
    });
}

// randomise
// iterateOnMap(tileMap, (ctx, col, row, tm) => tm[col][row] = Math.random() > 0.5 ?  'black' : 'white');