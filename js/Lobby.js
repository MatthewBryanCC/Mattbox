const LobbyManager = require("./LobbyManager");
class GameType {
    "FNF" = 0
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
        this.game = null; //Todo: Create game class.
        this.maxSize = 8;
        this.serverReference = ctx;
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
        delete this.playerList[player.id]; 
        this.AssignNewVIPOrDelete();
        return true;
    }
    /**
     * Used to reassign the vip player, or delete the lobby if empty.
     * @returns {bool}
     */
    AssignNewVIPOrDelete() {
        if(this.playerList.length < 1) { this.DestroyLobby(); return false; }
        let randomPlayer = this.GetRandomLobbyPlayer();
        this.vipPlayerId = randomPlayer.id;
        return true;
    }
    /**
     * Sends a message to the unity game client with all the connected clients.
     */
    ReloadGameClientUsers() {
        let dataPacket = PackPlayers();
        this.gameClient.emit("reloadClients", dataPacket);
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
        console.log("[Lobby]: Broadcasting close event.");
        this.playerList.forEach(client => {
            if(client.clientType == ClientType.PLAYER) {
                client.socketReference.emit("lobby_deleted");
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
    ChooseGame(gameType) {
        if(gameType == GameType.FNF) { console.log("yup"); }
    }
}

/**
 * Packs the lobby players into an array with relevant data.
 * @returns {Array<PackedPlayer>}
 */
function PackPlayers() {
    let data = []
    this.playerList.forEach(player => {
        data.push({
            id: player.id,
            nick: player.nick
        });
    });
    return data;
}
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