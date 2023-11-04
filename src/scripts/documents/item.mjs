import { skillChatMessage } from "../chat/SkillChatMessage.mjs";

export class LHTrpgItem extends Item {
  /**
   * Should this item's active effects be suppressed.
   * @type {boolean}
   */
  get areEffectsSuppressed() {
    let requireEquipped = true;
    switch (this.type) {
      case "skill":
      case "connection":
      case "union":
        requireEquipped = false;
        break;
    }
    return requireEquipped && !this.system.inventory.isEquipped;
  }

  /**
   * Make adjustments before Item creation, like an item type default picture
   */
  async _preCreate(createData, options, user) {
    await super._preCreate(createData, options, user);

    // add item default picture depending on type
    if (this.img === "icons/svg/item-bag.svg") {
      const updateData = {
        img: `systems/lhtrpg/assets/ui/items_icons/${this.type}.svg`,
      };
      await this.updateSource(updateData);
    }
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   *
   */
  getRollData() {
    // If present, return the actor's roll data.
    if (!this.actor) return null;
    let rollData = {};
    rollData.actor = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    if (this.type === "skill") {
      return await skillChatMessage(this);
    }
  }
}
