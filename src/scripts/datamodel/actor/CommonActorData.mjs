import {
  makePositiveIntegerField,
  makeBooleanField,
  makeConditionField,
  getCommonInfosField,
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
        speed: makePositiveIntegerField(2),
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

  static makeBaseField() {
    return new fields.SchemaField({
      base: makePositiveIntegerField(),
    });
  }

  static makeField() {
    return new fields.SchemaField();
  }

  static makeModField() {
    return new fields.SchemaField({
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
    const { health, fate, attribute, power, defense, initiative } = this.stats;

    for (const key in attribute) {
      const attr = attribute[key];
      attr.dice ??= 2;
      this.prepareModData(attr.mod);
    }
    for (const key in power) {
      this.prepareModData(power[key]);
    }
    for (const key in defense) {
      this.prepareModData(defense[key]);
    }

    this.prepareModData(initiative.mod);

    health.skills = 0;
    health.items = 0;

    fate.skills = 0;
    fate.items = 0;
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    const { stats, status } = this;
    const { health, attribute, defense, initiative } = stats;
    const { life } = status;

    for (const key in attribute) {
      const mod = attribute[key].mod;
      mod.total = this.calculateModTotal(mod);
    }
    for (const key in power) {
      const mod = power[key].mod;
      mod.total = this.calculateModTotal(mod);
    }
    for (const key in defense) {
      const mod = defense[key].mod;
      mod.total = this.calculateModTotal(mod);
    }

    initiative.total = this.calculateModTotal(initiative);

    /**
     * - Fatigue reduces the afflicted character's Max HP by its Rating.
     * - Fatigue can reduce Max HP to 0
     */
    health.total = this.calculateHpTotal(health);
    health.max = Math.max(health.total - life.fatigue, 0);

    fate.max = this.calculateFateMax(fate);
  }

  prepareModData(mod) {
    mod.skills = 0;
    mod.items = 0;
  }

  calculateModTotal(mod) {
    return mod.base + mod.skills + mod.items;
  }

  calculateHpTotal(health) {
    throw new Error("Must be implemented by subclass!");
  }

  calculateFateMax(fate) {
    throw new Error("Must be implemented by subclass!");
  }

  get isIncapacitated() {
    const { health } = this.stats;
    return health.value <= 0 || health?.max <= 0;
  }

  get isHateTop() {
    return this.status.other.hateTop;
  }

  get isHateUnder() {
    return !this.status.other.hateTop;
  }
}
