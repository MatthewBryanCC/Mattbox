class LobbyManager {
    constructor() {
        this.Lobbies = []
    }
    FindLobby(id) { // Finds a lobby with a given id. [return: Lobby || false]
        if(this.Lobbies[id] == null) { return false; }
        return this.Lobbies[id];
    }
    CreateNewLobby(name, password) { //Creates a new lobby if valid, and adds it to the list. [return: Lobby || false]
        if(name == "" || name == null) { return false; }
        let newLobby = new Lobby(name, password);
        this.Lobbies[newLobby.id] = newLobby;
        return newLobby;
    }
    DeleteLobby(id) { //Deletes a lobby from the server list. Boolean returns if successful. [return: bool]
        if(this.Lobbies[id] == null) { return false; }
        delete this.Lobbies[id];
        return true;
    }
    LeaveLobby(user) { //Removes a user from the lobby. Boolean returns if successful [return: bool].
        if(user == null) { return false; }
        return user.LeaveLobby();
    }
    GetLobby(id) { //Returns a Lobby type object from Lobbies, relating to the id. [return: array<Lobby>]
        return this.Lobbies[id];
    }
}
module.exports = LobbyManager;