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
    AddPlayer(player, tryPassword) { //Adds a player to the lobby. [return: bool]
        if(this.password != "") {
            //Check password
            if(tryPassword != this.password) { return false; }
        }
        if(this.PlayerCount() < this.maxSize) {
            this.playerList[player.id] = player;
            return true; 
        } else { return false; }
    }
    RemovePlayer(player) { //Removes a player to the lobby. [return: bool]
        if(this.playerList[player.id] == null) { return false; } //Couldn't find player.
        delete this.playerList[player.id]; 
        this.AssignNewVIPOrDelete();
        return true;
    }
    AssignNewVIPOrDelete() { //Used to reassign the vip player, or delete the lobby if empty. [return: bool]
        if(this.playerList.length < 1) { this.DestroyLobby(); return false; }
        let randomPlayer = this.GetRandomLobbyPlayer();
        this.vipPlayerId = randomPlayer.id;
        return true;
    }
    ReloadGameClientUsers() { //Sends a message to the unity game client with all the connected clients. [return: none]
        let dataPacket = PackPlayers();
        this.gameClient.emit("reloadClients", dataPacket);
    }
    GetRandomLobbyPlayer() { //Returns a random player in playerList. [return: array<Player>]
        let keys = Object.keys(this.playerList);
        let randomKey = keys[Math.floor(Math.random(keys.length))];
        return this.playerList[randomKey];
    }
    AssignGameClient(socket) { //Defines the unity game client for this lobby. [return: bool]
        let playerClient = CLIENT_LIST[socket.id];
        if(playerClient == null) { return false; }
        this.gameClient = playerClient;
        return true;
    }
    AssignVIP(player) { //Assigns the vip player id. [return: bool]
        if(player == null) { return false; }
        this.vipPlayerId = player.id;
        return true;
    }
    DestroyLobby() { //Lobby unalives itself. [return: none]
        lobbyManager.DeleteLobby(this.id);
    }
    PlayerCount() { //Returns the amount of players in the lobby. [return: int]
        return this.playerList.length;
    }
}

function PackPlayers() { //Packs the lobby players into an array with relevant data. [return: array<PackedPlayer>]
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