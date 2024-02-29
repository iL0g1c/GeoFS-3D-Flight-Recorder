import * as THREE from '../javascripts/three.module.js';
import { FlyControls } from '../javascripts/FlyControls.js';

function setup() {
    // Set up the scene
    const canvasWidth = window.innerWidth - 100;
    const canvasHeight = window.innerHeight - 100;
    const scene = new THREE.Scene();

    // Set up the camera
    const camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create the renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(canvasWidth, canvasHeight);
    document.body.appendChild(renderer.domElement);

    // Setup controls
    const controls = new FlyControls(camera, renderer.domElement);
    controls.dragToLook = true;
    controls.movementSpeed = 0.1;
    controls.rollSpeed = 0.01;

    // Test points
    const pointsArray = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 1, 1),
        new THREE.Vector3(0, 0, 1),
    ];

    // Create the line and geometry
    const geometry = new THREE.BufferGeometry().setFromPoints(pointsArray);
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });

    const line = new THREE.Line(geometry, material);
    scene.add(line);

    // Allow window resizing
    window.addEventListener('resize', function () {
        const newWidth = this.canvasWidth;
        const newHeight = this.canvasHeight;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        
        renderer.setSize(newWidth, newHeight);
    });

    let isDragging = false;
    let previousMousePosition = {
        x: 0,
        y: 0
    };

    document.addEventListener('mousedown', function (event) {
        isDragging = true;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
    });

    document.addEventListener('mousemove', function (event) {
        if (isDragging) {
            const deltaMove = {
                x: event.clientX - previousMousePosition.x,
                y: event.clientY - previousMousePosition.y
            };
    
            // Rotate the camera by a fixed angle
            controls.object.rotation.y -= deltaMove.x * 0.01;
            controls.object.rotation.x -= deltaMove.y * 0.01;
    
            previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        }
    });

    // Start animation
    const animate = function () {
        requestAnimationFrame(animate);
        controls.update(1);
        renderer.render(scene, camera);
    }

    animate();
}

setup();