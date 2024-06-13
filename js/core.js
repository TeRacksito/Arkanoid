import { bufferContext, canvas, bufferCanvas, bufferW, bufferH, mousePos } from "./ctr.js";
import { InsertCoinScreen } from "./screens/insert_coin.js";
import { PlayerBar } from "./playerBar.js";
import { Brick } from "./brick.js";
import { Pong } from "./test.js";

export class GameLoop {

    static nextSpawn = 0;
    static cooldown = 0;

    static init() {
        // this.pongArray = new PongArray();
        // objects.balls.push(new Pong(160, 140, 0, 1, 5));
        // objects.balls.push(new Pong(130, 140, 0, 1, 5));
        // for (let i = 0; i < 100; i++) {
        // let pong = new Pong(160, 120, 0, 3, 2.5);
        // let angle = Math.random() * Math.PI * 2;
        // let temp = { x: pong.velocity.x, y: pong.velocity.y };
        // pong.velocity.x = temp.x * Math.cos(angle) - temp.y * Math.sin(angle);
        // pong.velocity.y = temp.x * Math.sin(angle) + temp.y * Math.cos(angle);
        // objects.balls.push(pong);
        // }
        // objects.interface.push(new InsertCoinScreen());
        objects.player.push(new PlayerBar(0, 220, 0, 0, false));
        // let player2 = new PlayerBar(0, 0, 0);
        // player2.position.y = 160;
        // objects.player.push(player2);
        // let player3 = new PlayerBar(0, 0, 0);
        // player3.position.y = 120;
        // objects.player.push(player3);
        // objects.balls.push(new Pong(200, 70, 2, 0.3, 5));
        // for (let i = 0.0; i < 1; i += 1/1000) {
        //     objects.balls.push(new Pong(200, 70, 1, i, 5));
        // }
        // let odds = true;
        // let min = Math.PI*3/2;
        // let max = Math.PI*5/2;
        // for (let i = min; i < max; i += (max - min)/1000) {
        //     let pong = new Pong(160, 0, 0, 10, 5);

        //     //random color
        //     pong.color = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;

        //     let temp = { x: pong.velocity.x, y: pong.velocity.y };
        //     pong.velocity.x = temp.x * Math.cos(i) - temp.y * Math.sin(i);
        //     pong.velocity.y = temp.x * Math.sin(i) + temp.y * Math.cos(i);
        //     objects.balls.push(pong);
        // }

        // objects.balls.push(new Pong(160, 20, 0, 1, 5)); 
        // objects.balls.push(new Pong(160, 180, 0, -1, 5)); // vertical collision
        // objects.balls.push(new Pong(20, 120, 1, 0, 5)); // horizontal collision
        // objects.balls.push(new Pong(150, 150, 1, -1, 5)); // corner collision
        // pong = new Pong(160, 120, 2, 1, 5);
        // objects.balls.push(pong);

        // for (let i = 0; i < 200; i++) {
        //     let pong = new Pong(150, 160, 0, 3, 5);
        //     let angle = Math.random() * Math.PI * 2;
        //     let temp = { x: pong.velocity.x, y: pong.velocity.y };
        //     pong.velocity.x = temp.x * Math.cos(angle) - temp.y * Math.sin(angle);
        //     pong.velocity.y = temp.x * Math.sin(angle) + temp.y * Math.cos(angle);
        //     objects.balls.push(pong);
        // }

        objects.balls.push(new Pong(160, 120, 5, -5, 5));

        // objects.blocks.push(new Brick(92, 100, 10, 10));
        // objects.blocks.push(new Brick(108, 100, 10, 10));

        // objects.balls.push(new Pong(125, 125, 5, 5, 5));

        // objects.blocks.push(new Brick(100, 150, 20, 10));
        // objects.blocks.push(new Brick(180, 100, 10, 10));

        let minX = 30;
        let maxX = 280;
        let cols = 20;
        let rows = 10;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let x = minX + (maxX - minX) / cols * i + (rows - j) % 2 * 10;
                let y = 20 + 7 * j;
                let brick = new Brick(x, y, 10, 4);
                objects.blocks.push(brick);
            }
        }

        // let brick = new Brick(160, 120, 20, 10);
        // objects.blocks.push(brick);

    }

    static update(delta) {

        // if (this.nextSpawn < 0) {
        //     let pong = new Pong(160, 120, 0, 3, Math.random() * 10 + 2);
        //     let angle = Math.random() * Math.PI * 2;
        //     let temp = { x: pong.velocity.x, y: pong.velocity.y };
        //     pong.velocity.x = temp.x * Math.cos(angle) - temp.y * Math.sin(angle);
        //     pong.velocity.y = temp.x * Math.sin(angle) + temp.y * Math.cos(angle);
        //     objects.balls.push(pong);
        //     this.nextSpawn = 10;
        //     console.log(objects.balls.length);
        // }
        // this.nextSpawn -= delta;

        objects.blocks.forEach(object => {
            object.draw();
        });

        objects.balls.forEach(object => {
            if (this.cooldown <= 0) {
                object.update(delta);
            }
            object.draw();
        });

        objects.player.forEach(object => {
            if (this.cooldown <= 0) {
                object.update(delta);
            }
            object.draw();
        });

        objects.interface.forEach(object => {
            if (this.cooldown <= 0) {
                object.update(delta);
            }
            object.draw();
        });

        if (this.cooldown <= 0) {
            this.cooldown = 0.00;
        }
        this.cooldown -= delta;

        // this.pongArray.update(delta);
    }

    static addRandomPong() {
        let pong = new Pong(160, 120, 0, 3, Math.random() * 10 + 2);
        let angle = Math.random() * Math.PI * 2;
        let temp = { x: pong.velocity.x, y: pong.velocity.y };
        pong.velocity.x = temp.x * Math.cos(angle) - temp.y * Math.sin(angle);
        pong.velocity.y = temp.x * Math.sin(angle) + temp.y * Math.cos(angle);
        objects.balls.push(pong);
    }
}