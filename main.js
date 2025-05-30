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
renderer.setClearColor(0x102030);

// set up Splatter
const splatter = new Splatter(context, {splatId: 'fmd-iuw'});
splatter.setTransform(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

// set up scene
const scene = new THREE.Scene();

const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x44aa88 });
const cube = new THREE.Mesh(new THREE.BoxGeometry(), cubeMaterial);
cube.position.set(0, 0.5, 0);
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
camera.position.set(-4, 4, 2);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.rotateSpeed = 0.5;

// set up a splat shader effect
// TODO

// render scene (on demand)
function render(deltaTime) {
    frameRequested = false;
    renderer.render(scene, camera);
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
    render();
}

// recenter on double-click
let lastTime = -1e3;
function onclick(event) {
    if (performance.now() - lastTime < 300) {
        let pt = splatter.hitTest(camera, event.clientX, event.clientY);
        if (pt) {
            controls.target.copy(pt);
            ball.position.copy(pt);
            update();
        }
    }
    lastTime = performance.now();
}

resize();
update();

window.addEventListener('resize', resize);
controls.addEventListener('change', update);
splatter.addEventListener('update', update);
canvas.addEventListener('pointerdown', onclick);
