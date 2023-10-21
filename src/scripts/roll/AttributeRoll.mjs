import LhtrpgRoll from "./LhtrpgRoll.mjs";

import FormulaBuilder from "./FormulaBuilder.mjs";

export default class AttributeRoll extends LhtrpgRoll {
  constructor(formula, data, options) {
    super(formula, data, options);
  }

  static fromActor(actor, check) {
    const builder = new FormulaBuilder();
    const dataCheck = `@checks.${check}`;

    if (actor.type === "character") {
      builder.addDice(`${dataCheck}.dice`).addValue(`${dataCheck}.total`);
    } else {
      switch (key) {
        case "evasion":
        case "resistance":
          builder.addValue(dataCheck);
          break;

        default:
          break;
      }
    }

    const rollData = actor.getRollData();
    const attributeRoll = new this(builder.formula, rollData, {
      actor: actor,
    });

    attributeRoll.flavor = game.i18n.localize(`LHTRPG.Check.${check}`);

    return attributeRoll;
  }
}
