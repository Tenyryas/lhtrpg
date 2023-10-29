import { CommonActorData } from "./CommonActorData.mjs";

import {
  makePositiveIntegerField,
  makeStringField,
  makeImageField,
  makeArrayStringField,
  getCommonInfosField,
} from "../common.mjs";

const { fields } = foundry.data;

export class CharacterData extends CommonActorData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      img: makeImageField(
        "systems/lhtrpg/assets/ui/actors_icons/character.svg",
      ),
      infos: new fields.SchemaField({
        ...getCommonInfosField(),
        level: makePositiveIntegerField(1),
        race: makeStringField(),
        guild: makeStringField(),
      }),
      class: new fields.SchemaField({
        img: makeImageField(
          "systems/lhtrpg/assets/ui/classes/Enchanter_Logo.png",
        ),
        name: makeStringField("Class"),
        subclass: makeArrayStringField(),
      }),
      inventory: new fields.SchemaField({
        base: makePositiveIntegerField(2),
        gold: makePositiveIntegerField(350),
      }),
    };
  }

  static getAdditionalStatsField() {
    return {
      hate: makePositiveIntegerField(),
    };
  }

  prepareBaseData() {
    super.prepareBaseData();

    const { stats } = this;
    const { attribute, defense, initiative } = stats;
    const { evasion, resistance } = attribute;

    evasion.base = dex.mod;
    resistance.base = pow.mod;

    initiative.base = str.mod + int.mod;

    defense.physical.base = str.mod * 2;
    defense.magical.base = int.mod * 2;
  }

  prepareDerivedData() {}
}
