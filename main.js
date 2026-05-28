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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000);

// set up Splatter
const splatter = new Splatter(renderer, {splatId: '2qh-09m'});

// transform the splats, this is applied before all other transforms (view, projection)
let origin = new THREE.Vector3(0, 23, 0);
splatter.setTransform(
    (new THREE.Matrix4().makeTranslation(origin)).multiply
    (new THREE.Matrix4().makeRotationX(Math.PI)));

// set up scene
const scene = new THREE.Scene();

const grid = new THREE.GridHelper(10, 10);
grid.position.set(0, 0.1, 0);
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
camera.position.set(-5, 5, -5);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.rotateSpeed = 0.5;

// set up a simple splat shader effect
splatter.addUniform('float', 'effectTime');
splatter.addUniform('vec3', 'origin');
splatter.setShaderEffect(`
    // reveal effect
    float dist = length(position - origin);
    float delay = 2.0 + log(dist + 1.0) / 3.0;
    float step = smoothstep(delay, delay + 0.1, effectTime);
    scale = mix(vec3(0.005), scale, step);
`);
let revealStart = Infinity;

// render scene (on demand)
function render(deltaTime) {
    frameRequested = false;

    renderer.render(scene, camera);

    let effectTime = (performance.now() - revealStart) * 1e-3;
    splatter.setUniform('effectTime', effectTime);
    splatter.setUniform('origin', origin);

    splatter.render(camera, controls.target);

    if (controls.update(deltaTime) || effectTime < 5.0) {
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
        let pt = splatter.hitTest(camera, [event.clientX, event.clientY], {alphaThreshold: 0.01});
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
        if (revealStart == Infinity) {
            revealStart = performance.now(); // start shader effect
        }
    }
}

resize();
update();

window.addEventListener('resize', resize);
controls.addEventListener('change', update);
splatter.addEventListener('update', update); // important: redraw on streaming updates!
splatter.addEventListener('loaded', onloaded);
canvas.addEventListener('pointerdown', onclick);
