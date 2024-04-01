import { bufferContext, canvas, bufferCanvas, bufferW, bufferH, mousePos } from "./ctr.js";

export class Playable {
    constructor(x, y, sx, sy) {
        this.position = { x: x, y: y };
        this.velocity = { x: sx, y: sy };
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

export class Pong extends Playable {

    colliding = false;
    color = "#fff"

    constructor(x, y, sx, sy, radius) {
        super(x, y, sx, sy);
        this.radius = radius;
    }

    getAngle() {
        return Math.atan2(this.velocity.y, this.velocity.x);
    }

    limitHorizontalDeviation(angle, newAngle, deviation = 0) {
        if (newAngle === undefined) {
            newAngle = angle - deviation;
        }

        let positive = angle >= 0;

        // if (Math.cos(newAngle) < Math.cos(Math.PI / 6)) {
        //     deviation = - angle + Math.PI / 6;
        //     console.log("Limiting deviation to 30 degrees");
        // } else if (Math.cos(newAngle) > Math.cos(5 * Math.PI / 6)) {
        //     deviation = - 5 * Math.PI / 6 + angle;
        //     console.log("Limiting deviation to 150 degrees");
        // }

        if (Math.abs(newAngle) < (Math.PI / 6)) {
            if (positive) {
                deviation = -angle + Math.PI / 6;
            } else {
                deviation = -angle - Math.PI / 6;
            }
        } else if (Math.abs(newAngle) > (5 * Math.PI / 6)) {
            if (positive) {
                deviation =- angle + 5 * Math.PI / 6;
            } else {
                deviation = -angle - (5 * Math.PI / 6);
            }
        }

        // console.log(
        //     "angle", (angle * (180 / Math.PI)).toFixed(2),
        //     angle.toFixed(2),
        //     "\ndeviation", (deviation * (180 / Math.PI)).toFixed(2),
        //     deviation.toFixed(2),
        //     "\nnewAngle", (newAngle * (180 / Math.PI)).toFixed(2),
        //     newAngle.toFixed(2)
        // );

        return deviation;
    }

    collision() {
        // for (let pong of objects.balls) {
        //     if (pong != this) {
        //         let distance = Math.sqrt(Math.pow(pong.position.x - this.position.x, 2) + Math.pow(pong.position.y - this.position.y, 2));
        //         if (distance < this.radius + pong.radius) {
        //             let angle = Math.atan2(pong.position.y - this.position.y, pong.position.x - this.position.x);
        //             let overlap = this.radius + pong.radius - distance;
        //             this.position.x -= overlap * Math.cos(angle);
        //             this.position.y -= overlap * Math.sin(angle);
        //             pong.position.x += overlap * Math.cos(angle);
        //             pong.position.y += overlap * Math.sin(angle);
        //             let temp = { x: this.velocity.x, y: this.velocity.y };
        //             this.velocity.x = pong.velocity.x;
        //             this.velocity.y = pong.velocity.y;
        //             pong.velocity.x = temp.x;
        //             pong.velocity.y = temp.y;
        //         }
        //     }
        // }

        if (this.velocity.y < 0) {
            return;
        }

        // for (let player of objects.player) {
        //     let distance = Math.sqrt(Math.pow(player.position.x - this.position.x, 2) + Math.pow(player.position.y - this.position.y, 2));
        //     if (distance < this.radius + player.height/2) {
        //         let angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
        //         let overlap = this.radius + player.height/2 - distance;
        //         this.position.x -= overlap * Math.cos(angle);
        //         this.position.y -= overlap * Math.sin(angle);
        //         let temp = {x: this.velocity.x, y: this.velocity.y};
        //         this.velocity.x = -temp.x;
        //         this.velocity.y = -temp.y;
        //     }
        // }

        for (let player of objects.player) {

            let totalDistance = Math.sqrt(Math.pow(player.position.x - this.position.x, 2) + Math.pow(player.position.y - this.position.y, 2));
            if (totalDistance > this.radius + player.radius) {
                this.colliding = false;
                continue;
            }

            if (this.colliding) {
                // console.log("colliding");
                continue;
            }

            if (this.position.y < player.position.y && this.position.x < (player.position.x + player.width / 2 + 1) && this.position.x > (player.position.x - player.width / 2 - 1)) {
                let distance = Math.abs(this.position.y - player.position.y);
                if (distance < this.radius + player.height / 2) {
                    let overlap = this.radius + player.height / 2 - distance;
                    this.position.y -= overlap;
                    this.velocity.y *= -1;
                    let deviation = 0;
                    if (player.velocity.x > 0) {
                        deviation = Math.pow(Math.E, -(1 / player.velocity.x)) / 2;
                    } else if (player.velocity.x < 0) {
                        deviation = -Math.pow(Math.E, -(1 / -player.velocity.x)) / 2;
                    }

                    // console.log("deviation", deviation, player.velocity.x);

                    deviation += 1/3 * ((this.position.x - player.position.x)/(player.width/2));

                    let angle = this.getAngle();

                    let newAngle = angle + deviation;

                    let newDeviation = this.limitHorizontalDeviation(angle, newAngle, deviation);

                    // console.log(newAngle, newAngle * (180 / Math.PI));



                    // if (newAngle < Math.PI / 6) {
                    //     deviation = - angle + Math.PI / 6;
                    //     // console.log("Limiting deviation to 30 degrees");
                    // } else if (newAngle > 5 * Math.PI / 6) {
                    //     deviation = - 5 * Math.PI / 6 + angle;
                    //     // console.log("Limiting deviation to 150 degrees");
                    // }


                    this.rotate(newDeviation);

                    let tempAngle = this.getAngle();

                    // console.log(
                    //     "angle", (angle * (180 / Math.PI)).toFixed(2),
                    //     angle.toFixed(2),
                    //     "\ndeviation", (deviation * (180 / Math.PI)).toFixed(2),
                    //     deviation.toFixed(2),
                    //     "\nnewDeviation", (newDeviation * (180 / Math.PI)).toFixed(2),
                    //     newDeviation.toFixed(2),
                    //     "\nnewAngle", (newAngle * (180 / Math.PI)).toFixed(2),
                    //     newAngle.toFixed(2),
                    //     "\ntempAngle", (tempAngle * (180 / Math.PI)).toFixed(2),
                    //     tempAngle.toFixed(2)
                    // );

                    // let temp = { x: this.velocity.x, y: this.velocity.y };
                    // temp.x = this.velocity.x * Math.cos(deviation) - this.velocity.y * Math.sin(deviation);
                    // temp.y = this.velocity.x * Math.sin(deviation) + this.velocity.y * Math.cos(deviation);

                    // this.velocity.x = temp.x;
                    // this.velocity.y = temp.y;


                    this.colliding = true;
                }


            } else if (this.position.y < (player.position.y + player.height / 2) && this.position.y > (player.position.y - player.height / 2)) {
                // console.log("doingit");
                let distance = Math.abs(this.position.x - player.position.x);
                if (distance < this.radius + player.width / 2) {
                    // let overlap = this.radius + player.width / 2 - distance;
                    // this.position.x -= overlap;
                    this.velocity.x = -this.velocity.x + player.velocity.x
                    // this.velocity.x += player.velocity.x;
                    this.colliding = true;
                }
            }
            else {
                let cornerName = player.closestCorner(this.position);
                let corner = player.corners[cornerName];

                let distance = Math.sqrt(Math.pow(corner.x - this.position.x, 2) + Math.pow(corner.y - this.position.y, 2));
                if (distance < this.radius) {
                    let angle = Math.atan2(corner.y - this.position.y, corner.x - this.position.x);
                    let overlap = this.radius - distance;
                    this.position.x -= overlap * Math.cos(angle);
                    this.position.y -= overlap * Math.sin(angle);

                    let xVelocity = this.velocity.x;

                    let q = - (2 * ((xVelocity) * (this.position.x - corner.x) + this.velocity.y * (this.position.y - corner.y))) / (Math.pow(this.radius, 2));

                    this.velocity.x += q * (this.position.x - corner.x);
                    this.velocity.y += q * (this.position.y - corner.y);
                    this.velocity.y = -Math.abs(this.velocity.y);
                    this.colliding = true;
                    // pausecomp(400);
                }
            }
        }
    }

    update(delta) {
        
        let maxSpeed = this.radius;
        this.velocity.x = Math.min(maxSpeed, Math.max(-maxSpeed, this.velocity.x));
        this.velocity.y = Math.min(maxSpeed, Math.max(-maxSpeed, this.velocity.y));
        super.update();
        this.collision();

        // this.velocity.x = Math.min(2, Math.max(-2, this.velocity.x));
        // this.velocity.y = Math.min(2, Math.max(-2, this.velocity.y));

        // this.velocity.x *= 10001/10000;
        // this.velocity.y *= 10001/10000;

        // console.log(this.velocity.x, this.velocity.y);

        if (this.position.x - this.radius < 0) {
            let angle = this.getAngle();
            if (angle < 0 || this.position.y < 120) {
                let deviation = this.limitHorizontalDeviation(angle);
                this.rotate(deviation);
            }
            this.position.x = 0 + this.radius;
            this.velocity.x = -this.velocity.x;

        } else if (this.position.x + this.radius > 320) {
            let angle = this.getAngle();
            if (angle < 0 || this.position.y < 120) {
                let deviation = this.limitHorizontalDeviation(angle);
                this.rotate(deviation);
            }
            this.position.x = 320 - this.radius;
            this.velocity.x = -this.velocity.x;

        }

        if (this.position.y - this.radius < 0) {
            this.position.y = 0 + this.radius;
            this.velocity.y = -this.velocity.y;
        } else if (this.position.y + this.radius > 240) {
            // this.position.y = 240 - this.radius;
            // this.velocity.y = -this.velocity.y;

            let index = objects.balls.indexOf(this);
            if (index > -1) {
                objects.balls.splice(index, 1);
                console.log("Ball removed");
            }
        }

        // this.rotate(Math.random()*2);
    }

    draw() {
        bufferContext.fillStyle = this.color;
        bufferContext.beginPath();
        bufferContext.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        bufferContext.fill();
    }

    rotate(degrees) {
        let angle = degrees;
        let x = this.velocity.x;
        let y = this.velocity.y;
        this.velocity.x = x * Math.cos(angle) - y * Math.sin(angle);
        this.velocity.y = x * Math.sin(angle) + y * Math.cos(angle);
    }
}

// export class PongArray {
//     update(delta) {
//         for (let pong of objects.balls) {
//             pong.update();

//             bufferContext.fillStyle = "white";
//             bufferContext.beginPath();
//             bufferContext.arc(pong.position.x, pong.position.y, pong.radius, 0, 2 * Math.PI);
//             bufferContext.fill();

//             // pong.rotate(Math.random()*100-50);
//         }
//     }
// }
