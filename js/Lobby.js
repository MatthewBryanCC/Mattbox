const LobbyManager = require("./LobbyManager");
var GameType = {
    "FNF": "FNF"
}
class Lobby {
    /* Class for holding information about existing game lobbies (players, gametype, state etc...) */    
    constructor(ownerId, password, ctx) {
        this.gameClient = null;
        this.password = password;
        this.playerList = [];
        this.id = CreateUUID("LOBBY");
        this.shortId = CreateShortUUID();
        this.vipPlayerId = null;
        this.ownerClientId = ownerId;
        this.game = null;
        this.maxSize = 8;
        this.serverReference = ctx;
        this.debugMode = true;
    }
    /**
     * 
     * Adds a player to the lobby.
     * @param {Player} player 
     * @param {string} tryPassword 
     * @returns {bool}
     */
    AddPlayer(player, tryPassword) { 
        if(this.password != "") {
            //Check password
            if(tryPassword != this.password) { return false; }
        }
        if(this.PlayerCount() < this.maxSize) {
            this.playerList[player.id] = player;
            player.lobbyId = this.id;
            if(Object.keys(this.playerList).length == 1) {
                //No other player to - make this one the vip.
                this.AssignVIP(player);
            }
            return true; 
        } else { return false; }
    }
    /**
     * Removes a player to the lobby.
     * @param {Player} player 
     * @returns {bool}
     */
    RemovePlayer(player) {
        if(this.playerList[player.id] == null) { return false; } //Couldn't find player.
        if(player.IsVIP()) {
            this.AssignNewVIP();
        }
        if(player.IsLobbyGameClient()) {
            //Must force close lobby - game owner left.
            this.BroadcastDestroyLobby();
            this.DestroyLobby();
        }
        delete this.playerList[player.id]; 
        this.ReloadGameClientUsers();
        return true;
    }
    /**
     * Used to reassign the vip player, or delete the lobby if empty.
     * @returns {bool}
     */
    AssignNewVIP() {
        if(this.playerList.length < 1) { return false; }
        let randomPlayer = this.GetRandomLobbyPlayer();
        this.vipPlayerId = randomPlayer.id;
        return true;
    }
    /**
     * Sends a message to the unity game client with all the connected clients.
     */
    ReloadGameClientUsers() {
        let dataPacket = this.PackPlayers();
        this.GetGameClientSocket().emit("reloadClients_Request", dataPacket);
    }
    /**
     * Returns the client socket which belongs to the game client owner of this lobby.
     * @returns {Socket} 
     */
    GetGameClientSocket() {
        return SOCKET_LIST[this.ownerClientId];
    }
    /**
     * Returns a random player in playerList.
     * @returns {Player}
     */
    GetRandomLobbyPlayer() {
        let keys = Object.keys(this.playerList);
        let randomKey = keys[Math.floor(Math.random(keys.length))];
        return this.playerList[randomKey];
    }
    /**
     * Defines the unity game client for this lobby.
     * @param {Socket} socket 
     * @returns {bool}
     */
    AssignGameClient(socket) {
        let playerClient = CLIENT_LIST[socket.id];
        if(playerClient == null) { return false; }
        this.gameClient = playerClient;
        return true;
    }
    /**
     * Assigns the vip player id.
     * @param {Player} player 
     * @returns {bool}
     */
    AssignVIP(player) {
        if(player == null) { return false; }
        this.vipPlayerId = player.id;
        if(this.debugMode) { console.log("[Lobby]: Assigning new VIP player '" + this.vipPlayerId + "'."); }
        return true;
    }
    /**
     * Lobby unalives itself.
     */
    DestroyLobby() {
        this.BroadcastDestroyLobby();
        this.serverReference.lManager.DeleteLobby(this.id);
    }
    /**
     * Emits a lobby_deleted event to all connected player clients.
     */
    BroadcastDestroyLobby() {
        if(this.debugMode) { console.log("[Lobby]: Broadcasting close event.") };
        this.playerList.forEach(client => {
            if(client.clientType == ClientType.PLAYER) {
                client.LeaveLobby();
                client.socketReference.emit("lobbyDeleted_Request"); //Todo: implement this network event
            }
        });
    }
    /**
     * Returns the amount of players in the lobby.
     * @returns {int}
     */
    PlayerCount() {
        return this.playerList.length;
    }
    /**
     * Starts the game if the game type has be chosen and there's enough players.
     * @returns {bool}
     */
    StartGame() {
        //Todo: start the game via the Game class.
        return false;
    }
    /**
     * 
     * @param {GameType} gameType 
     */
    ChooseGame(gameType, playerSocket) {
        console.log("Choosing game; " + gameType);
        if(gameType == GameType.FNF) { 
            let ownerId = CLIENT_LIST[playerSocket.id].GetPlayerLobby().ownerClientId;
            let gameClientSocket = SOCKET_LIST[ownerId];
            if(gameClientSocket) {
                gameClientSocket.emit("chooseGame_Response", 1);
                console.log("Choosing game response...");
            }
        }
    }
    /**
     * Returns whether or not a game has been assigned to this lobby.
     * @returns {bool}
     */
    IsGameAssigned() { return !(this.game == null); }
    /**
     * Packs the lobby players into an array with relevant data.
     * @returns {Dictionary<string, string>} data
     */
    PackPlayers() {
        let data = {}
        this.playerList.forEach(player => {
            data[player.id] = player.nick;
        });
        return data;
    }
}

/**
 * Generates a random unique 20 character alphanumerical identifier.
 * Should be unique given the ~13.3 nonillion combinations.
 * @returns {string}
 */
function CreateUUID(type) {
    function uuid(mask = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx') {
        return `${mask}`.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
    return uuid("xxxx-xxxx-xxxx-xxxx-xxxx-" + type);
}
/**
 * Generates a new 5 character alphanumeric code to use to join the lobby.
 * @returns {string}
 */
function CreateShortUUID() {
    function uuid(mask = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx') {
        return `${mask}`.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
    let id = uuid("xxxx");
    return id.toUpperCase();
}
module.exports = Lobby;