let Lobby = require('./Lobby');
class LobbyManager {
    constructor() {
        this.Lobbies = []
        this.debugMode = true;
    }
    /**
     * Finds a lobby with a given id.
     * @param {string} id 
     * @returns {Lobby}
     */
    FindLobby(id) { //  [return: Lobby || false]
        if(this.Lobbies[id] == null) { return false; }
        return this.Lobbies[id];
    }
    /**
     * Creates a new lobby if valid, and adds it to the list.
     * @param {string} name 
     * @param {string} password 
     * @param {Server} ctx
     * @returns {Lobby}
     */
    CreateNewLobby(ownerId, password, ctx) { // [return: Lobby || false]
        let newLobby = new Lobby(ownerId, password, ctx);
        this.Lobbies[newLobby.id] = newLobby;
        //Assign this client to that lobby.
        let playerClient = CLIENT_LIST[ownerId];
        playerClient.SetLobbyId(newLobby.id);

        if(this.debugMode) { console.log("[Lobby Manager]: Created and added new lobby! " + this.Lobbies + ", and owner id is " + newLobby.ownerClientId); }
        return newLobby;
    }
    /**
     * Deletes a lobby from the server list. Boolean returns if successful.
     * @param {string} id 
     * @returns {bool}
     */
    DeleteLobby(id) {
        if(this.Lobbies[id] == null) { return false; }
        delete this.Lobbies[id];
        return true;
    }
    /**
     * Removes a user from the lobby. Boolean returns if successful
     * @param {Player} user 
     * @returns {bool}
     */
    LeaveLobby(user) { 
        if(user == null) { return false; }
        return user.LeaveLobby();
    }

}
module.exports = LobbyManager;