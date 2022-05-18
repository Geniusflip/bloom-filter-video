import { chunk, clone, sum } from 'lodash-es';
import { v4 } from 'uuid';
import * as fnv1a from '@sindresorhus/fnv1a';

const canvas = document.getElementById('canvas');
const ctx = (canvas as HTMLCanvasElement).getContext('2d');
const imgCanvas = document.getElementById('imgcanvas');
let imgCtx = (imgCanvas as HTMLCanvasElement).getContext('2d');

const loadImage = async (src: string) => {
    const imgCanvas = document.getElementById('imgcanvas');
    imgCtx = (imgCanvas as HTMLCanvasElement).getContext('2d');
    imgCtx.imageSmoothingEnabled = false;

    await new Promise((resolve, reject) => {
        try {
            const image = new Image();
            image.onload = () => {
                imgCtx.canvas.height = image.naturalHeight;
                imgCtx.canvas.width = image.naturalWidth;
                imgCtx.setTransform(1,0,0,1,0,0);

                imgCtx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
                resolve(true);
            };
            image.onerror = (e) => { reject(e); }
            image.src = src;
        } catch (err) {
            reject(err);
        }
    })
    return imgCtx;
}

const percent = 0.2;
const draw = (ctx: CanvasRenderingContext2D, item: any, col: number, row: number) => {
    ctx.fillStyle = `rgba(${ item[0]},${  item[1] },${  item[2]}, 1.0`;
    ctx.fillRect(col, row, 1, 1);
}

function swap(items:any, leftIndex: any, rightIndex: any){
    let temp = items[leftIndex];
    draw(ctx, items[leftIndex], leftIndex  % ctx.canvas.width, Math.floor(leftIndex /  ctx.canvas.width))
    draw(ctx, items[rightIndex], rightIndex  % ctx.canvas.width, Math.floor(rightIndex /  ctx.canvas.width))
    items[leftIndex] = items[rightIndex];
    items[rightIndex] = temp;
}

const compIndex = (index: number, items: any) => sum(items[index]);

function partition(items: any, left: any, right: any) {
    const pivotIndex = Math.floor((right + left) / 2);
    let pivot = compIndex(pivotIndex, items);
    let i = left; //left pointer
    let j = right; //right pointer
    while (i <= j) {
        while (compIndex(i, items) < pivot) { i++; }
        while (compIndex(j, items) > pivot) { j--; }
        if (i <= j) { swap(items, i, j); i++; j--; }
    }
    return i;
}

async function quickSort(items: any, left: any, right:any, intervalId: string) {
    var index: number;
    if (items.length > 1) {
        if (intervalId !== currentId) { return items; }
        index = partition(items, left, right);
        if (left < index - 1) { requestAnimationFrame(() => quickSort(items, left, index - 1, intervalId)); }
        if (index < right) { requestAnimationFrame(() => quickSort(items, index, right, intervalId)); }
    }
    return items;
}

let currentId: string;

const main = async () => {
    const video = document.createElement('video');
    video.src = './bird.webm';
    video.muted = true;
    video.addEventListener('loadeddata', () => {

        video.oncanplay = function() {
            video.play();
        };
    })
    let interval: NodeJS.Timer;
    // video.addEventListener('play', async () => {
    //     ctx.canvas.width = (video as HTMLVideoElement).videoWidth;
    //     ctx.canvas.height = (video as HTMLVideoElement).videoHeight;
    //     ctx.imageSmoothingEnabled = false;
    //     ctx.setTransform(1,0,0,1,0,0);
    //     imgCtx.canvas.width = (video as HTMLVideoElement).videoWidth;
    //     imgCtx.canvas.height = (video as HTMLVideoElement).videoHeight;
    //     imgCtx.imageSmoothingEnabled = false;
    //     imgCtx.setTransform(1,0,0,1,0,0);
    //     clearInterval(interval);
    //     interval = setInterval(async () => {
    //         let id = v4();
    //         currentId = id;
    //         imgCtx.drawImage(video as HTMLVideoElement, 0, 0, imgCtx.canvas.width, imgCtx.canvas.height);
    //         const imageData = imgCtx.getImageData(0,0, imgCtx.canvas.width, imgCtx.canvas.height).data;
    //         let pixelData = chunk(imageData as any, 4);
    //         pixelData = await quickSort(pixelData, 0, pixelData.length - 1, id);
    //     }, 100);
    // }, false);
    console.log('yo')
    video.addEventListener('play', () => {
        ctx.canvas.width = (video as HTMLVideoElement).videoWidth;
        ctx.canvas.height = (video as HTMLVideoElement).videoHeight;
        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(1,0,0,1,0,0);
        imgCtx.canvas.width = (video as HTMLVideoElement).videoWidth;
        imgCtx.canvas.height = (video as HTMLVideoElement).videoHeight;
        imgCtx.imageSmoothingEnabled = false;
        imgCtx.setTransform(1,0,0,1,0,0);
        clearInterval(interval);
        const bloomFilters = {
            r: new Map(),
            g: new Map(),
            b: new Map(),
        }
        interval = setInterval(async () => {
            imgCtx.drawImage(video as HTMLVideoElement, 0, 0, imgCtx.canvas.width, imgCtx.canvas.height);
            const imageData = imgCtx.getImageData(0,0, imgCtx.canvas.width, imgCtx.canvas.height).data;
            let pixeldata = chunk(imageData, 4);
            
            const len = Math.floor(pixeldata.length );
            const set = (map ,hash, value) => {
                if (map.has(hash)) {
                    // map.set(hash, Math.floor(map.get(hash)  +value) / 2));
                    // map.set(hash, Math.floor((map.get(hash)  +value) / 2));
                    map.set(hash, Math.max(map.get(hash), value));
                } else {
                    map.set(hash, value);
                }
            };
            pixeldata.forEach((data, i) => {
                set(bloomFilters.r, fnv1a(i.toString()) % len , data[0])
                set(bloomFilters.g, fnv1a(i.toString()) % len , data[1])
                set(bloomFilters.b, fnv1a(i.toString()) % len , data[2])
            });

            // const multiplier = Math.floor(Math.random() * 100)
            const multiplier = 1;
            pixeldata.forEach((data, i) => {
                draw(
                    ctx,
                    [
                        bloomFilters.r.get(fnv1a(data[0].toString()) % len) * multiplier % 255,
                        bloomFilters.g.get(fnv1a(data[1].toString()) % len) * multiplier % 255,
                        bloomFilters.b.get(fnv1a(data[2].toString()) % len) * multiplier % 255,
                        // bloomFilters.r[fnv1a(i.toString()) % len],
                        // bloomFilters.g[fnv1a(i.toString()) % len],
                        // bloomFilters.b[fnv1a(i.toString()) % len],
                        data[3]
                    ],
                    i % ctx.canvas.width,
                    Math.floor(i / ctx.canvas.width)
                );
            });
        },5);
    })
};

main();
