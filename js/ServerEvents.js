let Lobby = require('./Lobby.js');
let debugMode = true;
ServerEvents = {}

ServerEvents.AssignClientType = function(data) { //Assigns the clients user type. Either the game, or mobile / desktop user.
    let socket = this;
    let clientType = data.toString();
    if(debugMode) { 
        console.log("[Server Event]: Trying to assign client type for user '" + socket.id + "' - " + RClientType[clientType] + ".");
    }
    CLIENT_LIST[socket.id].AssignClientType(clientType);
    socket.emit("assignClientType_Response", clientType);
}

ServerEvents.CreateNewLobby = function(data) { // Creates a new lobby and adds it to the lobby manager.
    //Data requirements = { lobbyName: [string], password?: [string] };
    //Todo: make new lobby class
    lManager.CreateNewLobby();
    socket.emit("createNewLobby_Response");
}

ServerEvents.TryJoinLobby = function(data) { //Tries to join a lobby, will succeed given - the lobby exists, has that password and isn't full.
    //Data requirements = { lobbyId: [string], password?: [string] };
    let socket = this;
    let lobbyId = data.lobbyId;
    let password = data.password || "";
    let player = CLIENT_LIST[socket.id];

    let foundLobby = lManager.FindLobby(lobbyId);
    if(player == null) { ServerEvents.FailJoin(socket); return; }
    if(!foundLobby) { ServerEvents.FailJoin(socket); return; }
    let successfullyJoined = foundLobby.AddPlayer(player, password);
    if(!successfullyJoined) { ServerEvents.FailJoin(socket); return; }
    ServerEvents.SucceedJoin(socket);
}

ServerEvents.SucceedJoin = function(socket) { //Tells the client they connected successfully.
    //Todo: Send succeed message.
}

ServerEvents.FailJoin = function(socket) { // Tells the client they failed to connect.
    //Todo: Send fail message.
}

module.exports = ServerEvents;