const LobbyManager = require("./LobbyManager");

class Lobby {
    /* Class for holding information about existing game lobbies (players, gametype, state etc...) */    
    constructor(name, password) {
        this.gameClient = null;
        this.displayName = name;
        this.password = password;
        this.playerList = [];
        this.id = CreateUUID("LOBBY");
        this.vipPlayerId = null;
        this.maxSize = 8;
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
        lobbyManager.DeleteLobby(this.id);
    }
    /**
     * Returns the amount of players in the lobby.
     * @returns {int}
     */
    PlayerCount() {
        return this.playerList.length;
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

module.exports = Lobby;