import LhtrpgRoll from "./LhtrpgRoll.mjs";

import FormulaBuilder from "./FormulaBuilder.mjs";

export default class HealRoll extends LhtrpgRoll {
  constructor(formula, data, options) {
    super(formula, data, options);
  }

  static fromItem(item) {
    const heal = item.system.heal;

    const power1 = FormulaBuilder.getDataPower(heal.power.value1);
    const power2 = FormulaBuilder.getDataPower(heal.power.value2);
    const abilityValue = FormulaBuilder.getDataActorAbility(heal.ability.value);
    const abilitySr = FormulaBuilder.getDataActorAbility(heal.sr.ability);

    const rollData = item.getRollData();

    const builder = new FormulaBuilder();

    builder
      .addMultiplyDice("@item.heal.sr.dice", "@item.skillRank.value")
      .addDice("@item.heal.dice")
      .addValue("@item.heal.bonus")
      .addValue(power1)
      .addValue(power2)
      .addMultiply(abilityValue, heal.ability.multiply)
      .addMultiply(abilitySr, "@item.skillRank.value")
      .addMultiply(heal.sr.multiply, "@item.skillRank.value");

    const healRoll = new this(builder.formula, rollData, {
      actor: item.actor,
    });

    const healType = game.i18n.localize(`LHTRPG.Skill.Heal.healType`);

    const healTypeValue = game.i18n.localize(
      `LHTRPG.Skill.Heal.${heal.type.value}`,
    );

    healRoll.flavor = `${healType}: ${healTypeValue}`;

    return healRoll;
  }

  get isCritical() {
    return false;
  }

  get isFumble() {
    return false;
  }
}
