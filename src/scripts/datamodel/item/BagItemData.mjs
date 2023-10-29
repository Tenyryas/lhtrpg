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
      equipped: makeBooleanField(),
      space: makePositiveIntegerField(),
      type: makeStringField(),
    };
  }
}
