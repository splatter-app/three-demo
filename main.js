import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Splatter } from 'splatter-three';

// create WebGL2 context -- required for Splatter
const options = {
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
}
const canvas = document.createElement('canvas');
const context = canvas.getContext('webgl2', options);
if (!context) {
    alert('WebGL2 not supported in this browser');
    throw new Error('WebGL2 not supported');
}
document.body.appendChild(canvas);

// set up Three.js renderer
const renderer = new THREE.WebGLRenderer({ canvas, context });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000);

// set up Splatter
const splatter = new Splatter(context, {splatId: '7yr-idb'});
splatter.setTransform(new THREE.Matrix4().makeRotationX(130 / 180 * Math.PI));

// set up scene
const scene = new THREE.Scene();

const grid = new THREE.GridHelper(10, 10);
grid.position.set(0, -1, 0);
scene.add(grid);

const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x44aa88 });
const cube = new THREE.Mesh(new THREE.BoxGeometry(), cubeMaterial);
scene.add(cube);

const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
const ball = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 8), ballMaterial);
scene.add(ball);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff));

// set up camera and controls
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
camera.position.set(3, 3, 3);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.rotateSpeed = 0.5;

// set up a splat shader effect
splatter.addUniform('vec3', 'uWeights');
splatter.setShaderEffect(`
    float gray = dot(color, uWeights);
    color = vec3(gray);
    `);

// render scene (on demand)
function render(deltaTime) {
    frameRequested = false;

    renderer.render(scene, camera);
    splatter.setUniform('uWeights', [0.299, 0.587, 0.114]);
    splatter.render(camera, controls.target);

    if (controls.update(deltaTime)) {
        update();
    };
}

// request redraw
let frameRequested = false;
function update() {
    if (!frameRequested) {
        requestAnimationFrame(render);
        frameRequested = true;
    }
}

// handle window resize
function resize() {
    let [width, height] = [window.innerWidth, window.innerHeight];
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    update();
}

// recenter on double-click
let lastTime = -1e3;
function onclick(event) {
    if (performance.now() - lastTime < 300) {
        let pt = splatter.hitTest(camera, [event.clientX, event.clientY]);
        if (pt) {
            controls.target.copy(pt);
            ball.position.copy(pt);
            update();
        }
    }
    lastTime = performance.now();
}

// watch number of loaded/displayed Gaussians, hide spinner when enough displayed
function onloaded(totalLoaded, numDisplayed) {
    if (totalLoaded > splatter.totalSize/2 || numDisplayed > 1e6) {
        document.getElementById('spinner').style.display = 'none';
    }
}

resize();
update();

window.addEventListener('resize', resize);
controls.addEventListener('change', update);
splatter.addEventListener('update', update); // important: redraw on streaming updates!
splatter.addEventListener('loaded', onloaded);
canvas.addEventListener('pointerdown', onclick);
