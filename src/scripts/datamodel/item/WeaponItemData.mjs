import StatsItemData from "./StatsItemData.mjs";

import { makeBooleanField } from "../common.mjs";

const { fields } = foundry.data;

export class WeaponItemData extends StatsItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      action: new fields.SchemaField({
        range: this.makeRangeField(),
      }),
    };
  }

  static getAdditionalInventoryField() {
    return {
      ...super.getAdditionalInventoryField(),
      isMain: makeBooleanField(),
      isTwoHanded: makeBooleanField(),
    };
  }

  get equipmentSlot() {
    if (this.inventory.isTwoHanded) {
      return 2;
    }
    return 1;
  }
}
