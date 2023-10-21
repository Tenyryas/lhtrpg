export default class FormulaBuilder {
  formula = "";

  constructor() {}

  static getDataPower(power) {
    return `@actor.battleStatus.power.${power}.total`;
  }

  static getDataActorAbility(abilityParam) {
    if (abilityParam) {
      const [ability, type] = abilityParam.split("-");
      if (ability && type) {
        return `@actor.attributes.${ability}.${type}`;
      }
    }
    return "";
  }

  addValue(value) {
    if (Number.isInteger(value) && value < 0) {
      formula += ` - ${Math.abs(value)}`;
    } else if (value) {
      if (this.formula) {
        this.formula += ` + ${value}`;
      } else {
        this.formula = value;
      }
    }
    return this;
  }

  addMultiply(value, times) {
    if (value && times) {
      return this.addValue(`${value} * ${times}`);
    }
    return this;
  }

  addDice(value) {
    if (value) {
      return this.addValue(`(${value})d6`);
    }
    return this;
  }

  addMultiplyDice(value, times) {
    if (value && times) {
      return this.addValue(`(${value} * ${times})d6`);
    }
    return this;
  }
}
