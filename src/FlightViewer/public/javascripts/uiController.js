import * as THREE from '../javascripts/three.module.js';

class UIController {
    constructor() {
        this.flightPath = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 1, 1),
            new THREE.Vector3(0, 0, 1),
        ];
        this.onlineUsers = [];
        this.checkboxStates = {};

        this.updateList = this.updateList.bind(this);
        this.fetchOnlineUsers();
        document.getElementById('refresh-user').addEventListener('click', this.fetchOnlineUsers.bind(this));
        document.getElementById('search-input').addEventListener('input', this.updateList.bind(this));
        document.getElementById('toggle-tracking').addEventListener('click', this.toggleTracking.bind(this));
    }

    async fetchOnlineUsers() {
        this.onlineUsers = [];
        try {
            const response = await fetch("https://mps.geo-fs.com/map");
            const data = await response.json();

            for (let i = 0; i < data['users'].length; i++) {
                let callsign = "";
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
            this.updateList();
        } catch (error) {
            console.error('Error while fetching online users:', error);
        }
    }
    downloadFlightPath() {
        this.jsonString = JSON.stringify(this.flightPath);
        let blob = new Blob([this.jsonString], { type: 'application/json' });
        let a = document.createElement('a');
        a.download = "flightPath.json";
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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

    toggleTracking() {
        this.getSelectedUsers();
        console.log(this.selectedUsers);
    }

    getSelectedUsers() {
        this.selectedUsers = [];
        const userContainer = document.getElementById('user-list');

        const checkboxes = userContainer.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const userId = checkbox.value;
                this.selectedUsers.push(userId);
            }
        });
    }
}

export { UIController };