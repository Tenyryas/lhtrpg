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

    // add actor default picture depending on type
    if(this.img === 'icons/svg/mystery-man.svg'){
      const updateData = {};
      updateData['img'] = `systems/lhtrpg/assets/ui/actors_icons/${this.type}.svg`;
      await this.updateSource(updateData);
    }
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
    const actorData = this;
    const flags = actorData.flags.lhtrpg || {};

    // async function setMigrationFlag(actor, bool) {
    //   await actor.setFlag('lhtrpg', 'hasMigrated9to10', bool);
    // }

    // if(this.getFlag('lhtrpg', 'hasMigrated9to10') === undefined) {
    //   setMigrationFlag(actorData,false);
    // }


    // // v9 to v10 stats migration
    // if(this.getFlag('lhtrpg', 'hasMigrated9to10') === false) {
    //   const system = this.system;
    //   const attributes = system.attributes
    //   const infos = system.infos
    //   if(attributes.crank !== undefined) {
    //     infos.crank = attributes.crank;
    //   }
    //   else if(attributes.hate !== undefined) {
    //     infos.hate = attributes.hate;
    //   }
    //   else if(attributes.fatigue !== undefined) {
    //     infos.fatigue = attributes.fatigue;
    //   }
    //   else if(attributes.level !== undefined) {
    //     infos.level = attributes.level;
    //   }
    //   delete attributes.hate;
    //   delete attributes.fatigue;
    //   delete attributes.crank;
    //   delete attributes.level;

    //   setMigrationFlag(actorData,true);
    // }
  }

  /** @override */
  applyActiveEffects() {
    // The Active Effects do not have access to their parent at preparation time so we wait until this stage to determine whether they are suppressed or not.
    this.effects.forEach(e => e.determineSuppression());
    return super.applyActiveEffects();
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
    const str = system.attributes.str;
    const dex = system.attributes.dex;
    const pow = system.attributes.pow;
    const int = system.attributes.int;
    const checks = system.checks;
    const itemlist = actorData.items;
    const flags = actorData.flags.lhtrpg || {};
    let itemNumber = 0;

    if (actorData.type === 'character') {


      // Attributes modifiers
      if (system.attributes) {
        for (let [k] of Object.entries(system.attributes)) {
          if(system.attributes[k].mod !== undefined) {       
            system.attributes[k].mod = Math.floor(system.attributes[k].value / 3);
          }
        }
      }

      // Abilities Scores
      this._computeChecks(actorData);


      // item count inventory
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

    // if (system.attributes) {
    //   for (let [k, v] of Object.entries(system.attributes)) {
    //     system[k] = foundry.utils.deepClone(v);
    //   }
    // }

    // Add level for easier access, or fall back to 0.
    // if (data.attributes.level) {
    //   data.lvl = data.attributes.level ?? 0;
    // }
  }

  /**
   * Autocalc the Abilities/Checks Scores
   * @param actorData 
   */
  _computeChecks(actorData) {
    const system = actorData.system;
    const checks = system.checks;
    const str = system.attributes.str;
    const dex = system.attributes.dex;
    const pow = system.attributes.pow;
    const int = system.attributes.int;

    // STR Abilities
    checks.athletics.base = str.mod ?? 0;
    checks.athletics.total = checks.athletics.base + checks.athletics.mod;

    checks.endurance.base = str.mod ?? 0;
    checks.endurance.total = checks.endurance.base + checks.endurance.mod;

    // DEX Abilities
    checks.disable.base = dex.mod ?? 0;
    checks.disable.total = checks.disable.base + checks.disable.mod;

    checks.operation.base = dex.mod ?? 0;
    checks.operation.total = checks.operation.base + checks.operation.mod;

    checks.evasion.base = dex.mod ?? 0;
    checks.evasion.total = checks.evasion.base + checks.evasion.mod;

    // POW Abilities
    checks.perception.base = pow.mod ?? 0;
    checks.perception.total = checks.perception.base + checks.perception.mod;
    
    checks.negotiation.base = pow.mod ?? 0;
    checks.negotiation.total = checks.negotiation.base + checks.negotiation.mod;
    
    checks.resistance.base = pow.mod ?? 0;
    checks.resistance.total = checks.resistance.base + checks.resistance.mod;
    
    // INT Abilities
    checks.knowledge.base = int.mod ?? 0;
    checks.knowledge.total = checks.knowledge.base + checks.knowledge.mod;
    
    checks.analysis.base = int.mod ?? 0;
    checks.analysis.total = checks.analysis.base + checks.analysis.mod;

    // Accuracy
    checks.accuracy.base = Math.max(str.mod, int.mod, pow.mod, dex.mod);
    checks.accuracy.total = checks.accuracy.base + checks.accuracy.mod;

    // If any of the dice values goes under 1, get it back to 1.
    for( let [check] of Object.entries(checks)) {
      checks[check].dice = Math.max(checks[check].dice, 1);
    }


  }

}