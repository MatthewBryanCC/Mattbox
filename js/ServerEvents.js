const { Socket } = require("socket.io");

let debugMode = true;
ServerEvents = {}

/**
 * Assigns the clients user type. Either the game, or mobile / desktop user.
 * @data ClientType
 * @param {Object} data 
 */
ServerEvents.AssignClientType = function(data) { // [return: none]
    let socket = this;
    let clientType = data.toString();
    if(debugMode) { 
        console.log("[Server Event]: Trying to assign client type for user '" + socket.id + "' - " + RClientType[clientType] + ".");
    }
    CLIENT_LIST[socket.id].AssignClientType(clientType);
    socket.emit("assignClientType_Response", clientType);
}
/**
 * Creates a new lobby and adds it to the lobby manager. 
 * @data { lobbyName: [string], password?: [string] }
 * @param {Object} data 
 */
ServerEvents.CreateNewLobby = function(data) {;
    //Todo: make new lobby class
    let socket = this;
    let name = data.lobbyName;
    let password = data.password || "";
    let newLobby = lManager.CreateNewLobby(name, password);
    newLobby.AssignGameClient(socket);
    if(newLobby == false) {
        socket.emit("createNewLobby_Response", 'failed');
    } else {
        socket.emit("createNewLobby_Response", 'success');
    }
}
/**
 * Tries to join a lobby, will succeed given - the lobby exists, has that password and isn't full.
 * @data { lobbyId: [string], password?: [string], playerNick: [string] }
 * @param {Object} data 
 */
ServerEvents.TryJoinLobby = function(data) {
    let socket = this;
    let lobbyId = data.lobbyId;
    let password = data.password || "";
    let nickname = data.playerNick || "user-" + socket.id.toString();
    let player = CLIENT_LIST[socket.id];
    player.nick = nickname;

    let foundLobby = lManager.FindLobby(lobbyId);
    if(player == null) { ServerEvents.FailJoin(socket); return; }
    if(!foundLobby) { ServerEvents.FailJoin(socket); return; }
    let successfullyJoined = foundLobby.AddPlayer(player, password);
    if(!successfullyJoined) { ServerEvents.FailJoin(socket); return; }
    ServerEvents.SucceedJoin(socket);
}
/**
 * Tells the client they connected successfully.
 * @param {Socket} socket 
 */
ServerEvents.SucceedJoin = function(socket) {
    //Todo: Send succeed message.
    if(debugMode) {
        console.log("[Server Event]: Player '" + socket.id + "' successfully joined a lobby!");
    }
}
/**
 * Tells the client they failed to connect.
 * @param {Socket} socket 
 */
ServerEvents.FailJoin = function(socket) {
    //Todo: Send fail message.
    if(debugMode) {
        console.log("[Server Event]: Player '" + socket.id + "' failed joined a lobby!");
    }
}

module.exports = ServerEvents;