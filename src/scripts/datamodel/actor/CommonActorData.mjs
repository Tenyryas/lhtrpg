import {
  makePositiveIntegerField,
  makeBooleanField,
  makeConditionField,
  getCommonInfosField,
  prepareModelData,
  calculateTotal,
} from "../common.mjs";

const { fields } = foundry.data;

export class CommonActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      infos: new fields.SchemaField({
        ...getCommonInfosField(),
        ...this.getAdditionalInfosField(),
      }),
      stats: new fields.SchemaField({
        health: new fields.SchemaField({
          value: makePositiveIntegerField(),
        }),
        fate: new fields.SchemaField({
          value: makePositiveIntegerField(),
        }),
        base: new fields.SchemaField({
          str: this.makeBaseStatsField(),
          dex: this.makeBaseStatsField(),
          pow: this.makeBaseStatsField(),
          int: this.makeBaseStatsField(),
        }),
        attribute: new fields.SchemaField({
          athletics: this.makeModField(),
          endurance: this.makeModField(),
          disable: this.makeModField(),
          operation: this.makeModField(),
          perception: this.makeModField(),
          negotiation: this.makeModField(),
          knowledge: this.makeModField(),
          analysis: this.makeModField(),
          accuracy: this.makeModField(),
          evasion: this.makeAttributeField(),
          resistance: this.makeAttributeField(),
        }),
        power: new fields.SchemaField({
          attack: new fields.SchemaField(),
          magic: new fields.SchemaField(),
          recovery: new fields.SchemaField(),
        }),
        defense: new fields.SchemaField({
          physical: this.makeField(),
          magical: this.makeField(),
        }),
        speed: this.makeField(),
        initiative: this.makeField(),
        ...this.getAdditionalStatsField(),
      }),
      status: new fields.SchemaField({
        bad: new fields.SchemaField({
          dazed: makeBooleanField(),
          rigor: makeBooleanField(),
          confused: makeBooleanField(),
          staggered: makeBooleanField(),
          afflicted: makeBooleanField(),
          overconfident: makeBooleanField(),
          decay: makePositiveIntegerField(),
          pursuit: makeConditionField(),
        }),
        combat: new fields.SchemaField({
          regen: makePositiveIntegerField(),
          cancel: makeConditionField(),
          barrier: makePositiveIntegerField(),
        }),
        life: new fields.SchemaField({
          fatigue: makePositiveIntegerField(),
          weakness: makeConditionField(),
        }),
        other: new fields.SchemaField({
          hateTop: makeBooleanField(),
          swimming: makeBooleanField(),
          flying: makeBooleanField(),
          hidden: makeBooleanField(),
          absent: makeBooleanField(),
        }),
      }),
    };
  }

  static getAdditionalInfosField() {
    return {};
  }

  static getAdditionalStatsField() {
    return {};
  }

  static makeBaseStatsField() {
    return new fields.SchemaField({
      bonus: makePositiveIntegerField(),
    });
  }

  static makeBaseField(initial = 0) {
    return new fields.SchemaField({
      base: makePositiveIntegerField(initial),
    });
  }

  static makeField() {
    return new fields.SchemaField();
  }

  static makeModField() {
    return new fields.SchemaField({
      dice: new fields.SchemaField(),
      mod: new fields.SchemaField(),
    });
  }

  static makeAttributeField() {
    return this.makeModField();
  }

  static migrateData(source) {
    return super.migrateData(source);
  }

  prepareBaseData() {
    super.prepareBaseData();

    const { health, fate, attribute } = this.stats;
    for (const key in attribute) {
      const dice = attribute[key].dice;
      dice.status = 0;
    }

    prepareModelData(health);

    prepareModelData(fate);
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    const { stats, status } = this;
    const { health, fate, attribute, speed } = stats;
    const {
      athletics,
      endurance,
      disable,
      operation,
      perception,
      negotiation,
      knowledge,
      analysis,
      evasion,
      resistance,
      accuracy,
    } = attribute;
    const { life, bad, other } = status;

    athletics.mod.base = str.mod;
    endurance.mod.base = str.mod;

    disable.mod.base = dex.mod;
    operation.mod.base = dex.mod;

    perception.mod.base = pow.mod;
    negotiation.mod.base = pow.mod;

    knowledge.mod.base = int.mod;
    analysis.mod.base = int.mod;

    accuracy.mod.base = Math.max(str.mod, dex.mod, pow.mod, int.mod);

    for (const key in attribute) {
      const { dice } = attribute[key];

      // Add default dice number if it's not an attribute saved
      if (!dice.base) {
        dice.base = 2;
      }

      if (bad.confused) {
        dice.status -= 1;
      }
      if (other.swimming) {
        dice.status -= 1;
      }
    }

    if (bad.dazed) {
      evasion.dice.status -= 1;
      resistance.dice.status -= 1;
    }

    if (bad.staggered) {
      accuracy.dice.status -= 1;
    }

    if (bad.rigor) {
      speed.total = 0;
    } else {
      calculateTotal(speed);
    }

    /**
     * - Fatigue reduces the afflicted character's Max HP by its Rating.
     * - Fatigue can reduce Max HP to 0
     */
    calculateTotal(health);
    health.max = Math.max(health.total - life.fatigue, 0);

    calculateTotal(fate);
  }

  get isIncapacitated() {
    const { health } = this.stats;
    return health.value <= 0 || health?.max <= 0;
  }

  get isHateTop() {
    return this.status.other.hateTop;
  }

  get isHateUnder() {
    return !this.isHateTop();
  }
}
