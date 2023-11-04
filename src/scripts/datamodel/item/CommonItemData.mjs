import { makePositiveIntegerField, getCommonInfosField } from "../common.mjs";

const { fields } = foundry.data;

export class CommonItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      infos: new fields.SchemaField({
        ...getCommonInfosField(),
      }),
      inventory: new fields.SchemaField({
        price: makePositiveIntegerField(),
        ...getAdditionalStatsField(),
      }),
    };
  }

  static getAdditionalInventoryField() {
    return {};
  }

  static makeRangeField() {
    return new fields.SchemaField({
      type: new fields.StringField({
        initial: "refer",
        blank: false,
        nullable: false,
        trim: true,
        choices: {
          close: "LHTRPG.Skill.Range.close",
          weapon: "LHTRPG.Skill.Range.weapon",
          ranged: "LHTRPG.Skill.Range.ranged",
          refer: "LHTRPG.Skill.Range.refer",
        },
      }),
      value: makePositiveIntegerField(),
    });
  }

  static migrateData(source) {
    migrateToDataModel(source);

    return super.migrateData(source);
  }

  static migrateToDataModel(source) {
    source.infos ??= {};

    if ("description" in source) {
      source.infos.description = source.description ?? "";
      delete source.description;
    }
    if ("tags" in source) {
      source.infos.tags = source.tags ?? [];
      delete source.tags;
    }
    if ("rank" in source) {
      source.infos.rank = source.rank ?? 1;
      delete source.rank;
    }

    source.inventory ??= {};
    if ("price" in source) {
      source.inventory.price = source.price ?? 0;
      delete source.price;
    }
  }

  prepareBaseData() {
    super.prepareBaseData();
  }

  prepareDerivedData() {
    super.prepareDerivedData();
  }

  get space() {
    return 1;
  }
}
