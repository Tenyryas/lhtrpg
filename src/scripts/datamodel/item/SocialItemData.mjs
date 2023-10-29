import { getCommonInfosField } from "../common.mjs";

const { fields } = foundry.data;

export class SocialItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      infos: new fields.SchemaField({
        ...getCommonInfosField(),
      }),
    };
  }

  static migrateData(source) {
    migrateToDataModel(source);

    return super.migrateData(source);
  }

  static migrateToDataModel(source) {}
}
