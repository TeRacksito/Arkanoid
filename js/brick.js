import { bufferContext, canvas, bufferCanvas, bufferW, bufferH, mousePos } from "./ctr.js";
import { PowerUp } from "./powerUp.js";

export class Brick {
    constructor(x, y, width, height, color = '#fff', startTime = 0) {
        this.position = { x: x, y: y };
        this.velocity = { x: 0, y: 0 };
        this.width = width;
        this.height = height;
        this.radius = this.width / 2 + this.height / 2;
        this.color = color;
        this.startTime = startTime;

        this.corners = {
            topLeft: { x: this.position.x - this.width / 2, y: this.position.y - this.height / 2 },
            topRight: { x: this.position.x + this.width / 2, y: this.position.y - this.height / 2 },
            bottomLeft: { x: this.position.x - this.width / 2, y: this.position.y + this.height / 2 },
            bottomRight: { x: this.position.x + this.width / 2, y: this.position.y + this.height / 2 }
        }
    }

    closestCorner(position) {
        let closest = { corner: null, distance: Infinity };
        for (let corner in this.corners) {
            let distance = Math.sqrt(Math.pow(this.corners[corner].x - position.x, 2) + Math.pow(this.corners[corner].y - position.y, 2));
            if (distance < closest.distance) {
                closest.corner = corner;
                closest.distance = distance;
            }
        }

        return closest.corner;
    }

    closestSides(position) {
        let sides = [];

        for (let corner in this.corners) {
            let distance = Math.sqrt(Math.pow(this.corners[corner].x - position.x, 2) + Math.pow(this.corners[corner].y - position.y, 2));
            sides.push({ corner: this.corners[corner], distance: distance })
        }

        sides.sort((a, b) => a.distance - b.distance);
        return sides.slice(0, 3).map(side => side.corner);
    }

    break() {
        let index = objects.blocks.indexOf(this);
        if (index > -1) {
            objects.blocks.splice(index, 1);
            console.log("Brick removed");
            objects.points += 1;
        }

        let random = Math.random();
        if (random < 0.1) {
            objects.powerUps.push(new PowerUp(this.position.x, this.position.y));
        }
    }

    draw() {
        // bufferContext.fillStyle = '#040';
        // bufferContext.beginPath();
        // bufferContext.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        // bufferContext.fill();

        if (this.startTime > 0) {
            this.startTime -= 1;
            return;
        }


        bufferContext.fillStyle = this.color;
        bufferContext.fillRect(this.position.x - this.width / 2, this.position.y - this.height / 2, this.width, this.height);


    }
}