class ServerClient {
    constructor(socket) {
        this.socketReference = socket;
        this.clientType = ClientType.USER;
        this.debugMode = true;
    }
    AssignClientType(clientType) {
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
    GetPlayerLobby() {
        return lobbyManager.GetLobby(this.lobbyId);
    }
    IsVIP() {
        if(this.lobbyId == null) { return false; }
        return (this.GetPlayerLobby().vipPlayerId == this.id)
    }
    LeaveLobby() { //Makes the player leave their current lobby. Bool returns successful leaving.
        let lobby = this.GetPlayerLobby();
        if(lobby == null) { return false; }
        return lobby.RemovePlayer(this);
    }
}
module.exports = {ServerClient, Player};