/**
 * Base class for every game.
 * @param {Lobby} lobby
 */

class Game {
    constructor(lobby) {
        this.id = CreateUUID("GAME");
        this.lobby = lobby;
        this.displayName = "GAME";
        this.maxSize = lobby.maxSize; //Todo: change to be based on given game.
    }
}
module.exports = Game;