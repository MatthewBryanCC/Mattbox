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
    GetClientType() {
        return this.clientType;
    }
    IsGameClient() { 
        return (this.clientType == ClientType.GAME);
    }
}

class Player extends ServerClient {
    constructor(socket, ctx) {
        super(socket);
        this.nick = "";
        this.id = socket.id;
        this.socketReference = socket;
        this.lobbyId = null;
        this.serverReference = ctx;
        this.debugMode = true;
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
        if(!this.IsInLobby()) { return null; }
        return this.serverReference.lManager.FindLobby(this.lobbyId);
    }
    /**
     * Returns if the player is currently in a lobby.
     * @returns {bool}
     */
    IsInLobby() {
        return (this.lobbyId != null);
    }
    /**
     * Returns true if the player is the game client owner of the lobby they're in.
     * @returns {bool}
     */
    IsLobbyGameClient() {
        if(!this.IsInLobby()) { return false; }
        if(this.IsGameClient()) {
            let lobby = this.GetPlayerLobby();
            if(lobby != null) {
                if(lobby.ownerClientId == this.id) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Returns if the player is a vip or not.
     * @returns {bool}
     */
    IsVIP() {
        if(this.lobbyId == null) { return false; }
        return (this.GetPlayerLobby().vipPlayerId == this.id)
    }
    SetLobbyId(id) {
        this.lobbyId = id;
    }
    /**
     * Makes the player leave their current lobby. Bool returns successful leaving.
     * @returns {bool}
     */
    LeaveLobby() {
        if(this.debugMode) { console.log("[Server Client]: User '" + this.id + "' trying to leave lobby..."); }

        let lobby = this.GetPlayerLobby();
        if(lobby == null) { return false; }
        this.lobbyId = null;
        this.nick = "";
        return lobby.RemovePlayer(this);
    }
}
module.exports = {ServerClient, Player};