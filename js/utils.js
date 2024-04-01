import {canvas, bufferW, bufferH} from './ctr.js';

export function scaleFormula(x, minPro, maxPro, maxFact, curve) {
    return maxPro * Math.pow(2, Math.pow((x / maxFact), curve)) - maxPro + minPro * (2 - Math.pow(2, Math.pow((x / maxFact), curve)));
}

export function posToCanvas(x, y) {
    let padding = 0;
    let newX = padding + (x*bufferW + padding * 2) / canvas.width;
    let newY = padding + (y*bufferH + padding * 2) / canvas.height;
    return {x: newX, y: newY};
}