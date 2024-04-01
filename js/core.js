import { bufferContext, canvas, bufferCanvas, bufferW, bufferH, mousePos } from "./ctr.js";
import { InsertCoinScreen } from "./screens/insert_coin.js";
import { PlayerBar } from "./playerBar.js";
import { Pong } from "./test.js";

export class GameLoop {

    nextSpawn = 0;

    constructor() {
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
        objects.interface.push(new InsertCoinScreen());
        objects.player.push(new PlayerBar(0, 0, 0));
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
        let odds = true;
        let min = Math.PI*3/2;
        let max = Math.PI*5/2;
        for (let i = min; i < max; i += (max - min)/1000) {
            let pong = new Pong(160, 0, 0, 10, 5);
            
            //random color
            pong.color = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;

            let temp = { x: pong.velocity.x, y: pong.velocity.y };
            pong.velocity.x = temp.x * Math.cos(i) - temp.y * Math.sin(i);
            pong.velocity.y = temp.x * Math.sin(i) + temp.y * Math.cos(i);
            objects.balls.push(pong);
        }
        
    }

    update(delta) {

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

        objects.balls.forEach(object => {
            object.update(delta);
            object.draw();
        });

        objects.player.forEach(object => {
            object.update(delta);
            object.draw();
        });

        objects.interface.forEach(object => {
            object.update(delta);
            object.draw();
        });

        // this.pongArray.update(delta);
    }
}