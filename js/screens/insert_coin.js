import { bufferContext, canvas, bufferCanvas, bufferW, bufferH, mousePos } from "./../ctr.js";

export class InsertCoinScreen {
    currentTime = 0;
    hidden = false;

    update(delta) {
        this.currentTime += delta;
        if (this.currentTime > 1) {
            this.hidden = !this.hidden;
            this.currentTime = 0;
        }
        if (this.hidden) {
            this.currentTime += delta;
        }
    }

    draw() {
        if (!this.hidden) {
            bufferContext.fillStyle = '#fff';
            bufferContext.font = '15px monospace';
            bufferContext.fillText('-- INSERT COIN --', bufferW/2, bufferH/2);
        }
    }
}