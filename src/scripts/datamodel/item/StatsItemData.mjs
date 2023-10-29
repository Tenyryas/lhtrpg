import CommonItemData from "./CommonItemData.mjs";

import { makeIntegerField, makeBooleanField } from "../common.mjs";

const { fields } = foundry.data;

export class StatsItemData extends CommonItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      stats: {
        attribute: new fields.SchemaField({
          accuracy: makeIntegerField(),
        }),
        power: new fields.SchemaField({
          attack: makeIntegerField(),
          magic: makeIntegerField(),
        }),
        defense: new fields.SchemaField({
          physical: makeIntegerField(),
          magical: makeIntegerField(),
        }),
        initiative: makeIntegerField(),
      },
    };
  }

  static getAdditionalInventoryField() {
    return {
      equipped: makeBooleanField(),
    };
  }

  static migrateToDataModel(source) {
    super.migrateToDataModel(source);
    source.stats ??= {};
    source.stats.attribute ??= {};
    source.stats.power ??= {};
    source.stats.defense ??= {};

    if ("accuracy" in source) {
      source.stats.attribute.accuracy = source.accuracy ?? 0;
      delete source.accuracy;
    }

    if ("attack" in source) {
      source.stats.power.attack = source.attack ?? 0;
      delete source.attack;
    }
    if ("magic" in source) {
      source.stats.power.magic = source.magic ?? 0;
      delete source.magic;
    }

    if ("pdef" in source) {
      source.stats.defense.physical = source.pdef ?? 0;
      delete source.pdef;
    }
    if ("mdef" in source) {
      source.stats.defense.magical = source.mdef ?? 0;
      delete source.mdef;
    }

    if ("initiative" in source) {
      source.stats.initiative = source.initiative ?? 0;
      delete source.initiative;
    }
  }
}
