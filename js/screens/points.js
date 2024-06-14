import { bufferContext, canvas, bufferCanvas, bufferW, bufferH, mousePos } from "./../ctr.js";

export class PointsScreen {
    // currentTime = 0;
    // hidden = false;

    constructor(position) {
        this.position = position;
    }

    update(delta) {
        // this.currentTime += delta;
        // if (this.currentTime > 1) {
        //     this.hidden = !this.hidden;
        //     this.currentTime = 0;
        // }
        // if (this.hidden) {
        //     this.currentTime += delta;
        // }
    }

    draw() {
        bufferContext.fillStyle = '#fff';
        bufferContext.font = '15px monospace';
        bufferContext.fillText(objects.points, this.position.x, this.position.y);
    }
}