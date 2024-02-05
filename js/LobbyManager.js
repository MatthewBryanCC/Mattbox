class LobbyManager {
    constructor() {
        this.Lobbies = []
    }
    FindLobby(id) {
        if(this.Lobbies[id] == null) { return false; }
        return this.Lobbies[id];
    }
    CreateNewLobby() {

    }
    DeleteLobby(id) { //Deletes a lobby from the server list. Boolean returns if successful.
        if(this.Lobbies[id] == null) { return false; }
        delete this.Lobbies[id];
        return true;
    }
    LeaveLobby(user) { //Removes a user from the lobby. Boolean returns if successful.
        if(user == null) { return false; }
        return user.LeaveLobby();
    }
    GetLobby(id) { //Returns a Lobby type object from Lobbies, relating to the id.
        return this.Lobbies[id];
    }
}
module.exports = LobbyManager;