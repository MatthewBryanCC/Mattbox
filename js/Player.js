class ServerClient {
    constructor(socket) {
        this.socketReference = socket;
        this.clientType = ClientType.USER;
        this.debugMode = true;
    }
    AssignClientType(clientType) { //Assigns the connected user to be either a game client, or web client. [return: none]
        this.clientType = clientType;
        if(this.debugMode) { console.log("[Server Client]: Successfully assigned client type '" + RClientType[clientType] + "'."); }
    }
}

class Player extends ServerClient {
    constructor(socket) {
        super(socket);
        this.nick = "";
        this.id = socket.id;
        this.socketReference = socket;
        this.lobbyId = null;
    }
    /**
     * Returns the socket assigned to this player.
     * @returns {Socket}
     */
    GetSocket() {
        return this.socketReference;
    }
    /**
     * Returns the lobby the player is in if it exists.
     * @returns {Lobby}
     */
    GetPlayerLobby() {
        return lobbyManager.GetLobby(this.lobbyId);
    }
    /**
     * Returns if the player is a vip or not.
     * @returns {bool}
     */
    IsVIP() {
        if(this.lobbyId == null) { return false; }
        return (this.GetPlayerLobby().vipPlayerId == this.id)
    }
    /**
     * Makes the player leave their current lobby. Bool returns successful leaving.
     * @returns {bool}
     */
    LeaveLobby() {
        let lobby = this.GetPlayerLobby();
        if(lobby == null) { return false; }
        return lobby.RemovePlayer(this);
    }
}
module.exports = {ServerClient, Player};