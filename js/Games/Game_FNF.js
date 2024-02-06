let Game = require('./Game');

/**
 * Fake News Flash class.
 * @param {Lobby} lobby
 */
class FakeNewsFlash extends Game {
    constructor(lobby) {
        super(lobby);
        this.displayName = "Fake News Flash";
        this.maxSize = 8;
    }
}