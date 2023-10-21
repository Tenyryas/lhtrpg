import { localizeCheck } from "../helpers/i18n.mjs";

import { getItemFromEvent } from "../helpers/items.mjs";

import LHTrpgActorSheet from "./LhtrpgActorSheet.mjs";

export default class LhtrpgCharacterSheet extends LHTrpgActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["lhtrpg", "sheet", "actor"],
      template: "systems/lhtrpg/templates/actor/actor-sheet.html",
      width: 700,
      height: 700,
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
        {
          navSelector: ".skills-tabs",
          contentSelector: ".skills-body",
          initial: "basic",
        },
        {
          navSelector: ".bio-tabs",
          contentSelector: ".bio-body",
          initial: "bio",
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
      biography: await TextEditor.enrichHTML(context.system.biography, {
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
    // Initialize Context.

    const skills = {
      combat: [],
      basic: [],
      general: [],
    };

    const items = {
      equipped: {
        weapon: [],
        armor: [],
        shield: [],
        accessory: [],
        bag: [],
        gear: [],
        drop: [],
      },
      weapon: [],
      armor: [],
      shield: [],
      accessory: [],
      bag: [],
      gear: [],
      drop: [],
    };

    const social = {
      connections: [],
      unions: [],
    };

    // Iterate through items, allocating to containers
    for (const item of context.items) {
      item.img ??= DEFAULT_TOKEN;

      switch (item.type) {
        case "skill":
          this._prepareSkills(item, skills);
          break;
        case "connection":
          social.connections.push(item);
          break;
        case "union":
          social.unions.push(item);
          break;
        default:
          this._prepareDefaultItems(item, items);
          break;
      }
    }

    context.skills = skills;
    context.items = items;
    context.social = social;
  }

  _prepareSkills(item, skills) {
    if (skills[item.system.subtype]) {
      localizeCheck(item.system.check);
      skills[item.system.subtype].push(item);
    }
  }

  _prepareDefaultItems(item, items) {
    if (item.system.equipped === true) {
      items.equipped[item.type]?.push(item);
    } else {
      items[item.type]?.push(item);
    }
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find(".addItem a.item-controls").click(() => {
      $(".addItem .dropdown-content").toggleClass("show");
    });

    html.find("#hate-button").click((event) => {
      event.target.classList.toggle("active");

      const { style } = event.target.nextElementSibling.content;
      const styleTransform = "perspective(400px) rotateY(-30deg)";
      if (style.transform === styleTransform) {
        style.transform = "perspective(400px) rotateY(-90deg)";
      } else {
        style.transform = styleTransform;
      }
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Delete Inventory Item
    html.find(".item-equip").click((event) => {
      const item = getItemFromEvent(event, this.actor);
      item.update({ "system.equipped": !item.system.equipped });
      li.slideUp(200, () => this.render(false));
    });
  }
}
