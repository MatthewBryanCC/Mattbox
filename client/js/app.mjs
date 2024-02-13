import { LobbyEvents } from "./lobbyevents.mjs";
class App {
    constructor() {
        this.Active = false;
        this.cSocket = io();
        this.currentLobby = null;

        this.cSocket.on("doInitialConnection", () => {
            //alert("init!");
        });
        this.lobbyEvents = new LobbyEvents(this.cSocket);
        this.BindSocketEvents();
    }
    DOMContentLoaded() {
        this.lobbyEvents.SetupDOMElements();
    }
    BindSocketEvents() {
        this.lobbyEvents.RegisterSocketEvent("tryJoinLobby_Response", this.lobbyEvents.TryJoinLobbyResponse.bind(
            {"playerSocket":this.cSocket, "ctx": this}));
        this.lobbyEvents.RegisterSocketEvent("lobbyDeleted_Request", this.lobbyEvents.LobbyDeletedRequest.bind(
            {"playerSocket": this.cSocket, "ctx": this}));
        this.lobbyEvents.SetupSocketEvents();
    }
}

var app = new App();
document.addEventListener("DOMContentLoaded", app.DOMContentLoaded.bind(app), false);