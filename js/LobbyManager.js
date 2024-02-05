class LobbyManager {
    constructor() {
        this.Lobbies = []
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
     * @returns {Lobby}
     */
    CreateNewLobby(name, password) { // [return: Lobby || false]
        if(name == "" || name == null) { return false; }
        let newLobby = new Lobby(name, password);
        this.Lobbies[newLobby.id] = newLobby;
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
    /**
     * Returns a Lobby type object from Lobbies, relating to the id.
     * @param {string} id 
     * @returns {Array<Lobby>}
     */
    GetLobby(id) {
        return this.Lobbies[id];
    }
}
module.exports = LobbyManager;