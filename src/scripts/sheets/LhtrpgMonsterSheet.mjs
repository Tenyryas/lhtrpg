import LHTrpgActorSheet from "./LhtrpgActorSheet.mjs";

export default class LhtrpgMonsterSheet extends LHTrpgActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["lhtrpg", "sheet", "monster"],
      template: "systems/lhtrpg/templates/actor/actor-monster-sheet.html",
      width: 520,
      height: 550,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "stats",
        },
        {
          navSelector: ".status-tabs",
          contentSelector: ".status-body",
          initial: "status",
        },
      ],
      dragDrop: [
        { dragSelector: ".items-list .item", dropSelector: null },
        { dragSelector: ".inventory-list .item", dropSelector: null },
      ],
    });
  }

  async _enrichHTML(context) {
    return {
      description: await TextEditor.enrichHTML(context.system.description, {
        async: true,
      }),
    };
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const skillsMonster = [];

    // Iterate through items, allocating to containers, but for monsters
    for (let item of context.items) {
      item.img ??= DEFAULT_TOKEN;

      if (item.type === "skill") {
        skillsMonster.push(i);
      }
    }

    context.skillsMonster = skillsMonster;
  }
}
