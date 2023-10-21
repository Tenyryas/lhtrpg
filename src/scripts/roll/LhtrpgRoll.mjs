export default class LhtrpgRoll extends Roll {
  constructor(formula, data, options) {
    super(formula, data, options);
  }

  static DICE_FACES = 6;

  static CRITICAL = LhtrpgRoll.DICE_FACES;
  static FUMBLE = 1;

  static fromRoll(roll) {
    const newRoll = new this(roll.formula, roll.data, roll.options);
    Object.assign(newRoll, roll);
    return newRoll;
  }

  flavor = "";

  get isCritical() {
    if (!this._evaluated) return undefined;

    let nbrCriticalDice = 0;
    for (const dices of this.dice) {
      if (dices.faces === LhtrpgRoll.DICE_FACES) {
        for (const value of dices.values) {
          if (value === LhtrpgRoll.CRITICAL) {
            nbrCriticalDice++;
          }
        }
      }
    }
    return nbrCriticalDice >= 2;
  }

  get isFumble() {
    if (!this._evaluated) return undefined;

    const { badStatus } = this.options.actor.system;

    let nbrFumbleDice = 0;
    let totalDices = 0;

    for (const dices of this.dice) {
      if (dices.faces === LhtrpgRoll.DICE_FACES) {
        totalDices += dices.values.length;
        for (const value of dices.values) {
          if (value === LhtrpgRoll.FUMBLE) {
            nbrFumbleDice++;
          }
        }
      }
    }
    if (totalDices > 0) {
      if (badStatus.overconfident && nbrFumbleDice > 0) {
        return true;
      }
      return nbrFumbleDice === totalDices;
    }
    return false;
  }

  async renderRoll(isPrivate) {
    await this._analyzeRoll();

    if (!this.total || this.total === 0) return "";

    return await this.render({ flavor: this.flavor, isPrivate });
  }

  async toMessage() {
    await this._analyzeRoll();

    if (this.total === 0) return;

    const messageData = {
      speaker: ChatMessage.getSpeaker({ actor: this.options.actor }),
      flavor: this.flavor,
      rollMode: game.settings.get("core", "rollMode"),
    };

    return await super.toMessage(messageData);
  }

  async _analyzeRoll() {
    if (!this._evaluated) await this.evaluate({ async: true });

    if (this.isCritical) {
      this.flavor += " - ✔️";
    }
    if (this.isFumble) {
      this.flavor += " - ❌";
    }
  }
}
