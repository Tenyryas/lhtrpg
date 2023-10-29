import { CommonActorData } from "./CommonActorData.mjs";

import {
  makePositiveIntegerField,
  makeImageField,
  getCommonInfosField,
} from "../common.mjs";

const { fields } = foundry.data;

export class CharacterData extends CommonActorData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      img: makeImageField("systems/lhtrpg/assets/ui/actors_icons/monster.svg"),
      infos: new fields.SchemaField({
        ...getCommonInfosField(),
      }),
    };
  }

  static getAdditionalStatsField() {
    return {
      identification: makePositiveIntegerField(),
      hateMultiplier: makePositiveIntegerField(),
    };
  }

  prepareBaseData() {
    super.prepareBaseData();

    const { stats } = this;
    const { attribute } = stats;
    const { evasion, resistance } = attribute;

    evasion.mod = 0;
    resistance.mod = 0;
  }

  prepareDerivedData() {}
}
