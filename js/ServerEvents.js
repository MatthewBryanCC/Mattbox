const { Socket } = require("socket.io");

let debugMode = true;
ServerEvents = {}

/**
 * Assigns the clients user type. Either the game, or mobile / desktop user.
 * @binding { playerSocket: [Socket] }
 * @data ClientType
 * @param {Object} data 
 */
ServerEvents.AssignClientType = function(data) { // [return: none]
    let socket = this.playerSocket;
    let clientType = data.toString();
    if(debugMode) { 
        console.log("[Server Event]: Trying to assign client type for user '" + socket.id + "' - " + RClientType[clientType] + ".");
    }
    CLIENT_LIST[socket.id].AssignClientType(clientType);
    socket.emit("assignClientType_Response", clientType);
}
/**
 * Creates a new lobby and adds it to the lobby manager. 
 * @binding {playerSocket: [Socket], ctx: [ServerManager] }
 * @data { password?: [string] }
 * @param {Object} data 
 */
ServerEvents.CreateNewLobby = function(data) {
    let socket = this.playerSocket;
    let ctx = this.ctx;
    let password = data.password || "";
    let newLobby = ctx.lManager.CreateNewLobby(socket.id, password, ctx);
    newLobby.AssignGameClient(socket);
    if(newLobby == false) {
        console.log("[Server Events]: Replying with failure response to 'CreateNewLobby'");
        socket.emit("createNewLobby_Response", {result: "false", lobbyShortId: ""});
    } else {
        console.log("[Server Events]: Replying with succesful response to 'CreateNewLobby'");
        socket.emit("createNewLobby_Response", {result: "true", lobbyShortId: newLobby.shortId.toString()});
    }
}
/**
 * Changes the lobby game type to the supplied id.
 * @binding { "playerSocket" = [Socket] }
 * @data { "gamemode" = [string] }
 * @param {Object} data 
 */
ServerEvents.ChooseGameType = function(data) {
    let gamemode = data.gamemode;
    if(gamemode) {
        CLIENT_LIST[this.playerSocket.id].GetPlayerLobby().ChooseGame(gamemode, this.playerSocket);
    }
}
/**
 * Tries to join a lobby, will succeed given - the lobby exists, has that password and isn't full.
 * @binding { playerSocket: [Socket], ctx: [ServerManager] }
 * @data { lobbyId: [string], password?: [string], playerNick: [string] }
 * @param {Object} data 
 */
ServerEvents.TryJoinLobby = function(data) {
    let socket = this.playerSocket;
    let ctx = this.ctx;
    let lobbyId = data.lobbyId;
    let password = data.password || "";
    let nickname = data.playerNick || "user-" + socket.id.toString();
    let player = CLIENT_LIST[socket.id];
    let foundLobby = ctx.lManager.FindLobbyByShortId(lobbyId);
    
    if(player == null) { ServerEvents.FailJoin(socket, "player"); return; }
    if(foundLobby == false) { ServerEvents.FailJoin(socket, "lobby"); return; }
    let successfullyJoined = foundLobby.AddPlayer(player, password);
    if(!successfullyJoined) { ServerEvents.FailJoin(socket, "lobbyadd"); return; }

    ServerEvents.SucceedJoin(socket, foundLobby, player.IsVIP());
    player.nick = nickname;
}

/**
 * Tells the client they connected successfully.
 * @param {Socket} socket
 * @param {Lobby} lobby
 */
ServerEvents.SucceedJoin = function(socket, lobby, isVip) {
    //Todo: Send succeed message.
    if(debugMode) {
        console.log("[Server Event]: Player '" + socket.id + "' successfully joined a lobby!");
    }
    socket.emit("tryJoinLobby_Response", { success: true, players: lobby.PackPlayers(), isVip: isVip, shortId: lobby.shortId});
    lobby.ReloadGameClientUsers();
}
/**
 * Tells the client they failed to connect.
 * @param {Socket} socket 
 */
ServerEvents.FailJoin = function(socket, reason) {
    //Todo: Send fail message.
    console.log(reason);
    if(debugMode) {
        console.log("[Server Event]: Player '" + socket.id + "' failed joined a lobby!");
        socket.emit("tryJoinLobby_Response", { success: false, players: [], isVip: false, shortId: "" });
    }
}


module.exports = ServerEvents;