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

function intersectionOf(line1, line2) {
    const { x1: x1_1, y1: y1_1, x2: x2_1, y2: y2_1 } = line1;
    const { x1: x1_2, y1: y1_2, x2: x2_2, y2: y2_2 } = line2;

    const denominator =
      (y2_2 - y1_2) * (x2_1 - x1_1) - (x2_2 - x1_2) * (y2_1 - y1_1);

    if (denominator === 0) {
      return null;
    }

    const numerator =
      (x2_2 - x1_2) * (y1_1 - y1_2) - (y2_2 - y1_2) * (x1_1 - x1_2);

    const t = numerator / denominator;
    const intersectionPoint = {
      x: x1_1 + t * (x2_1 - x1_1),
      y: y1_1 + t * (y2_1 - y1_1),
    };

    return intersectionPoint;
  }

  function isPointInSemiline(startPoint, throughPoint, testPoint) {
    const { x: x1, y: y1 } = startPoint;
    const { x: x2, y: y2 } = throughPoint;
    const { x: x3, y: y3 } = testPoint;

    let slope1 = ((y2 - y1) / (x2 - x1));
    let slope2 = (y3 - y1) / (x3 - x1);

    let abs_slope1 = Math.abs(slope1);
    let abs_slope2 = Math.abs(slope2);

    // float point precision issue workaround
    if (slope1 != slope2 && (Math.round(slope1) != Math.round(slope2) || Math.max(abs_slope1, abs_slope2) - Math.min(abs_slope1, abs_slope2) > 0.000001)) {
      return false;
    }

    let r = (x3 - x1) / (x2 - x3);

    console.log(r);

    if (r < 0 && r > -1) {
      return false;
    }

    return true;
  }

  function isPointInLine(startPoint, endPoint, testPoint) {
    const { x: x1, y: y1 } = startPoint;
    const { x: x2, y: y2 } = endPoint;
    const { x: x3, y: y3 } = testPoint;

    let slope1 = ((y2 - y1) / (x2 - x1));
    let slope2 = (y3 - y1) / (x3 - x1);

    let abs_slope1 = Math.abs(slope1);
    let abs_slope2 = Math.abs(slope2);

    // float point precision issue workaround
    if (slope1 != slope2 && (Math.round(slope1) != Math.round(slope2) || Math.max(abs_slope1, abs_slope2) - Math.min(abs_slope1, abs_slope2) > 0.000001)) {
      return false;
    }

    let r = (x3 - x1) / (x2 - x3);

    console.log(r);

    if (r < 0) {
      return false;
    }

    return true;
  }

export class Pong extends Playable {

    colliding = false;
    BlockColliding = false;
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
                deviation = - angle + 5 * Math.PI / 6;
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

        let nextFramePosition = { x: this.position.x + this.velocity.x, y: this.position.y + this.velocity.y};

        for (let block of objects.blocks) {
            let totalDistance = Math.sqrt(Math.pow(block.position.x - this.position.x, 2) + Math.pow(block.position.y - this.position.y, 2));
            if (totalDistance > this.radius + block.radius) {
                this.BlockColliding = false;
                continue;
            }

            if (this.BlockColliding) {
                // console.log("colliding");
                continue;
            }

            // # CCD
            let origin, n1, n2 = block.closestSides(this.position);

            // ## decide if there is a predominant side

            let pSide = null;
            
            // evaluate the intersection of the trajectory with both sides origin -> n1 and origin -> n2


            let intersection_n1 = intersectionOf({x1: origin.x, y1: origin.y, x2: n1.x, y2: n1.y}, {x1: this.position.x, y1: this.position.y, x2: nextFramePosition.x, y2: nextFramePosition.y});
            let intersection_n2 = intersectionOf({x1: origin.x, y1: origin.y, x2: n2.x, y2: n2.y}, {x1: this.position.x, y1: this.position.y, x2: nextFramePosition.x, y2: nextFramePosition.y});
            
            let isPointInLine_n1 = isPointInLine(origin, n1, intersection_n1);
            let isPointInLine_n2 = isPointInLine(origin, n2, intersection_n2);

            if (isPointInLine_n1 && isPointInLine_n2) {
                let distance_n1 = Math.sqrt(Math.pow(intersection_n1.x - this.position.x, 2) + Math.pow(intersection_n1.y - this.position.y, 2));
                let distance_n2 = Math.sqrt(Math.pow(intersection_n2.x - this.position.x, 2) + Math.pow(intersection_n2.y - this.position.y, 2));

                if (distance_n1 < distance_n2) {
                    pSide = {x1: origin.x, y1: origin.y, x2: n1.x, y2: n1.y};
                } else {
                    pSide = {x1: origin.x, y1: origin.y, x2: n2.x, y2: n2.y};
                }
            } else if (isPointInLine_n1) {
                pSide = {x1: origin.x, y1: origin.y, x2: n1.x, y2: n1.y};
            } else if (isPointInLine_n2) {
                pSide = {x1: origin.x, y1: origin.y, x2: n1.x, y2: n1.y};
            } else {
                let directorVector = {x: nextFramePosition.x - this.position.x, y: this.position.y - nextFramePosition.y};

                // normalizing the director vector
                let magnitude = Math.sqrt(Math.pow(directorVector.x, 2) + Math.pow(directorVector.y, 2));
                directorVector.x /= magnitude;
                directorVector.y /= magnitude;

                let directorVectorLeft = {x: -directorVector.y, y: directorVector.x};
                let directorVectorRight = {x: directorVector.y, y: -directorVector.x};

                let positionLeftInitial = {x: this.position.x + directorVectorLeft.x, y: this.position.y + directorVectorLeft.y};
                let positionRightInitial = {x: this.position.x + directorVectorRight.x, y: this.position.y + directorVectorRight.y};

                let positionLeftFinal = {x: nextFramePosition.x + directorVectorLeft.x, y: nextFramePosition.y + directorVectorLeft.y};
                let positionRightFinal = {x: nextFramePosition.x + directorVectorRight.x, y: nextFramePosition.y + directorVectorRight.y};

                let intersectionLeft_n1 = intersectionOf({x1: origin.x, y1: origin.y, x2: n1.x, y2: n1.y}, {x1: positionLeftInitial.x, y1: positionLeftInitial.y, x2: positionLeftFinal.x, y2: positionLeftFinal.y});
                let intersectionLeft_n2 = intersectionOf({x1: origin.x, y1: origin.y, x2: n2.x, y2: n2.y}, {x1: positionLeftInitial.x, y1: positionLeftInitial.y, x2: positionLeftFinal.x, y2: positionLeftFinal.y});

                let intersectionRight_n1 = intersectionOf({x1: origin.x, y1: origin.y, x2: n1.x, y2: n1.y}, {x1: positionRightInitial.x, y1: positionRightInitial.y, x2: positionRightFinal.x, y2: positionRightFinal.y});
                let intersectionRight_n2 = intersectionOf({x1: origin.x, y1: origin.y, x2: n2.x, y2: n2.y}, {x1: positionRightInitial.x, y1: positionRightInitial.y, x2: positionRightFinal.x, y2: positionRightFinal.y});

                let isPointInLineLeft_n1 = isPointInLine(positionLeftInitial, positionLeftFinal, intersectionLeft_n1);
                let isPointInLineLeft_n2 = isPointInLine(positionLeftInitial, positionLeftFinal, intersectionLeft_n2);

                let isPointInLineRight_n1 = isPointInLine(positionRightInitial, positionRightFinal, intersectionRight_n1);
                let isPointInLineRight_n2 = isPointInLine(positionRightInitial, positionRightFinal, intersectionRight_n2);

                if (isPointInLineLeft_n1 && isPointInLineLeft_n2) {
                    let distance_n1 = Math.sqrt(Math.pow(intersectionLeft_n1.x - this.position.x, 2) + Math.pow(intersectionLeft_n1.y - this.position.y, 2));
                    let distance_n2 = Math.sqrt(Math.pow(intersectionLeft_n2.x - this.position.x, 2) + Math.pow(intersectionLeft_n2.y - this.position.y, 2));

                    if (distance_n1 < distance_n2) {
                        pSide = {x1: origin.x, y1: origin.y, x2: n1.x, y2: n1.y};
                    } else {
                        pSide = {x1: origin.x, y1: origin.y, x2: n2.x, y2: n2.y};
                    }
                } else if (isPointInLineLeft_n1) {
                    pSide = {x1: origin.x, y1: origin.y, x2: n1.x, y2: n1.y};
                } else if (isPointInLineLeft_n2) {
                    pSide = {x1: origin.x, y1: origin.y, x2: n1.x, y2: n1.y};
                } else if (isPointInLineRight_n1 && isPointInLineRight_n2) {
                    let distance_n1 = Math.sqrt(Math.pow(intersectionRight_n1.x - this.position.x, 2) + Math.pow(intersectionRight_n1.y - this.position.y, 2));
                    let distance_n2 = Math.sqrt(Math.pow(intersectionRight_n2.x - this.position.x, 2) + Math.pow(intersectionRight_n2.y - this.position.y, 2));

                    if (distance_n1 < distance_n2) {
                        pSide = {x1: origin.x, y1: origin.y, x2: n1.x, y2: n1.y};
                    } else {
                        pSide = {x1: origin.x, y1: origin.y, x2: n2.x, y2: n2.y};
                    }
                } else if (isPointInLineRight_n1) {
                    pSide = {x1: origin.x, y1: origin.y, x2: n1.x, y2: n1.y};
                } else if (isPointInLineRight_n2) {
                    pSide = {x1: origin.x, y1: origin.y, x2: n1.x, y2: n1.y};
                }
            }

            



            // // block vertical collision
            // if (this.position.x > block.position.x - block.width / 2 && this.position.x < block.position.x + block.width / 2) {
            //     let yDistance = Math.abs(this.position.y - block.position.y);

            //     if (yDistance < this.radius + block.height / 2) {
            //         let overlap = this.radius + block.height / 2 - yDistance;
            //         console.log(this.velocity.y, this.position.y, block.position.y, overlap);
            //         this.position.y -= overlap;
            //         this.velocity.y *= -1;
            //         console.log(this.velocity.y, this.position.y, block.position.y, overlap);
            //         this.BlockColliding = true;
            //         block.break();
            //     }
            // }

            // // block horizontal collision
            // else if (this.position.y > block.position.y - block.height / 2 && this.position.y < block.position.y + block.height / 2) {
            //     let xDistance = Math.abs(this.position.x - block.position.x);
            //     if (xDistance < this.radius + block.width / 2) {
            //         let overlap = this.radius + block.width / 2 - xDistance;
            //         this.position.x -= overlap;
            //         this.velocity.x *= -1;
            //         this.BlockColliding = true;
            //         block.break();
            //     }
            // }

            // // block corner collision
            // else {
            //     let cornerName = block.closestCorner(this.position);
            //     let corner = block.corners[cornerName];

            //     let distance = Math.sqrt(Math.pow(corner.x - this.position.x, 2) + Math.pow(corner.y - this.position.y, 2));
            //     if (distance < this.radius) {
            //         let angle = Math.atan2(corner.y - this.position.y, corner.x - this.position.x);
            //         let overlap = this.radius - distance;
            //         this.position.x -= overlap * Math.cos(angle);
            //         this.position.y -= overlap * Math.sin(angle);

            //         let xVelocity = this.velocity.x;

            //         let q = - (2 * ((xVelocity) * (this.position.x - corner.x) + this.velocity.y * (this.position.y - corner.y))) / (Math.pow(this.radius, 2));

            //         this.velocity.x += q * (this.position.x - corner.x);
            //         this.velocity.y += q * (this.position.y - corner.y);
            //         // this.velocity.y = -Math.abs(this.velocity.y);
            //         this.BlockColliding = true;

            //         block.break();
            //         // pausecomp(400);
            //     }
            // }
        }

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

                    deviation += 1 / 3 * ((this.position.x - player.position.x) / (player.width / 2));

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

        this.velocity.x *= 10001 / 10000;
        this.velocity.y *= 10001 / 10000;

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
