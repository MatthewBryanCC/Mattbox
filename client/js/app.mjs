class App {
    constructor() {
        this.Active = false;
        this.cSocket = io();

        this.cSocket.on("initialConnection", () => {
            alert("init!");
        });
    }
}
var app = new App();