import CommonItemData from "./CommonItemData.mjs";

import {
  makeBooleanField,
  makePositiveIntegerField,
  makeStringField,
} from "../common.mjs";

export class BagItemData extends CommonItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
    };
  }

  static getAdditionalInventoryField() {
    return {
      isEquipped: makeBooleanField(),
      space: makePositiveIntegerField(),
      type: makeStringField(),
    };
  }

  get space() {
    if (inventory.isEquipped) {
      return 0;
    }
    return 1;
  }
}
