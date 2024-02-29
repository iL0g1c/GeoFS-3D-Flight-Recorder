class Logger {
    constructor () {
        
    }
    async getMapUsers() {
        try {
            const response = await fetch("https://mps.geo-fs.com/map", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({})
            });
        
            const response_body = await response.json();
            const userList = response_body.users;
            
            return userList;
        } catch (error) {
            console.error('Error connecting to GeoFS Map API: ', error);
        }
    }
}

export { Logger };