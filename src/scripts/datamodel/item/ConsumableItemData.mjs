import SkillItemData from "./SkillItemData.mjs";

import { makeIntegerField } from "../common.mjs";

const { fields } = foundry.data;

export class ConsumableItemData extends SkillItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      status: new fields.SchemaField({
        life: new fields.SchemaField({
          fatigue: makeIntegerField(),
        }),
      }),
    };
  }
}
