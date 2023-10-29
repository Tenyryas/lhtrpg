import { makePositiveIntegerField, makeBooleanField } from "../common.mjs";

const { fields } = foundry.data;

export class CommonActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      stats: new fields.SchemaField({
        health: new fields.SchemaField({
          value: makePositiveIntegerField(),
          total: makePositiveIntegerField(),
        }),
        fate: new fields.SchemaField({
          value: makePositiveIntegerField(),
          max: makePositiveIntegerField(),
        }),
        base: new fields.SchemaField({
          str: makeBaseField(),
          dex: makeBaseField(),
          pow: makeBaseField(),
          int: makeBaseField(),
        }),
        attribute: new fields.SchemaField({
          athletics: makeDiceField(),
          endurance: makeDiceField(),
          disable: makeDiceField(),
          operation: makeDiceField(),
          perception: makeDiceField(),
          negotiation: makeDiceField(),
          knowledge: makeDiceField(),
          analysis: makeDiceField(),
          accuracy: makeDiceField(),
          evasion: makeEvasionField(),
          resistance: makeResistanceField(),
        }),
        power: new fields.SchemaField({
          attack: makeBaseField(),
          magic: makeBaseField(),
          recovery: makeBaseField(),
        }),
        defense: new fields.SchemaField({
          physical: makeBaseField(),
          magical: makeBaseField(),
        }),
        speed: makeBaseField(2),
        initiative: makeBaseField(),
        ...getAdditionalStatsField(),
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

  static getStatsField() {
    return {};
  }

  static makeBaseField(initial = 0) {
    return new fields.SchemaField({
      base: makePositiveIntegerField(initial),
    });
  }

  static makeDiceField() {
    return new fields.SchemaField({
      dice: makePositiveIntegerField(2),
    });
  }

  static migrateData(source) {
    return super.migrateData(source);
  }

  prepareBaseData() {
    super.prepareBaseData();
    const { base } = this.stats;
    const { str, dex, pow, int } = base;

    for (const key in base) {
      const attribute = base[key];
      attribute.mod = Math.floor(attribute.base / 3) ?? 0;
    }

    athletics.mod = str.mod;
    endurance.mod = str.mod;

    disable.mod = dex.mod;
    operation.mod = dex.mod;

    perception.mod = pow.mod;
    negotiation.mod = pow.mod;

    knowledge.mod = int.mod;
    analysis.mod = int.mod;
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    const { stats, status } = this;
    const { health } = stats;
    const { life } = status;

    /**
     * - Fatigue reduces the afflicted character's Max HP by its Rating.
     * - Fatigue can reduce Max HP to 0
     */
    health.max = Math.max(health.total - life.fatigue, 0);

    // Health value can't be bigger than the total max and less than 0
  }

  get isIncapacitated() {
    const { health } = this.stats;
    return health.value <= 0 || health.max <= 0;
  }
}
