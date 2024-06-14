import { bufferContext, canvas, bufferCanvas, bufferW, bufferH, mousePos } from "./ctr.js";
import { Brick } from "./brick.js";
import { PlayerBar } from "./playerBar.js";
import { GameLoop } from "./core.js";

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

function intersectionLineCircle(line, circle) {
    let point = { x: line.x1, y: line.y1 };
    let vector = { x: line.x2, y: line.y2 };

    let dx = point.x - circle.x;
    let dy = point.y - circle.y;

    let a = vector.x * vector.x + vector.y * vector.y;
    let b = 2 * (dx * vector.x + dy * vector.y);
    let c = dx * dx + dy * dy - circle.r * circle.r;

    let discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
        return null;
    }

    let t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    let t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

    let intersection1 = { x: point.x + t1 * vector.x, y: point.y + t1 * vector.y };
    let intersection2 = { x: point.x + t2 * vector.x, y: point.y + t2 * vector.y };

    let distance1 = Math.sqrt(Math.pow(intersection1.x - point.x, 2) + Math.pow(intersection1.y - point.y, 2));
    let distance2 = Math.sqrt(Math.pow(intersection2.x - point.x, 2) + Math.pow(intersection2.y - point.y, 2));

    if (distance1 < distance2) {
        return intersection1;
    }
    return intersection2;

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

    if (r < 0 && r > -1) {
        return false;
    }

    return true;
}

// function isPointInLine(startPoint, endPoint, testPoint) {
//     const { x: x1, y: y1 } = startPoint;
//     const { x: x2, y: y2 } = endPoint;
//     const { x: x3, y: y3 } = testPoint;

//     let slope1 = ((y2 - y1) / (x2 - x1));
//     let slope2 = (y3 - y1) / (x3 - x1);

//     let abs_slope1 = Math.abs(slope1);
//     let abs_slope2 = Math.abs(slope2);

//     // float point precision issue workaround
//     if (slope1 != slope2 && (Math.round(slope1) != Math.round(slope2) || Math.max(abs_slope1, abs_slope2) - Math.min(abs_slope1, abs_slope2) > 0.000001)) {
//         return false;
//     }

//     let r = (x3 - x1) / (x2 - x3);

//     if (r < 0) {
//         return false;
//     }

//     return true;
// }

function isPointInLine(startPoint, endPoint, testPoint) {
    const { x: x1, y: y1 } = startPoint;
    const { x: x2, y: y2 } = endPoint;
    const { x: x3, y: y3 } = testPoint;

    function crossProduct(x1, y1, x2, y2) {
        return x1 * y2 - y1 * x2;
    }

    const crossProd = crossProduct(x3 - x1, y3 - y1, x2 - x1, y2 - y1);

    if (Math.abs(crossProd) > 0.000001) {
        return false;
    }

    const withinXBounds = (Math.min(x1, x2) <= x3 && x3 <= Math.max(x1, x2));
    const withinYBounds = (Math.min(y1, y2) <= y3 && y3 <= Math.max(y1, y2));

    return withinXBounds && withinYBounds;
}

function PointInLine(startPoint, endPoint, testPoint) {
    const { x: x1, y: y1 } = startPoint;
    const { x: x2, y: y2 } = endPoint;
    const { x: x3, y: y3 } = testPoint;

    function crossProduct(x1, y1, x2, y2) {
        return x1 * y2 - y1 * x2;
    }

    const crossProd = crossProduct(x3 - x1, y3 - y1, x2 - x1, y2 - y1);

    if (Math.abs(crossProd) > 0.000001) {
        return null;
    }

    const dx = x2 - x1;
    const dy = y2 - y1;
    let r;

    if (Math.abs(dx) > Math.abs(dy)) {
        r = (x3 - x1) / dx;
    } else {
        r = (y3 - y1) / dy;
    }

    return r;
}

// function PointInLine(startPoint, endPoint, testPoint) {
//     const { x: x1, y: y1 } = startPoint;
//     const { x: x2, y: y2 } = endPoint;
//     const { x: x3, y: y3 } = testPoint;

//     let slope1 = ((y2 - y1) / (x2 - x1));
//     let slope2 = (y3 - y1) / (x3 - x1);

//     let abs_slope1 = Math.abs(slope1);
//     let abs_slope2 = Math.abs(slope2);

//     // float point precision issue workaround
//     if (slope1 != slope2 && (Math.round(slope1) != Math.round(slope2) || Math.max(abs_slope1, abs_slope2) - Math.min(abs_slope1, abs_slope2) > 0.000001)) {
//         return null;
//     }

//     let r = (x3 - x1) / (x2 - x3);
//     return r;
// }

function reflectVector(v, l) {
    const dotProduct = v.x * l.x + v.y * l.y;

    const projection = { x: dotProduct * l.x, y: dotProduct * l.y };

    const vPerpendicular = { x: v.x - projection.x, y: v.y - projection.y };

    const reflectedVector = { x: v.x - 2 * vPerpendicular.x, y: v.y - 2 * vPerpendicular.y };

    return reflectedVector;
}

function vectorWithMagnitudeAndDirection(x1, y1, x2, y2) {
    const magnitude1 = Math.sqrt(x1 * x1 + y1 * y1);

    const magnitude2 = Math.sqrt(x2 * x2 + y2 * y2);

    if (magnitude2 === 0) {
        return { x: x1, y: y1 };
    }

    const unitX2 = x2 / magnitude2;
    const unitY2 = y2 / magnitude2;

    const resultX = unitX2 * magnitude1;
    const resultY = unitY2 * magnitude1;

    return { x: resultX, y: resultY };
}



export class Pong extends Playable {

    colliding = false;
    BlockColliding = false;
    color = "#f00"

    constructor(x, y, sx, sy, radius, startTime = 0) {
        super(x, y, sx, sy);
        this.radius = radius;
        this.startTime = startTime;
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

    cornerCollisionResult(nextFramePosition, origin, intersection, block) {
        let directorVector = { x: nextFramePosition.x - this.position.x, y: nextFramePosition.y - this.position.y };

        let intersection_circle = intersectionLineCircle({ x1: origin.x, y1: origin.y, x2: directorVector.x, y2: directorVector.y }, { x: intersection.x, y: intersection.y, r: this.radius });

        if (intersection_circle === null) {
            return null;
        }

        let directorVector_ic_i = { x: intersection.x - intersection_circle.x, y: intersection.y - intersection_circle.y };
        let result_point = { x: origin.x + directorVector_ic_i.x, y: origin.y + directorVector_ic_i.y };

        let distance_intersection = Math.sqrt(Math.pow(result_point.x - this.position.x, 2) + Math.pow(result_point.y - this.position.y, 2));
        let distance_nextFrame = Math.sqrt(Math.pow(nextFramePosition.x - this.position.x, 2) + Math.pow(nextFramePosition.y - this.position.y, 2));
        let distance_position = Math.sqrt(Math.pow(origin.x - this.position.x, 2) + Math.pow(origin.y - this.position.y, 2));

        let isBetween = isPointInLine(this.position, nextFramePosition, result_point);

        if (!(block instanceof PlayerBar) && (!isBetween || distance_intersection > distance_nextFrame)) {
            // result = { x: intersection.x, y: intersection.y, time: distance_intersection / distance_nextFrame };
            if (distance_position > this.radius) return null;
        } else if (block instanceof PlayerBar && distance_intersection > distance_nextFrame) {
            if (distance_position > this.radius || this.velocity.y < 0) return null;
        } else if (block instanceof PlayerBar && this.velocity.y < 0) {
            return null;
        }

        let directorVEctor_point = { x: nextFramePosition.x - result_point.x, y: nextFramePosition.y - result_point.y };

        let q = - (2 * ((directorVEctor_point.x) * (result_point.x - origin.x) + directorVEctor_point.y * (result_point.y - origin.y))) / (Math.pow(this.radius, 2));

        directorVEctor_point.x += q * (result_point.x - origin.x);
        directorVEctor_point.y += q * (result_point.y - origin.y);

        return { x: result_point.x, y: result_point.y, xs: directorVEctor_point.x, ys: directorVEctor_point.y, time: distance_intersection / distance_nextFrame };
    }

    blockComputeCC(block, nextFramePosition, init_time = 0) {
        // # CCD
        // let nextFramePosition = { x: this.position.x + this.velocity.x * (1 - init_time), y: this.position.y + this.velocity.y * (1 - init_time) };
        let [origin, n1, n2] = block.closestSides(this.position);

        // ## decide if there is a predominant side

        let pSide = null;
        let pSide_n1 = { x1: origin.x, y1: origin.y, x2: n1.x, y2: n1.y, x3: n2.x, y3: n2.y };
        let pSide_n2 = { x1: origin.x, y1: origin.y, x2: n2.x, y2: n2.y, x3: n1.x, y3: n1.y };

        // evaluate the intersection of the trajectory with both sides origin -> n1 and origin -> n2

        let intersection_n1 = intersectionOf({ x1: origin.x, y1: origin.y, x2: n1.x, y2: n1.y }, { x1: this.position.x, y1: this.position.y, x2: nextFramePosition.x, y2: nextFramePosition.y });
        let intersection_n2 = intersectionOf({ x1: origin.x, y1: origin.y, x2: n2.x, y2: n2.y }, { x1: this.position.x, y1: this.position.y, x2: nextFramePosition.x, y2: nextFramePosition.y });

        let isPointInLine_n1 = intersection_n1 != null ? isPointInLine(origin, n1, intersection_n1) : false;
        let isPointInLine_n2 = intersection_n2 != null ? isPointInLine(origin, n2, intersection_n2) : false;

        if (isPointInLine_n1 && isPointInLine_n2) {
            let distance_n1 = Math.sqrt(Math.pow(intersection_n1.x - this.position.x, 2) + Math.pow(intersection_n1.y - this.position.y, 2));
            let distance_n2 = Math.sqrt(Math.pow(intersection_n2.x - this.position.x, 2) + Math.pow(intersection_n2.y - this.position.y, 2));

            if (distance_n1 < distance_n2) {
                pSide = pSide_n1;
            } else {
                pSide = pSide_n2;
            }
        } else if (isPointInLine_n1) {
            pSide = pSide_n1;
        } else if (isPointInLine_n2) {
            pSide = pSide_n2;
        } else {
            let directorVector = { x: nextFramePosition.x - this.position.x, y: nextFramePosition.y - this.position.y };

            // normalizing the director vector
            let magnitude = Math.sqrt(Math.pow(directorVector.x, 2) + Math.pow(directorVector.y, 2));
            directorVector.x /= magnitude;
            directorVector.y /= magnitude;

            directorVector.x *= this.radius;
            directorVector.y *= this.radius;

            let directorVectorLeft = { x: -directorVector.y, y: directorVector.x };
            let directorVectorRight = { x: directorVector.y, y: -directorVector.x };

            let positionLeftInitial = { x: this.position.x + directorVectorLeft.x, y: this.position.y + directorVectorLeft.y };
            let positionRightInitial = { x: this.position.x + directorVectorRight.x, y: this.position.y + directorVectorRight.y };

            let positionLeftFinal = { x: nextFramePosition.x + directorVectorLeft.x, y: nextFramePosition.y + directorVectorLeft.y };
            let positionRightFinal = { x: nextFramePosition.x + directorVectorRight.x, y: nextFramePosition.y + directorVectorRight.y };

            let intersectionLeft_n1 = intersectionOf({ x1: origin.x, y1: origin.y, x2: n1.x, y2: n1.y }, { x1: positionLeftInitial.x, y1: positionLeftInitial.y, x2: positionLeftFinal.x, y2: positionLeftFinal.y });
            let intersectionLeft_n2 = intersectionOf({ x1: origin.x, y1: origin.y, x2: n2.x, y2: n2.y }, { x1: positionLeftInitial.x, y1: positionLeftInitial.y, x2: positionLeftFinal.x, y2: positionLeftFinal.y });

            let intersectionRight_n1 = intersectionOf({ x1: origin.x, y1: origin.y, x2: n1.x, y2: n1.y }, { x1: positionRightInitial.x, y1: positionRightInitial.y, x2: positionRightFinal.x, y2: positionRightFinal.y });
            let intersectionRight_n2 = intersectionOf({ x1: origin.x, y1: origin.y, x2: n2.x, y2: n2.y }, { x1: positionRightInitial.x, y1: positionRightInitial.y, x2: positionRightFinal.x, y2: positionRightFinal.y });

            let isPointInLineLeft_n1 = intersectionLeft_n1 != null ? isPointInLine(origin, n1, intersectionLeft_n1) : false;
            let isPointInLineLeft_n2 = intersectionLeft_n2 != null ? isPointInLine(origin, n2, intersectionLeft_n2) : false;

            let isPointInLineRight_n1 = intersectionRight_n1 != null ? isPointInLine(origin, n1, intersectionRight_n1) : false;
            let isPointInLineRight_n2 = intersectionRight_n2 != null ? isPointInLine(origin, n2, intersectionRight_n2) : false;

            if (isPointInLineLeft_n1 && isPointInLineLeft_n2) {
                let distance_n1 = Math.sqrt(Math.pow(intersectionLeft_n1.x - this.position.x, 2) + Math.pow(intersectionLeft_n1.y - this.position.y, 2));
                let distance_n2 = Math.sqrt(Math.pow(intersectionLeft_n2.x - this.position.x, 2) + Math.pow(intersectionLeft_n2.y - this.position.y, 2));

                if (distance_n1 < distance_n2) {
                    pSide = pSide_n1;
                } else {
                    pSide = pSide_n2;
                }
            } else if (isPointInLineLeft_n1) {
                pSide = pSide_n1;
            } else if (isPointInLineLeft_n2) {
                pSide = pSide_n2;
            } else if (isPointInLineRight_n1 && isPointInLineRight_n2) {
                let distance_n1 = Math.sqrt(Math.pow(intersectionRight_n1.x - this.position.x, 2) + Math.pow(intersectionRight_n1.y - this.position.y, 2));
                let distance_n2 = Math.sqrt(Math.pow(intersectionRight_n2.x - this.position.x, 2) + Math.pow(intersectionRight_n2.y - this.position.y, 2));

                if (distance_n1 < distance_n2) {
                    pSide = pSide_n1;
                } else {
                    pSide = pSide_n2;
                }
            } else if (isPointInLineRight_n1) {
                pSide = pSide_n1;
            } else if (isPointInLineRight_n2) {
                pSide = pSide_n2;
            }
        }

        if (pSide != null) {
            let directorVector_O_n = { x: pSide.x3 - pSide.x1, y: pSide.y3 - pSide.y1 };

            // normalizing the director vector
            let magnitude = Math.sqrt(Math.pow(directorVector_O_n.x, 2) + Math.pow(directorVector_O_n.y, 2));
            directorVector_O_n.x /= magnitude;
            directorVector_O_n.y /= magnitude;

            directorVector_O_n.x *= this.radius;
            directorVector_O_n.y *= this.radius;

            directorVector_O_n = { x: -directorVector_O_n.x, y: -directorVector_O_n.y };

            let origin_margin = { x: origin.x + directorVector_O_n.x, y: origin.y + directorVector_O_n.y };
            let n_margin = { x: pSide.x2 + directorVector_O_n.x, y: pSide.y2 + directorVector_O_n.y };

            let intersection = intersectionOf({ x1: origin_margin.x, y1: origin_margin.y, x2: n_margin.x, y2: n_margin.y }, { x1: this.position.x, y1: this.position.y, x2: nextFramePosition.x, y2: nextFramePosition.y });
            let pointInLine = PointInLine(origin_margin, n_margin, intersection);

            if (pointInLine >= 0 && pointInLine <= 1) {
                let distance_intersection = Math.sqrt(Math.pow(intersection.x - this.position.x, 2) + Math.pow(intersection.y - this.position.y, 2));
                let distance_nextFrame = Math.sqrt(Math.pow(nextFramePosition.x - this.position.x, 2) + Math.pow(nextFramePosition.y - this.position.y, 2));

                let intersectionBase = intersectionOf({ x1: origin.x, y1: origin.y, x2: pSide.x2, y2: pSide.y2 }, { x1: this.position.x, y1: this.position.y, x2: nextFramePosition.x, y2: nextFramePosition.y });
                let distance_base = Math.sqrt(Math.pow(intersectionBase.x - this.position.x, 2) + Math.pow(intersectionBase.y - this.position.y, 2));

                let isBetween = isPointInLine(this.position, nextFramePosition, intersection);

                if (!(block instanceof PlayerBar) && (!isBetween || distance_intersection > distance_nextFrame)) {
                    // result = { x: intersection.x, y: intersection.y, time: distance_intersection / distance_nextFrame };
                    if (distance_base > this.radius) return null;
                } else if (block instanceof PlayerBar && distance_intersection > distance_nextFrame) {
                    if (distance_base > this.radius || this.velocity.y < 0) return null;
                } else if (block instanceof PlayerBar && this.velocity.y < 0) {
                    return null;
                }

                let unitVector = { x: pSide.x2 - origin.x, y: pSide.y2 - origin.y };
                let magnitude = Math.sqrt(Math.pow(unitVector.x, 2) + Math.pow(unitVector.y, 2));
                unitVector.x /= magnitude;
                unitVector.y /= magnitude;
                unitVector = { x: unitVector.y, y: -unitVector.x };

                let nextFP_InterVector = { x: intersection.x - nextFramePosition.x, y: intersection.y - nextFramePosition.y };

                let nextFPVector = reflectVector(nextFP_InterVector, unitVector);

                return { x: intersection.x, y: intersection.y, xs: nextFPVector.x, ys: nextFPVector.y, time: distance_intersection / distance_nextFrame };

            } else if (pointInLine < 0) {

                return this.cornerCollisionResult(nextFramePosition, origin, intersection, block) || null;

            } else if (pointInLine > 1) {
                // let directorVector = { x: nextFramePosition.x - this.position.x, y: this.position.y - nextFramePosition.y };

                // let intersection_circle = intersectionLineCircle({ x1: pSide.x2, y1: pSide.y2, x2: directorVector.x, y2: directorVector.y }, { x: this.position.x, y: this.position.y, r: this.radius });

                // if (intersection_circle === null) {
                //     return result;
                // }

                // let directorVector_ic_i = { x: intersection.x - intersection_circle.x, y: intersection.y - intersection_circle.y };
                // let result_point = { x: pSide.x2 + directorVector_ic_i.x, y: pSide.y2 + directorVector_ic_i.y };

                // let distance_intersection = Math.sqrt(Math.pow(result_point.x - this.position.x, 2) + Math.pow(result_point.y - this.position.y, 2));
                // let distance_nextFrame = Math.sqrt(Math.pow(nextFramePosition.x - this.position.x, 2) + Math.pow(nextFramePosition.y - this.position.y, 2));

                // if (distance_intersection < distance_nextFrame) {
                //     result = { x: result_point.x, y: result_point.y, time: distance_intersection / distance_nextFrame };
                // }
                return this.cornerCollisionResult(nextFramePosition, { x: pSide.x2, y: pSide.y2 }, intersection) || null;
            }
        }

        return null;
    }

    // blockContinuousCollision(init_time = 0) {



    // }

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

        let time = 0;
        let iteration = 0;

        // console.log(objects.blocks[0] instanceof Brick);

        while (time < 1) {
            let closeObjects = new Map();

            let nextFramePosition = { x: this.position.x + this.velocity.x * (1 - time), y: this.position.y + this.velocity.y * (1 - time) };
            let vector = { x: nextFramePosition.x - this.position.x, y: nextFramePosition.y - this.position.y };
            let areaEffectRadius = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2)) + this.radius + 1;

            for (let block of objects.blocks) {
                let distance = Math.sqrt(Math.pow(block.position.x - this.position.x, 2) + Math.pow(block.position.y - this.position.y, 2));
                if (distance < areaEffectRadius + block.radius) {
                    closeObjects.set(block, distance);
                }
            }

            for (let player of objects.player) {
                let distance = Math.sqrt(Math.pow(player.position.x - this.position.x, 2) + Math.pow(player.position.y - this.position.y, 2));
                if (distance < areaEffectRadius + player.radius) {
                    closeObjects.set(player, distance);
                }
            }

            // bufferContext.fillStyle = "rgba(100, 200, 100, 0.5)";
            // bufferContext.beginPath();
            // bufferContext.arc(this.position.x, this.position.y, areaEffectRadius, 0, 2 * Math.PI);
            // bufferContext.fill();

            // bufferContext.fillStyle = '#00F';
            // bufferContext.beginPath();
            // bufferContext.arc(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.radius, 0, 2 * Math.PI);
            // bufferContext.fill();

            // bufferContext.fillStyle = this.color;
            // bufferContext.beginPath();
            // bufferContext.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
            // bufferContext.fill();

            // console.log(closeObjects, this.position, nextFramePosition, time);

            let sortedObjects = [...closeObjects.keys()].sort((a, b) => closeObjects.get(a) - closeObjects.get(b));

            let result = null;
            let collidingObject = null;

            for (let object of sortedObjects) {
                if (object === this.lastCollidingObject) continue;

                result = this.blockComputeCC(object, nextFramePosition, time);

                // if (object instanceof Brick) {
                //     result = this.blockComputeCC(object, nextFramePosition, time);
                // }

                if (result != null) {
                    collidingObject = object;
                    break;
                }
            }

            if (result === null) {
                bufferContext.strokeStyle = this.color;
                bufferContext.beginPath();
                bufferContext.lineWidth = this.radius * 2;
                bufferContext.lineCap = "round";
                bufferContext.moveTo(this.position.x, this.position.y);
                bufferContext.lineTo(nextFramePosition.x, nextFramePosition.y);
                bufferContext.stroke();

                this.position.x = nextFramePosition.x;
                this.position.y = nextFramePosition.y;

                break;
            } else {
                bufferContext.strokeStyle = this.color;
                bufferContext.beginPath();
                bufferContext.lineWidth = this.radius * 2;
                bufferContext.lineCap = "round";
                bufferContext.moveTo(this.position.x, this.position.y);
                bufferContext.lineTo(result.x, result.y);
                bufferContext.stroke();

                let newVelocity = vectorWithMagnitudeAndDirection(this.velocity.x, this.velocity.y, result.xs, result.ys);
                this.velocity.x = newVelocity.x;
                this.velocity.y = newVelocity.y;

                if (collidingObject instanceof PlayerBar) {
                    this.velocity.y = -Math.abs(this.velocity.y);
                }

                this.lastCollidingObject = collidingObject;
                this.position.x = result.x;
                this.position.y = result.y;


                time = result.time;

                if (collidingObject instanceof Brick) {
                    collidingObject.break();
                }
            }


            if (collidingObject instanceof PlayerBar) {
                let deviation = 0;
                if (collidingObject.velocity.x > 0) {
                    deviation = Math.pow(Math.E, -(1 / collidingObject.velocity.x)) / 2;
                } else if (collidingObject.velocity.x < 0) {
                    deviation = -Math.pow(Math.E, -(1 / -collidingObject.velocity.x)) / 2;
                }

                deviation += 1 / 3 * ((this.position.x - collidingObject.position.x) / (collidingObject.width / 2));

                let angle = this.getAngle();

                let newAngle = angle + deviation;

                let newDeviation = this.limitHorizontalDeviation(angle, newAngle, deviation);

                this.rotate(newDeviation);
            }

            iteration++;

            if (iteration > 10) {
                break;
            }
        }









        // for (let block of objects.blocks) {
        //     let totalDistance = Math.sqrt(Math.pow(block.position.x - this.position.x, 2) + Math.pow(block.position.y - this.position.y, 2));
        //     if (totalDistance > this.radius + block.radius) {
        //         this.BlockColliding = false;
        //         continue;
        //     }

        //     if (this.BlockColliding) {
        //         // console.log("colliding");
        //         continue;
        //     }

        //     this.testtest = false;

        //     let result = this.blockComputeCC(block, time);

        //     this.position.x = result.x;
        //     this.position.y = result.y;
        //     let newVelocity = vectorWithMagnitudeAndDirection(this.velocity.x, this.velocity.y, result.xs, result.ys);
        //     this.velocity.x = newVelocity.x;
        //     this.velocity.y = newVelocity.y;
        //     time = result.time;

        //     if (time >= 1) {
        //         break;
        //     }
        //     // // block vertical collision
        //     // if (this.position.x > block.position.x - block.width / 2 && this.position.x < block.position.x + block.width / 2) {
        //     //     let yDistance = Math.abs(this.position.y - block.position.y);

        //     //     if (yDistance < this.radius + block.height / 2) {
        //     //         let overlap = this.radius + block.height / 2 - yDistance;
        //     //         console.log(this.velocity.y, this.position.y, block.position.y, overlap);
        //     //         this.position.y -= overlap;
        //     //         this.velocity.y *= -1;
        //     //         console.log(this.velocity.y, this.position.y, block.position.y, overlap);
        //     //         this.BlockColliding = true;
        //     //         block.break();
        //     //     }
        //     // }

        //     // // block horizontal collision
        //     // else if (this.position.y > block.position.y - block.height / 2 && this.position.y < block.position.y + block.height / 2) {
        //     //     let xDistance = Math.abs(this.position.x - block.position.x);
        //     //     if (xDistance < this.radius + block.width / 2) {
        //     //         let overlap = this.radius + block.width / 2 - xDistance;
        //     //         this.position.x -= overlap;
        //     //         this.velocity.x *= -1;
        //     //         this.BlockColliding = true;
        //     //         block.break();
        //     //     }
        //     // }

        //     // // block corner collision
        //     // else {
        //     //     let cornerName = block.closestCorner(this.position);
        //     //     let corner = block.corners[cornerName];

        //     //     let distance = Math.sqrt(Math.pow(corner.x - this.position.x, 2) + Math.pow(corner.y - this.position.y, 2));
        //     //     if (distance < this.radius) {
        //     //         let angle = Math.atan2(corner.y - this.position.y, corner.x - this.position.x);
        //     //         let overlap = this.radius - distance;
        //     //         this.position.x -= overlap * Math.cos(angle);
        //     //         this.position.y -= overlap * Math.sin(angle);

        //     //         let xVelocity = this.velocity.x;

        //     //         let q = - (2 * ((xVelocity) * (this.position.x - corner.x) + this.velocity.y * (this.position.y - corner.y))) / (Math.pow(this.radius, 2));

        //     //         this.velocity.x += q * (this.position.x - corner.x);
        //     //         this.velocity.y += q * (this.position.y - corner.y);
        //     //         // this.velocity.y = -Math.abs(this.velocity.y);
        //     //         this.BlockColliding = true;

        //     //         block.break();
        //     //         // pausecomp(400);
        //     //     }
        //     // }
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

        // for (let player of objects.player) {

        //     let totalDistance = Math.sqrt(Math.pow(player.position.x - this.position.x, 2) + Math.pow(player.position.y - this.position.y, 2));
        //     if (totalDistance > this.radius + player.radius) {
        //         this.colliding = false;
        //         continue;
        //     }

        //     if (this.colliding) {
        //         // console.log("colliding");
        //         continue;
        //     }

        //     if (this.position.y < player.position.y && this.position.x < (player.position.x + player.width / 2 + 1) && this.position.x > (player.position.x - player.width / 2 - 1)) {
        //         let distance = Math.abs(this.position.y - player.position.y);
        //         if (distance < this.radius + player.height / 2) {
        //             let overlap = this.radius + player.height / 2 - distance;
        //             this.position.y -= overlap;
        //             this.velocity.y *= -1;
        //             let deviation = 0;
        //             if (player.velocity.x > 0) {
        //                 deviation = Math.pow(Math.E, -(1 / player.velocity.x)) / 2;
        //             } else if (player.velocity.x < 0) {
        //                 deviation = -Math.pow(Math.E, -(1 / -player.velocity.x)) / 2;
        //             }

        //             // console.log("deviation", deviation, player.velocity.x);

        //             deviation += 1 / 3 * ((this.position.x - player.position.x) / (player.width / 2));

        //             let angle = this.getAngle();

        //             let newAngle = angle + deviation;

        //             let newDeviation = this.limitHorizontalDeviation(angle, newAngle, deviation);

        //             // console.log(newAngle, newAngle * (180 / Math.PI));



        //             // if (newAngle < Math.PI / 6) {
        //             //     deviation = - angle + Math.PI / 6;
        //             //     // console.log("Limiting deviation to 30 degrees");
        //             // } else if (newAngle > 5 * Math.PI / 6) {
        //             //     deviation = - 5 * Math.PI / 6 + angle;
        //             //     // console.log("Limiting deviation to 150 degrees");
        //             // }


        //             this.rotate(newDeviation);

        //             let tempAngle = this.getAngle();

        //             // console.log(
        //             //     "angle", (angle * (180 / Math.PI)).toFixed(2),
        //             //     angle.toFixed(2),
        //             //     "\ndeviation", (deviation * (180 / Math.PI)).toFixed(2),
        //             //     deviation.toFixed(2),
        //             //     "\nnewDeviation", (newDeviation * (180 / Math.PI)).toFixed(2),
        //             //     newDeviation.toFixed(2),
        //             //     "\nnewAngle", (newAngle * (180 / Math.PI)).toFixed(2),
        //             //     newAngle.toFixed(2),
        //             //     "\ntempAngle", (tempAngle * (180 / Math.PI)).toFixed(2),
        //             //     tempAngle.toFixed(2)
        //             // );

        //             // let temp = { x: this.velocity.x, y: this.velocity.y };
        //             // temp.x = this.velocity.x * Math.cos(deviation) - this.velocity.y * Math.sin(deviation);
        //             // temp.y = this.velocity.x * Math.sin(deviation) + this.velocity.y * Math.cos(deviation);

        //             // this.velocity.x = temp.x;
        //             // this.velocity.y = temp.y;


        //             this.colliding = true;
        //         }


        //     } else if (this.position.y < (player.position.y + player.height / 2) && this.position.y > (player.position.y - player.height / 2)) {
        //         // console.log("doingit");
        //         let distance = Math.abs(this.position.x - player.position.x);
        //         if (distance < this.radius + player.width / 2) {
        //             // let overlap = this.radius + player.width / 2 - distance;
        //             // this.position.x -= overlap;
        //             this.velocity.x = -this.velocity.x + player.velocity.x
        //             // this.velocity.x += player.velocity.x;
        //             this.colliding = true;
        //         }
        //     }
        //     else {
        //         let cornerName = player.closestCorner(this.position);
        //         let corner = player.corners[cornerName];

        //         let distance = Math.sqrt(Math.pow(corner.x - this.position.x, 2) + Math.pow(corner.y - this.position.y, 2));
        //         if (distance < this.radius) {
        //             let angle = Math.atan2(corner.y - this.position.y, corner.x - this.position.x);
        //             let overlap = this.radius - distance;
        //             this.position.x -= overlap * Math.cos(angle);
        //             this.position.y -= overlap * Math.sin(angle);

        //             let xVelocity = this.velocity.x;

        //             let q = - (2 * ((xVelocity) * (this.position.x - corner.x) + this.velocity.y * (this.position.y - corner.y))) / (Math.pow(this.radius, 2));

        //             this.velocity.x += q * (this.position.x - corner.x);
        //             this.velocity.y += q * (this.position.y - corner.y);
        //             this.velocity.y = -Math.abs(this.velocity.y);
        //             this.colliding = true;
        //             // pausecomp(400);
        //         }
        //     }
        // }


    }

    update(delta) {

        if (this.startTime > 0) {
            this.startTime -= 1;
            return;
        }

        if (GameLoop.stop) {
            return;
        }
        // let maxSpeed = this.radius;
        // this.velocity.x = Math.min(maxSpeed, Math.max(-maxSpeed, this.velocity.x));
        // this.velocity.y = Math.min(maxSpeed, Math.max(-maxSpeed, this.velocity.y));
        this.collision();
        if (this.testtest) {
            // super.update();
        }
        this.testtest = true;


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
            this.lastCollidingObject = null;
        } else if (this.position.y + this.radius > 240) {
            this.position.y = 240 - this.radius;
            this.velocity.y = -this.velocity.y;
            this.lastCollidingObject = null;

            let index = objects.balls.indexOf(this);
            if (index > -1) {
                objects.balls.splice(index, 1);
                console.log("Ball removed");
            }
        }

        // this.rotate(Math.random()*2);
    }

    draw() {
        // bufferContext.fillStyle = '#00F';
        // bufferContext.beginPath();
        // bufferContext.arc(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.radius, 0, 2 * Math.PI);
        // bufferContext.fill();

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
