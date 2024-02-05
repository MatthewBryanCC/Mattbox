const ServerEvents = require('./js/ServerEvents.js');
const GameEvents = require('./js/GameEvents.js');
const LobbyManager = require('./js/LobbyManager.js');
const {ServerClient, Player} = require('./js/Player.js');

//Server Variables
var serverReference;
var lManager = new LobbyManager();
SOCKET_LIST = [];
CLIENT_LIST = [];


//Faux Enums
ClientType = {
    PLAYER: 0,
    GAME: 1
}
RClientType = {
    0: "PLAYER",
    1: "GAME"
}

function ServerIntialize() {
    var express = require('express');
    var app = express();
    var serv = require('http').Server(app);

    app.get('/',function(req, res) {
        res.sendFile(__dirname + '/client/index.html');
    });
    app.use('/client', express.static(__dirname + '/client'));

    var port = process.env.PORT || 8000;
    serv.listen(port);
    GAME_SERVER = new Server(app, serv);

    console.log("Server is running");
}

class Server {
    constructor(app, serv) {
        this.app = app;
        this.serv = serv;
        this.io = null;
        this.CreateSocketIO();
    }

    CreateSocketIO() {
        this.io = require('socket.io')(this.serv, {'transports': ['websocket', 'polling']});
        this.io.sockets.on('connection', this.ClientInitialConnection.bind(this));
    }

    CreateClientEvents(socket) {
        socket.on("assignClientType_Request", ServerEvents.AssignClientType.bind(socket));
        socket.on("createNewLobby_Request", ServerEvents.CreateNewLobby.bind(socket));
        socket.on('disconnect', this.ClientDisconnect.bind(socket));

    }

    ClientInitialConnection(socket) {
        socket.id = CreateUUID("USER");
        SOCKET_LIST[socket.id] = socket;
        let client = new Player(socket);
        CLIENT_LIST[socket.id] = client;
        this.CreateClientEvents(socket);
        console.log("[Server]: Client connected! Assigned id '" + socket.id + "'");
        socket.emit("doInitialConnection", {id: socket.id.toString()})
    }
    
    ClientDisconnect(data) {
        let socket = this;
        console.log("[Server]: Client '" + socket.id + "' disconnected.");
        delete SOCKET_LIST[socket.id];
    }
}



function CreateUUID(type) {
    function uuid(mask = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx') {
        return `${mask}`.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
    return uuid("xxxx-xxxx-xxxx-xxxx-xxxx-" + type);
}


serverReference = ServerIntialize();