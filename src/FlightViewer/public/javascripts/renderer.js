import * as THREE from '../javascripts/three.module.js';
import { FlyControls } from '../javascripts/FlyControls.js';

class FightPath {
    constructor(flightPath) {
        this.geometry = new THREE.BufferGeometry().setFromPoints(flightPath);
        this.material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        this.line = new THREE.Line(this.geometry, this.material);
    }
}

class Renderer {
    constructor(Width, Height) {
        // Set up the scene
        this.canvasWidth = Width;
        this.canvasHeight = Height;
        this.scene = new THREE.Scene();

        // Set up the camera
        this.camera = new THREE.PerspectiveCamera(75, this.canvasWidth / this.canvasHeight, 0.1, 1000);
        this.camera.position.z = 5;
        
        // Set up the renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        document.getElementById('renderer').appendChild(this.renderer.domElement);

        // Set up the controls
        this.controls = new FlyControls(this.camera, this.renderer.domElement);
        this.controls.dragToLook = true;
        this.controls.movementSpeed = 0.1;
        this.controls.rollSpeed = 0.01;
        this.isDragging = false;
        this.previousMousePosition = {
            x: 0,
            y: 0
        };

        // Create skybox
        const cubeTexture = new THREE.CubeTextureLoader().load([
            'images/skybox.jpg',
            'images/skybox.jpg',
            'images/skybox.jpg',
            'images/skybox.jpg',
            'images/skybox.jpg',
            'images/skybox.jpg'
        ])
        this.scene.background = cubeTexture;

        document.addEventListener('mousedown', function (event) {
            this.isDragging = true;
            this.previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        });

        document.addEventListener('mouseup', function () {
            this.isDragging = false;
        });

        document.addEventListener('mousemove', function (event) {
            if (this.isDragging) {
                this.deltaMove = {
                    x: event.clientX - this.previousMousePosition.x,
                    y: event.clientY - this.previousMousePosition.y
                };
        
                // Rotate the camera by a fixed angle
                this.controls.object.rotation.y -= this.deltaMove.x * 0.01;
                this.controls.object.rotation.x -= this.deltaMove.y * 0.01;
        
                this.previousMousePosition = {
                    x: event.clientX,
                    y: event.clientY
                };
            }
        });
    }

    bindLines(flightPath) {
        for( var i = this.scene.children.length - 1; i >= 0; i--) { 
            let obj = this.scene.children[i];
            this.scene.remove(obj); 
        }
        const users = Object.keys(flightPath);
        for (let i = 0; i < users.length; i++) {
            this.scene.add(new FightPath(flightPath[users[i]]).line);
        }
    }

    // Start animation
    animate = () => {
        requestAnimationFrame(this.animate);
        this.controls.update(1);
        this.renderer.render(this.scene, this.camera);
    }
}

export { Renderer };