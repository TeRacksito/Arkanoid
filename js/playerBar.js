import { GameLoop } from "./core.js";
import { bufferContext, canvas, bufferCanvas, bufferW, bufferH, mousePos } from "./ctr.js";
import { Playable } from "./test.js";

export class PlayerBar extends Playable {
    width = 30;
    height = 5;
    auto;

    constructor(x, y, sx, sy, auto = false) {
        super(x, y, sx, sy);

        this.auto = auto;

        this.corners = {
            topLeft: { x: this.position.x - this.width / 2, y: this.position.y - this.height / 2 },
            topRight: { x: this.position.x + this.width / 2, y: this.position.y - this.height / 2 },
            bottomLeft: { x: this.position.x - this.width / 2, y: this.position.y + this.height / 2 },
            bottomRight: { x: this.position.x + this.width / 2, y: this.position.y + this.height / 2 }
        }

        this.radius = Math.sqrt(Math.pow(this.width / 2, 2) + Math.pow(this.height / 2, 2));
    }

    closestCorner(position) {
        let closest = { corner: null, distance: Infinity };
        for (let corner in this.corners) {
            if (corner.startsWith("bottom")) continue;
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


    closestBall() {
        let closest = { ball: null, distance: Infinity };
        objects.balls.forEach(ball => {
            let distance = Math.sqrt(Math.pow(ball.position.x - this.position.x, 2) + Math.pow(ball.position.y - this.position.y, 2));
            if (distance < closest.distance) {
                closest.ball = ball;
                closest.distance = distance;
            }
        });

        return closest.ball;
    }

    worstBall() {
        let worst = { ball: null, distance: 0 };
        objects.balls.forEach(ball => {
            if (ball.velocity.y > 0 && ball.position.y < this.position.y && ball.position.y > worst.distance) {
                worst.ball = ball;
                worst.distance = ball.position.y;
            }
        });
        return worst.ball;
    }

    autoFollow() {
        let ball = this.worstBall();
        if (ball == null) {
            ball = this.closestBall();
        }

        if (ball == null) {
            return false;
        }
        let vector = { x: (ball.position.x - this.position.x) / 3, y: (ball.position.y - this.position.y) / 3 };

        // this.velocity.x = vector.x;
        this.position.x = ball.position.x;

        return true;
    }

    update(delta) {
        if (this.auto) {
            if (!this.autoFollow()) {
                GameLoop.addRandomPong();
            }
        }
        this.position.x += this.velocity.x;

        if (!this.auto) {
            let vector = { x: (mousePos.x - this.position.x) / 1, y: (mousePos.y - this.position.y) / 1 };

            this.velocity.x = vector.x;
        }

        if (this.position.x - this.width / 2 < 0) {
            this.position.x = 0 + this.width / 2;
            this.velocity.x = 0;
        } else if (this.position.x + this.width / 2 > 320) {
            this.position.x = 320 - this.width / 2;
            this.velocity.x = 0;
        }

        if (this.position.y - this.height / 2 < 0) {
            this.position.y = 0 + this.height / 2;
            this.velocity.y = 0;
        } else if (this.position.y + this.height / 2 > 240) {
            this.position.y = 240 - this.height / 2;
            this.velocity.y = 0;
        }



        this.corners = {
            topLeft: { x: this.position.x - this.width / 2, y: this.position.y - this.height / 2 },
            topRight: { x: this.position.x + this.width / 2, y: this.position.y - this.height / 2 },
            bottomLeft: { x: this.position.x - this.width / 2, y: this.position.y + this.height / 2 },
            bottomRight: { x: this.position.x + this.width / 2, y: this.position.y + this.height / 2 }
        }
    }

    draw() {

        // bufferContext.fillStyle = '#00F';
        // bufferContext.beginPath();
        // bufferContext.arc(this.position.x , this.position.y, this.radius , 0, 2 * Math.PI);
        // bufferContext.fill();

        bufferContext.fillStyle = '#fff';
        bufferContext.fillRect(this.position.x - this.width / 2, this.position.y - this.height / 2, this.width, this.height);
    }
}