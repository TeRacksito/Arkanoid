import { scaleFormula, posToCanvas } from './utils.js';
import { GameLoop } from './core.js';
import { Pong } from './test.js';
import { Brick } from './brick.js';

const onecolor = one.color;

function hex2vector(cssHex) {
    const pc = onecolor(cssHex);

    return vec3.fromValues(
        pc.red(),
        pc.green(),
        pc.blue()
    );
}

const charW = 6;
const charH = 10;
const bufferCW = 52 + (4 / 3);

// const charW = 10;
// const charH = 10;
// const bufferCW = 32;

const bufferCH = 24;
export const bufferW = bufferCW * charW;
export const bufferH = bufferCH * charH;
const textureW = 512;
const textureH = 256;

const consolePad = 8; // in texels
const consoleW = bufferW + consolePad * 2;
const consoleH = bufferH + consolePad * 2;

export const bufferCanvas = document.createElement('canvas');
export const canvas = document.getElementById('render');
bufferCanvas.width = bufferW;
bufferCanvas.height = bufferH;
// document.body.appendChild(bufferCanvas);

export const bufferContext = bufferCanvas.getContext('2d');

bufferContext.fillStyle = '#fff';
bufferContext.fillRect(0, 0, bufferW, bufferH);

// const gameLoop = new GameLoop(bufferContext, canvas, bufferCanvas);
GameLoop.init();

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

export let mousePos = { x: 0, y: 0 };

// Function to handle mouse movement
function onMouseMove(evt) {
    var mouseGlobalPos = getMousePos(canvas, evt);
    // Print the mouse position
    // console.log("Mouse position: " + mouseGlobalPos.x + ", " + mouseGlobalPos.y);
    mousePos = posToCanvas(mouseGlobalPos.x, mouseGlobalPos.y);
}

// Add event listener for mouse movement
canvas.addEventListener('mousemove', onMouseMove, false);

let fadeCountdown = 0;
// let scaleCanvas = 0.2;
let scaleCanvas = 1.04;
let scaleCanvasCooldown = 0;

let gameLoopCooldown = 0;



// let playerBar = new PlayerBar(160, 0, 0);

function renderWorld(delta) {
    // fade screen every few frames
    // (not every frame, for long trails without rounding artifacts)
    fadeCountdown -= delta;

    if (fadeCountdown < 0) {
        bufferContext.fillStyle = 'rgba(0, 0, 0, 0.9)';
        bufferContext.fillRect(0, 0, bufferW, bufferH);

        fadeCountdown += 0.01;
    }

    // redraw
    bufferContext.textAlign = 'center';
    bufferContext.font = '12px "Inconsolata"';
    canvas.height = window.innerHeight * scaleCanvas;
    canvas.width = canvas.height * (4 / 3);

    if (scaleCanvas < 1.04) {
        // scaleCanvas += scaleFormula(1.04 - scaleCanvas, 0.00001, 0.01, 1.04, 0.4);
        if (scaleCanvasCooldown <= 0) {
            scaleCanvas += scaleFormula(1.04 - scaleCanvas, 0.00001, 0.05, 1.04, 1);
            scaleCanvasCooldown = 3;
        }

        scaleCanvasCooldown--;
    }



    GameLoop.update(delta);

    // pausecomp(50);

    // time sleep 1 s


    // let pong = pongArray.getPong(0);

    // let vector = {x: (mousePos.x - playerBar.position.x)/10, y: (mousePos.y - playerBar.position.y)/10};

    // playerBar.velocity.x = vector.x;
    // playerBar.velocity.y = vector.y;

    // playerBar.update(delta);
    // playerBar.draw(bufferContext, bufferW, bufferH);

    // draw triangle
}

// init WebGL
const regl = createREGL({
    canvas: document.body.querySelector('canvas'),
    attributes: { antialias: true, alpha: false, preserveDrawingBuffer: true }
});

const spriteTexture = regl.texture({
    width: 512,
    height: 256,
    mag: 'linear'
});

const termFgColor = hex2vector('#fee');
const termBgColor = hex2vector('#303030');

const quadCommand = regl({
    vert: `
        precision mediump float;

        attribute vec3 position;

        varying vec2 uvPosition;

        void main() {
            uvPosition = position.xy * vec2(0.5, -0.5) + vec2(0.5);

            gl_Position = vec4(
                vec2(-1.0, 1.0) + (position.xy - vec2(-1.0, 1.0)) * 1.0,
                0.0,
                1.0
            );
        }
    `,

    frag: `
        precision mediump float;

        varying vec2 uvPosition;
        uniform sampler2D sprite;
        uniform float time;
        uniform vec3 bgColor;
        uniform vec3 fgColor;

        #define textureW ${textureW + '.0'}
        #define textureH ${textureH + '.0'}
        #define consoleW ${consoleW + '.0'}
        #define consoleH ${consoleH + '.0'}
        #define consolePadUVW ${consolePad / consoleW}
        #define consolePadUVH ${consolePad / consoleH}
        #define charUVW ${charW / consoleW}
        #define charUVH ${charH / consoleH}

        void main() {
            // @todo use uniform
            vec2 consoleWH = vec2(consoleW, consoleH);

            // @todo use uniforms
            float glitchLine = mod(0.8 + time * 0.07, 1.0);
            float glitchFlutter = mod(time * 4.0, 1.0); // timed to be slightly out of sync from main frame rate
            float glitchAmount = 0.06 + glitchFlutter * 0.01;
            float glitchDistance = 0.01 + glitchFlutter * 0.25;

            vec2 center = uvPosition - vec2(0.5);
            float factor = dot(center, center) * 0.3;
            vec2 distortedUVPosition = uvPosition + center * (1.0 - factor) * factor;

            vec2 fromEdge = vec2(0.5, 0.5) - abs(distortedUVPosition - vec2(0.5, 0.5));

            if (fromEdge.x > 0.0 && fromEdge.y > 0.0) {
                vec2 fromEdgePixel = min(0.2 * consoleWH * fromEdge, vec2(1.0, 1.0));

                // simulate 2x virtual pixel size, for crisp display on low-res
                vec2 inTexel = mod(distortedUVPosition * consoleWH * 0.5, vec2(1.0));

                float distToGlitch = glitchLine - (distortedUVPosition.y - inTexel.y / consoleH);
                float glitchOffsetLinear = step(0.0, distToGlitch) * max(0.0, glitchDistance - distToGlitch) / glitchDistance;
                float glitchOffset = glitchOffsetLinear * glitchOffsetLinear;

                vec2 inTexelOffset = inTexel - 0.5;
                float scanlineAmount = inTexelOffset.y * inTexelOffset.y / 0.25;
                float intensity = 8.0 - scanlineAmount * 5.0 + glitchOffset * 2.0; // ray intensity is over-amped by default
                vec2 uvAdjustment = inTexelOffset * vec2(0.0, .5 / consoleH); // remove vertical texel interpolation

                distortedUVPosition.x -= glitchOffset * glitchAmount * 0.035; //+ 0.011 * (glitchFlutter * glitchFlutter * glitchFlutter);

                vec4 sourcePixel = texture2D(
                    sprite,
                    (distortedUVPosition - 0.0) * consoleWH / vec2(textureW, textureH)
                );

                vec3 pixelRGB = sourcePixel.rgb * sourcePixel.a;

                // multiply by source alpha as well
                float screenFade = 1.0 - dot(center, center) * 1.8;
                float edgeFade = fromEdgePixel.x * fromEdgePixel.y;
                gl_FragColor = vec4(edgeFade * screenFade * mix(
                    bgColor,
                    fgColor,
                    intensity * 0.2 * pixelRGB
                ) * (1.0 - 0.2 * scanlineAmount), 0.2);
            } else {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            }
        }
    `,

    attributes: {
        position: regl.buffer([
            [-1, -1, 0],
            [1, -1, 0],
            [-1, 1, 0],
            [1, 1, 0]
        ])
    },

    uniforms: {
        time: regl.context('time'),
        camera: regl.prop('camera'),
        sprite: spriteTexture,
        bgColor: regl.prop('bgColor'),
        fgColor: regl.prop('fgColor')
    },

    primitive: 'triangle strip',
    count: 4,

    depth: {
        enable: false
    },

    blend: {
        enable: false,
        func: {
            src: 'src alpha',
            dst: 'one minus src alpha'
        }
    }
});

regl.clear({
    depth: 1,
    color: [0, 0, 0, 1]
});

// main loop
let currentTime = performance.now();

function rafBody() {
    // measure time
    const newTime = performance.now();
    const delta = Math.min(0.05, (newTime - currentTime) / 1000); // apply limiter to avoid frame skips
    currentTime = newTime;

    renderWorld(delta);

    regl.poll();
    spriteTexture.subimage(bufferContext, consolePad, consolePad);
    quadCommand({
        bgColor: termBgColor,
        fgColor: termFgColor
    });

    // requestAnimationFrame(rafBody);
}

// kickstart the loop
// rafBody();


document.addEventListener('keydown', function (event) {
    // arrow right
    if (event.key === 'ArrowRight') {
        requestAnimationFrame(rafBody);
    }
});