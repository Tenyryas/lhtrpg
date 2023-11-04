import CommonItemData from "./CommonItemData.mjs";

import {
  makeStringField,
  makePositiveIntegerField,
  getCommonInfosField,
} from "../common.mjs";

const { fields } = foundry.data;

export class SkillItemData extends CommonItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      infos: new fields.SchemaField({
        ...getCommonInfosField(),
        rank: new fields.SchemaField({
          value: makePositiveIntegerField(1),
          max: makePositiveIntegerField(1),
        }),
        effects: new fields.HTMLField(),
      }),
      action: {
        timing: new fields.StringField({
          initial: "refer",
          blank: false,
          nullable: false,
          trim: true,
          choices: {
            constant: "LHTRPG.Skill.Timing.constant",
            prePlay: "LHTRPG.Skill.Timing.prePlay",
            interlude: "LHTRPG.Skill.Timing.interlude",
            briefing: "LHTRPG.Skill.Timing.briefing",
            restTime: "LHTRPG.Skill.Timing.restTime",
            major: "LHTRPG.Skill.Timing.major",
            minor: "LHTRPG.Skill.Timing.minor",
            move: "LHTRPG.Skill.Timing.move",
            instant: "LHTRPG.Skill.Timing.instant",
            mainProcess: "LHTRPG.Skill.Timing.mainProcess",
            setup: "LHTRPG.Skill.Timing.setup",
            initiative: "LHTRPG.Skill.Timing.initiative",
            cleanup: "LHTRPG.Skill.Timing.cleanup",
            beforeCheck: "LHTRPG.Skill.Timing.beforeCheck",
            afterCheck: "LHTRPG.Skill.Timing.afterCheck",
            damageRoll: "LHTRPG.Skill.Timing.damageRoll",
            beforeDamage: "LHTRPG.Skill.Timing.beforeDamage",
            afterDamage: "LHTRPG.Skill.Timing.afterDamage",
            action: "LHTRPG.Skill.Timing.action",
            refer: "LHTRPG.Skill.Timing.refer",
          },
        }),
        range: this.makeRangeField(),
        target: new fields.SchemaField({
          type: new fields.StringField({
            initial: "refer",
            blank: false,
            nullable: false,
            trim: true,
            choices: {
              self: "LHTRPG.Skill.Target.self",
              single: "LHTRPG.Skill.Target.single",
              multi: "LHTRPG.Skill.Target.multi",
              area: "LHTRPG.Skill.Target.area",
              wide: "LHTRPG.Skill.Target.wide",
              line: "LHTRPG.Skill.Target.line",
              refer: "LHTRPG.Skill.Target.refer",
            },
          }),
          modifier: new fields.StringField({
            initial: "",
            blank: true,
            nullable: false,
            trim: true,
            choices: {
              pick: "LHTRPG.Skill.Target.pick",
              all: "LHTRPG.Skill.Target.all",
            },
          }),
          value: makePositiveIntegerField(),
        }),
        check: new fields.SchemaField({
          type: new fields.StringField({
            initial: "none",
            blank: false,
            nullable: false,
            trim: true,
            choices: {
              none: "LHTRPG.Skill.Check.none",
              automatic: "LHTRPG.Skill.Check.automatic",
              basic: "LHTRPG.Skill.Check.basic",
              evasion: "LHTRPG.Skill.Check.evasion",
              resistance: "LHTRPG.Skill.Check.resistance",
              refer: "LHTRPG.Skill.Check.refer",
              custom: "LHTRPG.Skill.Check.custom",
            },
          }),
          dice: makePositiveIntegerField(),
          mod: makePositiveIntegerField(),
          formula: makeStringField(),
        }),
        cost: new fields.SchemaField({
          type: new fields.StringField({
            initial: "none",
            blank: false,
            nullable: false,
            trim: true,
            choices: {
              none: "LHTRPG.Skill.Cost.none",
              hate: "LHTRPG.Skill.Cost.hate",
              fate: "LHTRPG.Skill.Cost.fate",
              party: "LHTRPG.Skill.Cost.party",
              allies: "LHTRPG.Skill.Cost.allies",
              refer: "LHTRPG.Skill.Cost.refer",
            },
          }),
          value: makePositiveIntegerField(),
        }),
        limit: new fields.SchemaField({
          type: new fields.StringField({
            initial: "none",
            blank: false,
            nullable: false,
            trim: true,
            choices: {
              none: "LHTRPG.Skill.Limit.none",
              scenario: "LHTRPG.Skill.Limit.scenario",
              scene: "LHTRPG.Skill.Limit.scene",
              round: "LHTRPG.Skill.Limit.round",
              party: "LHTRPG.Skill.Limit.party",
              refer: "LHTRPG.Skill.Limit.refer",
            },
          }),
          used: makePositiveIntegerField(),
          max: makePositiveIntegerField(),
        }),
      },
    };
  }

  static migrateToDataModel(source) {
    super.migrateToDataModel(source);

    source.action ??= {};

    if ("target" in source.infos) {
      source.action.target ??= {};
      let target = source.infos.target;

      let type;
      let modifier;
      let value;
      if (typeof target === "string") {
        target = target.trim().toLowerCase();
        switch (target) {
          case "self":
          case "single":
          case "multi":
          case "area":
          case "wide":
          case "line":
          case "refer":
            type = target;
            break;
        }
        if (!type) {
          if (target.startsWith("area")) {
            type = "area";
          } else if (target.startsWith("wide")) {
            type = "wide";
          } else if (target.startsWith("line")) {
            type = "line";
          }
          if ((match = /\d+/.exec(str)) !== null) {
            value = parseInt(match[0], 10);
            if (!type) {
              type = "multi";
            }
          }
          if ((match = /\(\w+\)/.exec(str)) !== null) {
            const modifierName = match[0].toLowerCase();
            switch (modifierName) {
              case "p":
              case "pick":
                modifier = "pick";
                break;

              case "a":
              case "all":
                modifier = "all";
                break;
            }
          }
        }
      }
      source.action.target.type = type ?? "refer";
      source.action.target.modifier = modifier ?? "";
      source.action.target.value = value ?? 0;
      delete source.infos.target;
    }
    if ("range" in source.infos) {
      source.action.range ??= {};

      let type;
      let value;
      if (typeof source.infos.range === "string") {
        const range = source.infos.range.trim().toLowerCase();

        switch (range) {
          case "close":
          case "weapon":
          case "ranged":
          case "refer":
            type = range;
            break;
        }
        if (!type && (match = /\d+/.exec(str)) !== null) {
          value = parseInt(match[0], 10);
          type = "ranged";
        }
      }
      source.action.range.type = type ?? "refer";
      source.action.range.value = value ?? 0;
      delete source.infos.range;
    }
    if ("timing" in source.infos) {
      let timing;
      if (typeof source.infos.timing === "string") {
        const sourceTiming = source.infos.timing
          .trim()
          .toLowerCase()
          .replaceAll(/[ -._]/g, "");

        switch (sourceTiming) {
          case "constant":
          case "interlude":
          case "briefing":
          case "major":
          case "minor":
          case "move":
          case "instant":
          case "setup":
          case "initiative":
          case "cleanup":
          case "action":
          case "refer":
            timing = sourceTiming;
            break;
          case "preplay":
            timing = "prePlay";
            break;
          case "resttime":
            timing = "restTime";
            break;
          case "mainprocess":
            timing = "mainProcess";
            break;
          case "beforecheck":
            timing = "beforeCheck";
            break;
          case "aftercheck":
            timing = "afterCheck";
            break;
          case "damageroll":
            timing = "damageRoll";
            break;
          case "beforedamage":
            timing = "beforeDamage";
            break;
          case "afterdamage":
            timing = "afterDamage";
            break;
        }
      }
      source.action.timing = timing ?? "refer";
      delete source.infos.timing;
    }
  }

  get space() {
    return 0;
  }
}
