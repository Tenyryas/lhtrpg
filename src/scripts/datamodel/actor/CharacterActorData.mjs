import { CommonActorData } from "./CommonActorData.mjs";

import {
  makePositiveIntegerField,
  makeStringField,
  makeImageField,
  makeArrayStringField,
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
    const { health, fate, base, attribute, defense, initiative } = stats;
    const { str, dex, pow, int } = base;
    const {
      athletics,
      endurance,
      disable,
      operation,
      perception,
      negotiation,
      knowledge,
      analysis,
      evasion,
      resistance,
      accuracy,
    } = attribute;

    // Character Creation

    let strClass = 0;
    let dexClass = 0;
    let powCLass = 0;
    let intClass = 0;
    let healthClass = 0;
    let healthModifier = 0;
    switch (characterClass.name) {
      case "guardian":
        strClass = 4;
        dexClass = 2;
        powCLass = 1;
        intClass = 3;
        healthClass = 50;
        healthModifier = 8;
        break;
      case "samurai":
        strClass = 4;
        dexClass = 2;
        powCLass = 2;
        intClass = 2;
        healthClass = 50;
        healthModifier = 8;
        break;
      case "monk":
        strClass = 4;
        dexClass = 4;
        powCLass = 2;
        intClass = 0;
        healthClass = 55;
        healthModifier = 9;
        break;
      case "cleric":
        strClass = 3;
        dexClass = 0;
        powCLass = 4;
        intClass = 3;
        healthClass = 40;
        healthModifier = 6;
        break;
      case "druid":
        strClass = 2;
        dexClass = 1;
        powCLass = 4;
        intClass = 3;
        healthClass = 35;
        healthModifier = 5;
        break;
      case "kannagi":
        strClass = 1;
        dexClass = 3;
        powCLass = 4;
        intClass = 2;
        healthClass = 40;
        healthModifier = 5;
        break;
      case "assassin":
        strClass = 2;
        dexClass = 4;
        powCLass = 3;
        intClass = 1;
        healthClass = 40;
        healthModifier = 5;
        break;
      case "swashbuckler":
        strClass = 3;
        dexClass = 4;
        powCLass = 2;
        intClass = 1;
        healthClass = 40;
        healthModifier = 6;
        break;
      case "bard":
        strClass = 2;
        dexClass = 4;
        powCLass = 2;
        intClass = 2;
        healthClass = 40;
        healthModifier = 5;
        break;
      case "sorcerer":
        strClass = 0;
        dexClass = 3;
        powCLass = 3;
        intClass = 4;
        healthClass = 35;
        healthModifier = 4;
        break;
      case "summoner":
        strClass = 1;
        dexClass = 3;
        powCLass = 3;
        intClass = 4;
        healthClass = 35;
        healthModifier = 5;
        break;
      case "enchanter":
        strClass = 2;
        dexClass = 2;
        powCLass = 2;
        intClass = 4;
        healthClass = 35;
        healthModifier = 4;
        break;
    }

    str.class = strClass;
    dex.class = dexClass;
    pow.class = powCLass;
    int.class = intClass;

    health.class = healthClass;

    let strRace = 0;
    let dexRace = 0;
    let powRace = 0;
    let intRace = 0;
    let healthRace = 0;
    let fateRace = 0;
    switch (infos.race) {
      case "human":
        // The 2 points need to be added as bonus
        healthRace = 8;
        fateRace = 1;
        break;
      case "elf":
        dexRace = 1;
        powRace = 1;
        healthRace = 8;
        fateRace = 1;
        break;
      case "dwarf":
        strRace = 1;
        powRace = 1;
        healthRace = 16;
        break;
      case "halfAlv":
        dexRace = 1;
        intRace = 1;
        healthRace = 8;
        fateRace = 1;
        break;
      case "werecat":
        strRace = 1;
        dexRace = 1;
        healthRace = 8;
        fateRace = 1;
        break;
      case "wolfFang":
        strRace = 2;
        healthRace = 16;
        break;
      case "foxTail":
        powRace = 1;
        intRace = 1;
        healthRace = 8;
        fateRace = 1;
        break;
      case "ritual":
        intRace = 2;
        fateRace = 2;
        break;
    }

    str.race = strRace;
    dex.race = dexRace;
    pow.race = powRace;
    int.race = intRace;

    health.race = healthRace;
    fate.race = fateRace;

    /* For each increase in Character Rank
      Character Rank 1 doesn't count
    */
    rankBonus = Math.max(infos.rank - 1, 0);

    str.rank = rankBonus;
    dex.rank = rankBonus;
    pow.rank = rankBonus;
    int.rank = rankBonus;

    health.rank = healthModifier * rankBonus;

    for (const key in base) {
      const attribute = base[key];
      // TODO Skills attribute bonus
      attribute.base =
        attribute.class + attribute.race + attribute.bonus + attribute.rank;
      attribute.mod = Math.floor(attribute.base / 3) ?? 0;
    }

    // Derive from base mod

    athletics.mod.base = str.mod;
    endurance.mod.base = str.mod;

    disable.mod.base = dex.mod;
    operation.mod.base = dex.mod;

    perception.mod.base = pow.mod;
    negotiation.mod.base = pow.mod;

    knowledge.mod.base = int.mod;
    analysis.mod.base = int.mod;

    evasion.mod.base = dex.mod;

    resistance.mod.base = pow.mod;

    initiative.base = str.mod + int.mod;

    defense.physical.base = str.mod * 2;

    defense.magical.base = int.mod * 2;

    accuracy.mod.base = Math.max(str.mod, dex.mod, pow.mod, int.mod);

    inventory.space.base = 2;

    super.prepareBaseData();
  }

  calculateHpTotal(health) {
    return (
      health.class + health.race + health.rank + health.skills + health.items
    );
  }

  calculateFateMax(fate) {
    return fate.race + fate.skills + fate.items;
  }
}
