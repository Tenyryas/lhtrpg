import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from "../helpers/effects.mjs";

import { onManageTags } from "../helpers/tags.mjs";

import { getItemFromEvent } from "../helpers/items.mjs";

import LhtrpgRoll from "../roll/LhtrpgRoll.mjs";
import AttributeRoll from "../roll/AttributeRoll.mjs";

export default class LHTrpgActorSheet extends ActorSheet {
  static get defaultOptions() {
    return super.defaultOptions;
  }
  /** @override */
  get template() {
    return `systems/lhtrpg/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /** @override */
  async getData() {
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.system for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    this._prepareItems(context);
    this._prepareCharacterData(context);

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    context.enrichments = await this._enrichHTML(context);

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /** @override */
  activateListeners(html) {
    // Render the item sheet for viewing/editing prior to the editable check.
    html.find(".item-edit").click((event) => {
      const item = getItemFromEvent(event, this.actor);
      item.sheet.render(true);
    });

    // Roll skill
    html.find(".rollable-attributes").click(this._onRollAttributes.bind(this));

    html.find(".rollable").click(this._onRoll.bind(this));

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find(".item-create").click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find(".item-delete").click((event) => {
      const item = getItemFromEvent(event, this.actor);
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Drag events for macros.
    if (this.actor.owner) {
      html.find("li.item").each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", this._onDragStart.bind(this), false);
      });
    }

    // Active Effect management
    html
      .find(".effect-control")
      .click((event) => onManageActiveEffect(event, this.actor));

    // Tag management
    html.find(".tag-control").click((event) => onManageTags(event, this.actor));
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    const { dataset } = event.currentTarget;

    // Handle item rolls.
    if (dataset.rollType === "item") {
      const item = getItemFromEvent(event, this.actor);
      if (item) return item.roll();
    }
    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[roll] ${dataset.label}` : "";
      const roll = new LhtrpgRoll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get("core", "rollMode"),
      });
      return roll;
    }
  }

  async _onRollAttributes(event) {
    const dataset = event.currentTarget.dataset;

    const roll = AttributeRoll.fromActor(this.actor, dataset.name);
    return await roll.toMessage();
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const { dataset } = event.currentTarget;
    // Prepare the item object.
    const itemData = {
      name: `New ${type.capitalize()}`,
      type: dataset.type,
      data: duplicate(dataset),
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Implemented in children object
   */

  async _enrichHTML() {}

  _prepareItems(context) {}
  _prepareCharacterData(context) {}
}
