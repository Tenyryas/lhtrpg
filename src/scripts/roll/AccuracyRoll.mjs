import AttributeRoll from "./AttributeRoll.mjs";

import FormulaBuilder from "./FormulaBuilder.mjs";

import { localizeCheck } from "../helpers/i18n.mjs";

export default class AccuracyRoll extends AttributeRoll {
  constructor(formula, data, options) {
    super(formula, data, options);
  }

  static ATTRIBUTE_CHECK = "accuracy";

  static fromActor(actor) {
    return AttributeRoll.fromActor(actor, AccuracyRoll.ATTRIBUTE_CHECK);
  }

  static fromItem(item) {
    const { check } = item.system;
    switch (check.value) {
      case "none":
      case "automatic":
        return;
    }
    const { actor } = item;

    const itemCheck = "@item.check";
    const builder = new FormulaBuilder();
    if (check.customFormula) {
      builder.addValue(`${itemCheck}.customFormula`);
    } else {
      const actorCheck = `@actor.checks.${AccuracyRoll.ATTRIBUTE_CHECK}`;
      builder
        .addDice(`${actorCheck}.dice`)
        .addValue(`${actorCheck}.total`)
        .addDice(`${itemCheck}.dice`)
        .addValue(`${itemCheck}.bonus`);
    }

    const rollData = item.getRollData();
    const roll = new this(builder.formula, rollData, {
      actor: actor,
    });

    localizeCheck(check);
    roll.flavor = check.label;
    return roll;
  }
}
