import {Lobby} from './lobby.mjs';
class LobbyEvents {
    constructor(clientSocket) {
        //Buttons
        this.joinLobbyButton = null;
        //Inputs
        this.usernameInput = null;
        this.roomidInput = null;
        //Other
        this.lobbyMenuLoader = null;
        this.clientSocket = clientSocket;

        this.socketEvents = [];
    }
    /**
     * Adds a new socket event to the list of socket events yet to be bound.
     * @param {string} name
     * @param {function} callback
    */
    RegisterSocketEvent(name, callback) {
        this.socketEvents.push({name: name, callback: callback});
    }
    /**
     * Takes all registered event names and callbacks, and binds them to the client socket.
    */
    SetupSocketEvents() {
        this.socketEvents.forEach(event => {
            this.clientSocket.on(event.name, event.callback);
            console.log("[Lobby Events]: Setup event: '" + event.name + "'.");
        });
    }
    /**
     * Defines all DOM element references to the lobby menu interface.
    */
    SetupDOMElements() {
        //Containers
        this.joinLobbyContainer = document.getElementById("joinLobbyContainer");
        this.waitMenuContainer = document.getElementById("waitMenuContainer");
        this.vipContainer = document.getElementById("vipContainer");

        //Buttons
        this.joinLobbyButton = document.getElementById("joinLobbyButton");
        this.usernameInput = document.getElementById("usernameInput");
        this.roomidInput = document.getElementById("roomidInput");

        //error labels
        this.usernameErrorLabel = document.getElementById("usernameErrorLabel");
        this.roomIdErrorLabel = document.getElementById("roomIdErrorLabel");
        this.connectionErrorLabel = document.getElementById("connectionErrorLabel");
        this.lobbyIdErrorLabel = document.getElementById("lobbyIdErrorLabel");
        
        //Other elements.
        this.lobbyMenuLoader = document.getElementById("lobbyMenuLoader");
        this.BindClickEvents();
    }
    /**
     * Adds all relevant click events for buttons on the lobby menu.
    */
    BindClickEvents() {
        this.joinLobbyButton.addEventListener("click", this.TryJoinLobby.bind(this));
    }
    /**
     * Run when the player tries to join a lobby by clicking the 'Join lobby' button. If all fields are provided
     * the server is notified of a join attempt.
    */
    TryJoinLobby() {
        if(this.clientSocket == null) {
            this.ErrorInput("connection");
            return;
        }
        let username = this.usernameInput.value;
        let roomId = this.roomidInput.value;

        //Show work is being done.
        this.ToggleButton(this.joinLobbyButton, false);
        this.ToggleLoader(true);

        //Validate input fields.
        if(username == "" || roomId == "") {
            if(username == "") {this.ErrorInput("username"); }
            if(roomId == "") { this.ErrorInput("roomId"); }
            this.ToggleButton(this.joinLobbyButton, true);
            this.ToggleLoader(false);
            return;
        }
        
        //Inputs validated.
        this.clientSocket.emit("tryJoinLobby_Request", { lobbyId: roomId, playerNick: username });

    }
    /**
     * Handles the server response when joining a lobby.
     * @binding { playerSocket: [Socket], ctx: [App] }
     * @data { success: [bool], players: [Array<PackedPlayer>], isVip: [bool], shortId: [string] }
     * @param {Object} data 
    */
    TryJoinLobbyResponse(data) {
        let context = this.ctx.lobbyEvents;
        let playerSocket = this.playerSocket;
        let successful = data.success;
        let players = data.players; //Todo: use this maybe?
        let isVip = data.isVip;
        let shortId = data.shortId;
        if(!successful) {
            context.ErrorInput("lobbyId");
            //Enable ui.
            context.ToggleButton(context.joinLobbyButton, true);
            context.ToggleLoader(false); 
            return;
        }       
        //Successfully joined.
        context.currentLobby = new Lobby(shortId, players);
        context.ToggleButton(context.joinLobbyButton, true);
        context.ToggleLoader(false);
        context.HideErrors();
        context.GotoWaitMenu(isVip);
    }
    /**
     * Run when the game client (lobby owner) has disconnected.
     * @binding { playerSocket: [Socket], ctx: [App] }
     * @param {Object} data 
     */
    LobbyDeletedRequest() {
        this.ctx.currentLobby = null; //Unset local lobby definition
        let context = this.ctx.lobbyEvents;
        context.GotoLobbyMenu(); //Update GUI to show lobby menu again.
    }
    /**
     * Displays an error label corresponding to the type passed into the function.
     * @param {string} type 
    */
    ErrorInput(type) {
        if(type =="username") {
            this.usernameErrorLabel.style.display = "block";
        } else if(type == "roomId") {
            this.roomIdErrorLabel.style.display = "block";
        } else if(type == "connection") {
            this.connectionErrorLabel.style.display = "block";
        } else if(type == "lobbyId") {
            this.lobbyIdErrorLabel.style.display = "block";
        }
    }
    /**
     * Hides all error labels on the dom element.
    */
    HideErrors() {
        this.usernameErrorLabel.style.display = "none";
        this.roomIdErrorLabel.style.display = "none";
        this.connectionErrorLabel.style.display = "none";
        this.lobbyIdErrorLabel.style.display = "none";
    }
    /**
     * Handles the server response when joining a lobby. True for the val parameter will enable the button.
     * @param {HTMLButtonElement} button
     * @param {bool} val 
    */
    ToggleButton(button, val) {
        button.disabled = !val;
    }
    /**
     * Shows / hides the css loader DOM element.
     * @param {bool} bool
    */
    ToggleLoader(bool) {
        this.lobbyMenuLoader.style.display = (bool) ? "inline-block" : "none";
    }
    /**
     * Hides all other containers and shows the joined player interface.
     * @param {bool} isVip
     */
    GotoWaitMenu(isVip) {
        this.HideContainers();
        //Wait for other containers to hide.
        setTimeout(()=> {
            this.joinLobbyContainer.style.display = "none";
            this.waitMenuContainer.style.display = "block";
            this.waitMenuContainer.classList.remove("animate_fadeOut");
            this.waitMenuContainer.classList.add("animate__fadeIn");
            console.log("showing wait menu!");
            if(isVip) {
                this.vipContainer.style.display = "block";
            }
        }, 1000);
    }
    /**
     * Hides all other containers and shows the lobby menu.
     */
    GotoLobbyMenu() {
        this.HideContainers();
        console.log("going back to lobby??");
        //Wait for other containers to hide.
        setTimeout(()=> {
            this.waitMenuContainer.style.display = "none";
            this.joinLobbyContainer.style.display = "block";
            this.joinLobbyContainer.classList.add("animate__fadeIn");
            console.log("showing join lobby menu!");
        }, 1000);
    }
    /**
     * Hides all containers that may be showing with css.
     */
    HideContainers() {
        if(this.joinLobbyContainer.style.display != "none" && this.joinLobbyContainer.style.display != "") {
            this.joinLobbyContainer.classList.remove("animate__fadeIn");
            this.joinLobbyContainer.classList.add("animate__fadeOut");
            console.log("hiding join lobby menu!");
        }
        console.log("Data: '" + this.waitMenuContainer.style.display + "'");
        if(this.waitMenuContainer.style.display != "none" && this.waitMenuContainer.style.display != "") {
            this.waitMenuContainer.classList.remove("animate__fadeIn");
            this.waitMenuContainer.classList.add("animate__fadeOut");
            console.log("hiding wait menu!");
        }
    }
}
export { LobbyEvents };