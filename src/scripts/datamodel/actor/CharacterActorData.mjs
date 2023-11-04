import { CommonActorData } from "./CommonActorData.mjs";

import {
  makePositiveIntegerField,
  makeStringField,
  makeImageField,
  makeArrayStringField,
  calculateTotal,
} from "../common.mjs";

const { fields } = foundry.data;

export class CharacterData extends CommonActorData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      img: makeImageField(
        "systems/lhtrpg/assets/ui/actors_icons/character.svg",
      ),
      // class is a reserved word
      characterClass: new fields.SchemaField({
        img: makeImageField(
          "systems/lhtrpg/assets/ui/classes/Enchanter_Logo.png",
        ),
        name: new fields.StringField({
          initial: "guardian",
          blank: false,
          nullable: false,
          trim: true,
          choices: {
            guardian: "LHTRPG.Character.class.guardian",
            samurai: "LHTRPG.Character.class.samurai",
            monk: "LHTRPG.Character.class.monk",
            cleric: "LHTRPG.Character.class.cleric",
            druid: "LHTRPG.Character.class.druid",
            kannagi: "LHTRPG.Character.class.kannagi",
            assassin: "LHTRPG.Character.class.assassin",
            swashbuckler: "LHTRPG.Character.class.swashbuckler",
            bard: "LHTRPG.Character.class.bard",
            sorcerer: "LHTRPG.Character.class.sorcerer",
            summoner: "LHTRPG.Character.class.summoner",
            enchanter: "LHTRPG.Character.class.enchanter",
          },
        }),
        subclass: makeArrayStringField(),
      }),
      inventory: new fields.SchemaField({
        space: new fields.SchemaField(),
        gold: makePositiveIntegerField(350),
      }),
      equipment: new fields.SchemaField(),
    };
  }

  static getAdditionalInfosField() {
    return {
      level: makePositiveIntegerField(1),
      race: new fields.StringField({
        initial: "guardian",
        blank: false,
        nullable: false,
        trim: true,
        choices: {
          human: "LHTRPG.Character.race.human",
          elf: "LHTRPG.Character.race.elf",
          dwarf: "LHTRPG.Character.race.dwarf",
          halfAlv: "LHTRPG.Character.race.halfAlv",
          werecat: "LHTRPG.Character.race.werecat",
          wolfFang: "LHTRPG.Character.race.wolfFang",
          foxTail: "LHTRPG.Character.race.foxTail",
          ritual: "LHTRPG.Character.race.ritual",
        },
      }),
      guild: makeStringField(),
    };
  }

  static getAdditionalStatsField() {
    return {
      hate: makePositiveIntegerField(),
    };
  }

  prepareBaseData() {
    const { infos, stats, characterClass, inventory } = this;
    const { health, fate, base } = stats;
    const { str, dex, pow, int } = base;

    // Character Creation

    let healthModifier = 0;
    switch (characterClass.name) {
      case "guardian":
        str.class = 4;
        dex.class = 2;
        pow.class = 1;
        int.class = 3;
        health.class = 50;
        healthModifier = 8;
        break;
      case "samurai":
        str.class = 4;
        dex.class = 2;
        pow.class = 2;
        int.class = 2;
        health.class = 50;
        healthModifier = 8;
        break;
      case "monk":
        str.class = 4;
        dex.class = 4;
        pow.class = 2;
        int.class = 0;
        health.class = 55;
        healthModifier = 9;
        break;
      case "cleric":
        str.class = 3;
        dex.class = 0;
        pow.class = 4;
        int.class = 3;
        health.class = 40;
        healthModifier = 6;
        break;
      case "druid":
        str.class = 2;
        dex.class = 1;
        pow.class = 4;
        int.class = 3;
        health.class = 35;
        healthModifier = 5;
        break;
      case "kannagi":
        str.class = 1;
        dex.class = 3;
        pow.class = 4;
        int.class = 2;
        health.class = 40;
        healthModifier = 5;
        break;
      case "assassin":
        str.class = 2;
        dex.class = 4;
        pow.class = 3;
        int.class = 1;
        health.class = 40;
        healthModifier = 5;
        break;
      case "swashbuckler":
        str.class = 3;
        dex.class = 4;
        pow.class = 2;
        int.class = 1;
        health.class = 40;
        healthModifier = 6;
        break;
      case "bard":
        str.class = 2;
        dex.class = 4;
        pow.class = 2;
        int.class = 2;
        health.class = 40;
        healthModifier = 5;
        break;
      case "sorcerer":
        str.class = 0;
        dex.class = 3;
        pow.class = 3;
        int.class = 4;
        health.class = 35;
        healthModifier = 4;
        break;
      case "summoner":
        str.class = 1;
        dex.class = 3;
        pow.class = 3;
        int.class = 4;
        health.class = 35;
        healthModifier = 5;
        break;
      case "enchanter":
        str.class = 2;
        dex.class = 2;
        pow.class = 2;
        int.class = 4;
        health.class = 35;
        healthModifier = 4;
        break;
    }

    switch (infos.race) {
      case "human":
        // The 2 points need to be added as bonus
        health.race = 8;
        fate.race = 1;
        break;
      case "elf":
        dex.race = 1;
        pow.race = 1;
        health.race = 8;
        fate.race = 1;
        break;
      case "dwarf":
        str.race = 1;
        pow.race = 1;
        health.race = 16;
        break;
      case "halfAlv":
        dex.race = 1;
        int.race = 1;
        health.race = 8;
        fate.race = 1;
        break;
      case "werecat":
        str.race = 1;
        dex.race = 1;
        health.race = 8;
        fate.race = 1;
        break;
      case "wolfFang":
        str.race = 2;
        health.race = 16;
        break;
      case "foxTail":
        pow.race = 1;
        int.race = 1;
        health.race = 8;
        fate.race = 1;
        break;
      case "ritual":
        int.race = 2;
        fate.race = 2;
        break;
    }

    /* For each increase in Character Rank
      So Character Rank 1 doesn't count
    */
    rankBonus = Math.max(infos.rank - 1, 0);

    for (const key in base) {
      base[key].rank = rankBonus;
    }

    health.rank = healthModifier * rankBonus;

    // Constant

    inventory.space.base = 2;

    super.prepareBaseData();
  }

  prepareDerivedData() {
    const { stats, equipment } = this;
    const { base, attribute, power, defense, initiative } = stats;
    const { str, dex, pow, int } = base;
    const { evasion, resistance } = attribute;

    for (const key in base) {
      const attribute = base[key];
      calculateTotal(attribute);
      attribute.mod = Math.floor(attribute.total / 3) ?? 0;
    }

    // Derive from base mod
    evasion.mod.base = dex.mod;

    resistance.mod.base = pow.mod;

    initiative.base = str.mod + int.mod;

    defense.physical.base = str.mod * 2;

    defense.magical.base = int.mod * 2;

    // case 4: Unarmed
    if (equipment.hand.length === 0) {
      power.attack.base = str.mod;
      power.magic.base = int.mod;
    }

    super.prepareDerivedData();
  }
}
