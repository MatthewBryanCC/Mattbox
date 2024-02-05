const LobbyManager = require("./LobbyManager");

class Lobby {
    /* Class for holding information about existing game lobbies (players, gametype, state etc...) */    
    constructor() {
        this.displayName = "";
        this.password = "";
        this.playerList = [];
        this.id = CreateUUID("LOBBY");
        this.vipPlayerId = null;
        this.maxSize = 8;
    }
    AddPlayer(player, tryPassword) { //Adds a player to the lobby. Boolean returns if successful.
        if(this.password != "") {
            //Check password
            if(tryPassword != this.password) { return false; }
        }
        if(this.PlayerCount() < this.maxSize) {
            this.playerList[player.id] = player;
            return true; 
        } else { return false; }
    }
    RemovePlayer(player) { //Removes a player to the lobby. Boolean returns if successful.
        if(this.playerList[player.id] == null) { return false; } //Couldn't find player.
        delete this.playerList[player.id]; 
        this.ReloadLobbyUsers();
        return true;
    }
    ReloadLobbyUsers() { //Used to reassign the vip player, or delete the lobby if empty.
        if(this.playerList.length < 1) { this.DestroyLobby(); return; }
        let randomPlayer = this.GetRandomLobbyPlayer();
        this.vipPlayerId = randomPlayer.id;
    }
    GetRandomLobbyPlayer() { //Returns a random player in playerList
        let keys = Object.keys(this.playerList);
        let randomKey = keys[Math.floor(Math.random(keys.length))];
        return this.playerList[randomKey];
    }
    AssignVIP(player) { //Assigns the vip player id.
        this.vipPlayerId = player.id;
    }
    DestroyLobby() { //Lobby unalives itself.
        lobbyManager.DeleteLobby(this.id);
    }
    PlayerCount() { //Returns the amount of players in the lobby.
        return this.playerList.length;
    }
}

module.exports = Lobby;