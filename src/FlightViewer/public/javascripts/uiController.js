// Allow teleporting to origin of line
// Allow flight speed control
// Modify line position to set the closest point to 0,0,0 to 0,0,0
// add a grid

import * as THREE from '../javascripts/three.module.js';
import { Logger } from '../javascripts/logger.js';
import { Renderer } from '../javascripts/renderer.js';

class UIController {
    constructor() {
        this.logger = new Logger();
        this.onlineUsers = [];
        this.checkboxStates = {};
        this.tracking = false;
        this.flightPath = {};
        this.render = false;

        this.mainRenderer = new Renderer(500, 500);
        this.mainRenderer.animate();

        this.updateList = this.updateList.bind(this);
        this.fetchOnlineUsers();

        document.getElementById('speed-input').addEventListener('input', this.changeSpeed.bind(this)); // Camera speed
        document.getElementById('toggle-render').addEventListener('click', this.toggleRender.bind(this)); // Render loaded flight paths
        document.getElementById('jump-to-origin').addEventListener('click', this.jumpToClosestOrigin.bind(this)); // Jump to closest origin point
        document.getElementById('refresh-user').addEventListener('click', this.fetchOnlineUsers.bind(this)); // Grab online users from GeoFS
        document.getElementById('search-input').addEventListener('input', this.updateList.bind(this)); // Search for users
        document.getElementById('toggle-tracking').addEventListener('click', this.toggleTracking.bind(this)); // Start/stop tracking on GeoFS API
        document.getElementById('save-flight-path').addEventListener('click', this.downloadFlightPath.bind(this)); // Save flight path to JSON

        const renderCanvas = this.mainRenderer.renderer.domElement;
        renderCanvas.addEventListener('keydown', this.preventScrolling.bind(this));
        renderCanvas.setAttribute('tabindex', '0');

        this.updateCameraPosition();
    }

    async fetchOnlineUsers() {
        this.onlineUsers = [];
        try {
            const response = await fetch("https://mps.geo-fs.com/map");
            const data = await response.json();

            for (let i = 0; i < data['users'].length; i++) {
                let callsign = "";
                if (data['users'][i] != undefined) {
                    let acid = data['users'][i].acid;
                    if (acid === null)
                    {
                        continue;
                    } else {
                        if (data['users'][i].cs === undefined) {
                            callsign = "Unprovided";
                        } else {
                            callsign = data['users'][i].cs;
                        }
                        this.onlineUsers.push([callsign, acid]);
                    }
                }
            }
            this.updateList();
        } catch (error) {
            console.error('Error while fetching online users:', error);
        }
    }
    downloadFlightPath() {
        let closestOrigin = new THREE.Vector3(0, 0, 0);
        let shortestDistance = Infinity;
        const flightPaths = Object.keys(this.flightPath);
        for (let i = 0; i < flightPaths.length; i++) {
            const unparsedUser = this.flightPath[flightPaths[i]][0];
            const user = new THREE.Vector3(unparsedUser.x, unparsedUser.y, unparsedUser.z);
            const distance = user.distanceTo(closestOrigin);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestOrigin = user;
            }
        }
        for (let i = 0; i < flightPaths.length; i++) {
            for (let j = 0; j < this.flightPath[flightPaths[i]].length; j++) {
                this.flightPath[flightPaths[i]][j].sub(closestOrigin);
            }
        }
        console.log(this.flightPath);
        this.jsonString = JSON.stringify(this.flightPath);
        let blob = new Blob([this.jsonString], { type: 'application/json' });
        let a = document.createElement('a');
        a.download = "flightPath.json";
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    loadFlightPath() {;
        return new Promise((resolve, reject) => {
            const flightPathFile = document.getElementById('file-input').files[0];
            const reader = new FileReader();
    
            reader.onload = (e) => {
                try {
                    const fileContent = JSON.parse(e.target.result);
                    this.flightPath = fileContent;
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
    
            reader.readAsText(flightPathFile);
        });
    }

    updateList() {
        const searchInput = document.getElementById('search-input').value.toLowerCase();
        const scrollableList = document.getElementById('user-list');
        const filteredItems = this.onlineUsers.filter(item => item[0].toLowerCase().includes(searchInput));
        const listHTML = filteredItems.map(item => `
            <div>
                <input type="checkbox" id="${item[1]}" value="${item[1]}" ${this.checkboxStates[item[1]] ? 'checked' : ''}>
                <label for="${item[1]}"><b>${item[0]}</b> | (${item[1]})</label>
            </div>
        `).join('');
        scrollableList.innerHTML = listHTML;

        filteredItems.forEach(item => {
            const checkbox = document.getElementById(item[1]);
            if (checkbox) {
                this.checkboxStates[item[1]] = checkbox.checked;
            }
        });
    }

    async toggleTracking() {
        if (this.tracking) {
            this.tracking = false;
            document.getElementById('toggle-tracking').innerText = 'Start Tracking';
            return;
        }
    
        this.tracking = true;
        this.flightPath = {};
        document.getElementById('toggle-tracking').innerText = 'Stop Tracking';
        this.getSelectedUsers();
        await this.trackUsers();
    }

    toggleRender() {
        if (this.render) {
            this.render = false;
            document.getElementById('toggle-render').innerText = 'Start Rendering';
            return;
        }
    
        this.render = true;
        this.loadFlightPath().then(() => {
            console.log(this.flightPath);
            document.getElementById('toggle-render').innerText = 'Stop Rendering';
            this.mainRenderer.bindLines(this.flightPath);
        }).catch((error) => {
            console.error('Error loading flight path:', error);
            // Handle the error as needed
        });
    }

    getSelectedUsers() {
        this.selectedUsers = [];
        const userContainer = document.getElementById('user-list');

        const checkboxes = userContainer.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const userId = checkbox.value;
                this.selectedUsers.push(Number(userId));
            }
        });
    }

    async trackUsers() {
        if (!this.tracking) return;
    
        try {
            const data = await this.logger.getMapUsers();
            let processedData = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i] != null) {
                    if (data[i].acid != null) {
                        processedData.push(data[i]);
                    }
                }
            }

            for (let i = 0; i < this.selectedUsers.length; i++) {
                const user = processedData.find(user => user.acid === this.selectedUsers[i]);
                let coordinates = new Array(3);
                if (user) {
                    coordinates = llhxyz(user.co[0], user.co[1], user.co[2]);
                    if (this.flightPath[user.acid] === undefined) {
                        this.flightPath[user.acid] = [];
                    }
                    this.flightPath[user.acid].push(new THREE.Vector3(coordinates[0], coordinates[1], coordinates[2]));
                }
            }
            console.log(this.flightPath);

            setTimeout(() => this.trackUsers(), 1000);  // Adjust the delay as needed
        } catch (error) {
            console.error('Error while tracking users:', error);
            this.tracking = false;
            document.getElementById('toggle-tracking').innerText = 'Start Tracking';
        }
    }

    updateCameraPosition() {
        const cameraPositionElement = document.getElementById('camera-details');

        function update() {
            const cameraPosition = this.mainRenderer.camera.position.clone();
            const cameraRotation = this.mainRenderer.camera.rotation.clone();

            cameraPositionElement.innerHTML = `
            <p>Camera Position: x=${cameraPosition.x.toFixed(2)}, y=${cameraPosition.y.toFixed(2)}, z=${cameraPosition.z.toFixed(2)}<p>
            <p>Camera Rotation: x=${cameraRotation.x.toFixed(2)}, y=${cameraRotation.y.toFixed(2)}, z=${cameraRotation.z.toFixed(2)}<p>
            `;
            requestAnimationFrame(update.bind(this));
        }
        update.call(this);
    }

    changeSpeed() {
        const speedInput = document.getElementById('speed-input');
        const speedValue = parseFloat(speedInput.value); // Convert to number

        if (!isNaN(speedValue) && speedValue >= 0.1 && speedValue < 1000) {
            this.mainRenderer.controls.movementSpeed = speedValue;
        }

        console.log(this.mainRenderer.controls.movementSpeed);
    }

    jumpToClosestOrigin() {
        let closestOrigin = new THREE.Vector3(0, 0, 0);
        let shortestDistance = Infinity;
        const flightPaths = Object.keys(this.flightPath);
        for (let i = 0; i < flightPaths.length; i++) {
            const unparsedUser = this.flightPath[flightPaths[i]][0];
            const user = new THREE.Vector3(unparsedUser.x, unparsedUser.y, unparsedUser.z);
            const distance = user.distanceTo(closestOrigin);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestOrigin = user;
            }
            this.mainRenderer.controls.object.position.set(closestOrigin.x, closestOrigin.y, closestOrigin.z);
        }

        this.mainRenderer.controls.object.position.set(closestOrigin.x, closestOrigin.y, closestOrigin.z);
    }

    preventScrolling(event) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
        }
    }
}

export { UIController };