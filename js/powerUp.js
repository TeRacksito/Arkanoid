import { bufferContext, canvas, bufferCanvas, bufferW, bufferH, mousePos } from "./ctr.js";
import { Pong } from "./ball.js";

export class PowerUp {
    currentTime = 0;
    static ballsSpawn = 2;

    constructor(x, y) {
        this.position = { x: x, y: y };
        this.velocity = { x: 0, y: 1 };
        this.radius = 3;
        this.color = '#f00';

    }

    collision() {

        for (let player of objects.player) {
            let distance = Math.sqrt(Math.pow(player.position.x - this.position.x, 2) + Math.pow(player.position.y - this.position.y, 2));
            if (distance < player.radius + this.radius) {
                let index = objects.powerUps.indexOf(this);
                if (index > -1) {
                    objects.powerUps.splice(index, 1);
                    console.log("PowerUp removed");

                    let ballsN = Math.min(10, objects.balls.length);
                    for (let i = 0; i < ballsN; i++) {
                        let pong = objects.balls[i];
                        let angle = Math.random() * Math.PI * 2;
                        let newPong = new Pong(pong.position.x, pong.position.y, pong.velocity.x, pong.velocity.y, pong.radius);
                        newPong.velocity.x = pong.velocity.x * Math.cos(angle) - pong.velocity.y * Math.sin(angle);
                        newPong.velocity.y = pong.velocity.x * Math.sin(angle) + pong.velocity.y * Math.cos(angle);
                        objects.balls.push(newPong);
                    }
                }
            }
        }
    }

    update(delta) {
        this.collision();
        this.currentTime += delta;
        if (this.currentTime > 1) {
            this.color = this.color === '#f00' ? '#0f0' : '#f00';
            this.currentTime = 0;
        }

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }



    draw() {
        bufferContext.fillStyle = this.color;
        bufferContext.beginPath();
        bufferContext.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        bufferContext.fill();
    }
}