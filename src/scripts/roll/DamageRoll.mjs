import LhtrpgRoll from "./LhtrpgRoll.mjs";

import FormulaBuilder from "./FormulaBuilder.mjs";

export default class DamageRoll extends LhtrpgRoll {
  constructor(formula, data, options) {
    super(formula, data, options);
  }

  static fromItem(item) {
    const damage = item.system.damage;

    const power = FormulaBuilder.getDataPower(damage.power.value);
    const abilityValue = FormulaBuilder.getDataActorAbility(
      damage.ability.value,
    );
    const abilitySr = FormulaBuilder.getDataActorAbility(damage.sr.ability);

    const rollData = item.getRollData();

    const builder = new FormulaBuilder();

    builder
      .addMultiplyDice("@item.damage.sr.dice", "@item.skillRank.value")
      .addDice("@item.damage.dice")
      .addValue(power)
      .addMultiply(abilityValue, damage.ability.multiply)
      .addMultiply(abilitySr, "@item.skillRank.value");

    const damageRoll = new this(builder.formula, rollData, {
      actor: item.actor,
    });

    const damageType = game.i18n.localize(`LHTRPG.Skill.Damage.damageType`);
    const damageTypeValue = game.i18n.localize(
      `LHTRPG.Skill.Damage.${damage.type.value}`,
    );
    damageRoll.flavor = `${damageType}: ${damageTypeValue}`;

    return damageRoll;
  }

  get isCritical() {
    return false;
  }

  get isFumble() {
    return false;
  }
}
