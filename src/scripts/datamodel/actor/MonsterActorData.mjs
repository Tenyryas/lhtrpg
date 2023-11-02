import { CommonActorData } from "./CommonActorData.mjs";

import { makePositiveIntegerField, makeImageField } from "../common.mjs";

const { fields } = foundry.data;

export class MonsterActorData extends CommonActorData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      img: makeImageField("systems/lhtrpg/assets/ui/actors_icons/monster.svg"),
    };
  }

  static getAdditionalStatsField() {
    return {
      health: new fields.SchemaField({
        value: makePositiveIntegerField(),
        base: makePositiveIntegerField(),
      }),
      fate: new fields.SchemaField({
        value: makePositiveIntegerField(),
        base: makePositiveIntegerField(),
      }),
      // Identification Difficulty: 0 = Auto
      identification: makePositiveIntegerField(),
      hateMultiplier: makePositiveIntegerField(),
    };
  }

  static makeField() {
    return this.makeBaseField();
  }

  static makeBaseStatsField() {
    return new fields.SchemaField({
      mod: makePositiveIntegerField(),
    });
  }

  static makeAttributeField() {
    return new fields.SchemaField({
      dice: makePositiveIntegerField(),
      mod: this.makeBaseField(),
    });
  }

  calculateHpTotal(health) {
    return health.base + health.skills + health.items;
  }

  calculateFateMax(fate) {
    return fate.base + fate.skills + fate.items;
  }
}
