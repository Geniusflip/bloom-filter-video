import { HEIGHT, WIDTH, iterateOnMap, drawTile, convertTileListToTileMap } from './utils';
import { wfc, generateTileList } from './wfc'

const canvas = document.getElementById('canvas');
const ctx = (canvas as HTMLCanvasElement).getContext('2d');
ctx.imageSmoothingEnabled = false;
ctx.canvas.height = HEIGHT;
ctx.canvas.width = WIDTH;

const ROWS = 23, COLUMNS = 15;

ctx.setTransform(1,0,0,1,0,0);

const tileMap = JSON.parse(JSON.stringify(new Array(COLUMNS).fill(new Array(ROWS).fill(0))));



const loadImage = async (src: string) => {
    const imgCanvas = document.getElementById('imgcanvas');
    const imgCtx = (imgCanvas as HTMLCanvasElement).getContext('2d');
    imgCtx.imageSmoothingEnabled = false;
    imgCtx.canvas.height = HEIGHT;
    imgCtx.canvas.width = WIDTH;

    await new Promise((resolve, reject) => {
        try {
            const image = new Image();
            image.onload = () => {
                console.log(image.naturalHeight);
                imgCtx.canvas.height = image.naturalHeight;
                imgCtx.canvas.width = image.naturalWidth;
                imgCtx.setTransform(1,0,0,1,0,0);

                imgCtx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
                resolve(true);
            };
            image.onerror = (e) => reject(e);
            image.src = src;
        } catch (err) {
            reject(err);
        }
    })
    return imgCtx;
}

const sampleImage = (ctx1: CanvasRenderingContext2D, ctx2: CanvasRenderingContext2D) => {
    const TILEHEIGHT = ctx2.canvas.height / ROWS;
    const TILEWIDTH = ctx2.canvas.width / COLUMNS;
    console.log(TILEHEIGHT)
    tileMap.forEach((col: any[], colNum: number) => {
        col.forEach((row: number, rowNum: number) => {
            const imageData = ctx2.getImageData(TILEWIDTH * colNum, TILEHEIGHT * rowNum, TILEWIDTH, TILEHEIGHT);
            const average = [0,0,0,0];
            const count = [0,0,0,0];

            const fn = (i:number, n:number) => {
                average[i] += imageData.data[n];
                if (imageData.data[n] !== 0) {
                    count[i]++;
                }
            }
            for (let i = 0; i <= imageData.width; i += 4) {
                fn(0, i)
                fn(1, i + 1)
                fn(2, i + 2)
                fn(3, i + 3)
            }
            const avgData = new ImageData(1, 1);
    
            avgData.data[0] = average[0] / count[0];
            avgData.data[1] = average[1] / count[1];
            avgData.data[2] = average[2] / count[2];
            avgData.data[3] = average[3] / count[3];
            

            ctx1.putImageData(avgData, TILEWIDTH * colNum, TILEHEIGHT * rowNum, 0,0, 1,1);
            // ctx1.putImageData(imageData, TILEWIDTH * colNum, TILEHEIGHT * rowNum, 0,0, 1,1);
            
            // const pixel = ctx1.getImageData(TILEWIDTH * colNum, TILEHEIGHT * rowNum, 1, 1);
            // console.log(pixel);
            tileMap[colNum][rowNum] = `rgba(${avgData.data[0]},${avgData.data[1]},${avgData.data[2]},${avgData.data[3]})`
        });
    });
    // draw()
}



// imgCtx.clearRect(0, 0, WIDTH, HEIGHT);
// const colour = (val:number) => val ? 'black': 'white';
// let tileMap = [
//     [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1].map(x => colour(x)),
//     [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1].map(x => colour(x)),
//     [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1].map(x => colour(x)),
//     [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1].map(x => colour(x)),
//     [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1].map(x => colour(x)),
//     [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1].map(x => colour(x)),
//     [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map(x => colour(x)),
//     [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1].map(x => colour(x)),
//     [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1].map(x => colour(x)),
//     [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1].map(x => colour(x)),
//     [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1].map(x => colour(x)),
//     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1].map(x => colour(x)),
//     [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1].map(x => colour(x)),
//     [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1].map(x => colour(x)),
//     [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1].map(x => colour(x)),
//     [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map(x => colour(x)),
// ]
// let tileMap: any = [
//     ['black', 'green', 'green', 'black', 'black', 'green', 'green', 'black'],
//     ['yellow', 'white', 'white', 'yellow', 'yellow', 'white', 'white', 'yellow'],
//     ['yellow', 'white', 'white', 'yellow', 'yellow', 'white', 'white', 'yellow'],
//     ['black', 'green', 'green', 'black', 'black', 'green', 'green', 'black'],
//     ['black', 'green', 'green', 'black', 'black', 'green', 'green', 'black'],
//     ['yellow', 'white', 'white', 'yellow', 'yellow', 'white', 'white', 'yellow'],
//     ['yellow', 'white', 'white', 'yellow', 'yellow', 'white', 'white', 'yellow'],
//     ['black', 'green', 'green', 'black', 'black', 'green', 'green', 'black'],
// ]
(async () => {
    const imgCtx = await loadImage('Flowers.png');
    sampleImage(ctx, imgCtx);

    const tileSize = 2;
    const tileList = generateTileList(tileMap, tileSize);

    iterateOnMap(tileMap, ctx, drawTile)
    const tiles = await wfc(tileList, 16, 16, tileSize)
    console.log(tiles);
    const newTileMap = convertTileListToTileMap(tiles, tileList, tileSize);
    console.log('done');
    // iterateOnMap(newTileMap, ctx, drawTile)
}) ()
