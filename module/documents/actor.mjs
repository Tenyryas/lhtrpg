/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class LHTrpgActor extends Actor {


  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /**
   * Make adjustments before Character creation, like an actor type default picture
   */
  async _preCreate(createData, options, user) {
    await super._preCreate(createData, options, user);

    // add item default picture depending on type
    if(this.img === 'icons/svg/mystery-man.svg'){
      const updateData = {};
      updateData['img'] = `systems/lhtrpg/assets/ui/actors_icons/${this.type}.svg`;
      await this.update(updateData);
    }
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.

  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const system = actorData.system;
    const itemlist = actorData.items;
    const flags = actorData.flags.lhtrpg || {};
    let itemNumber = 0;

    if (actorData.type === 'character') {
      // Abilities modifiers
      system.attributes.str.mod = Math.floor(system.attributes.str.value / 3);
      system.attributes.dex.mod = Math.floor(system.attributes.dex.value / 3);
      system.attributes.pow.mod = Math.floor(system.attributes.pow.value / 3);
      system.attributes.int.mod = Math.floor(system.attributes.int.value / 3);

      itemlist.forEach(item => {
        if(item.system.equipped !== undefined) {
          if(item.system.equipped == false) {
            itemNumber += 1;
          }
        }
      });
      system.inventory.space = itemNumber;
    }

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character' || actorData.type !== 'monster' ) return;

    // Make modifications to data here. For example:
    const data = actorData;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const system = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(system);

    return system;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(system) {
    if (this.type !== 'character') return;

    if (system.attributes) {
      for (let [k, v] of Object.entries(system.attributes)) {
        system[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    // if (data.attributes.level) {
    //   data.lvl = data.attributes.level ?? 0;
    // }
  }

}