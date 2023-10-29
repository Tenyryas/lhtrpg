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
    if (this.img === "icons/svg/mystery-man.svg") {
      const updateData = {
        img: `systems/lhtrpg/assets/ui/actors_icons/${this.type}.svg`,
      };
      await this.updateSource(updateData);
    }
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /** @override */
  applyActiveEffects() {
    // The Active Effects do not have access to their parent at preparation time so we wait until this stage to determine whether they are suppressed or not.
    this.effects.forEach((e) => e.determineSuppression());
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
    const system = this.system;

    const itemList = this.items;
    let itemNumber = 0;

    if (this.type === "character") {
      // Attributes modifiers
      if (system.attributes) {
        for (const attribute of Object.values(system.attributes)) {
          if (attribute.mod !== undefined) {
            attribute.mod = Math.floor(attribute.value / 3) ?? 0;
          }
        }
      }

      // Abilities Scores
      this._computeChecks(this);

      // Battle statuses
      this._computeBattleStatuses(this);

      // Inventory space
      this._computeInventoryMaxSpace(this);

      // item count inventory
      itemList.forEach((item) => {
        if (item.system.equipped === false) {
          itemNumber += 1;
        }
      });
      system.inventory.space = itemNumber;
    }

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData();
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData() {
    if (this.type !== "character" || this.type !== "monster") return;
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
    if (this.type !== "character") return;

    if (system.attributes) {
      for (let [k, v] of Object.entries(system.attributes)) {
        system[k] = foundry.utils.deepClone(v);
      }
    }

    if (system.battleStatus.power) {
      for (let [k, v] of Object.entries(system.battleStatus.power)) {
        system[k] = foundry.utils.deepClone(v);
      }
    }

    system.itemData = {};
    system.skillData = {};

    if (this.items) {
      this.items.forEach(function (key) {
        if (key.type === "skill") {
          system.skillData[key._id] = foundry.utils.deepClone(key.system);
        } else {
          system.itemData[key._id] = foundry.utils.deepClone(key.system);
        }
      });
    }
  }

  /**
   * Autocalc the Abilities/Checks Scores
   */
  _computeChecks() {
    const { attributes, badStatus, otherStatus, checks } = this.system;
    const { str, dex, pow, int } = attributes;
    const {
      athletics,
      endurance,
      disable,
      operation,
      evasion,
      perception,
      negotiation,
      resistance,
      knowledge,
      analysis,
      accuracy,
    } = checks;

    str.mod ??= 0;
    int.mod ??= 0;
    pow.mod ??= 0;
    dex.mod ??= 0;

    // STR Abilities
    athletics.base = str.mod;
    athletics.total = athletics.base + athletics.mod;

    endurance.base = str.mod;
    endurance.total = endurance.base + endurance.mod;

    // DEX Abilities
    disable.base = dex.mod;
    disable.total = disable.base + disable.mod;

    operation.base = dex.mod;
    operation.total = operation.base + operation.mod;

    evasion.base = dex.mod;
    evasion.total = evasion.base + evasion.mod;

    // POW Abilities
    perception.base = pow.mod;
    perception.total = perception.base + perception.mod;

    negotiation.base = pow.mod;
    negotiation.total = negotiation.base + negotiation.mod;

    resistance.base = pow.mod;
    resistance.total = resistance.base + resistance.mod;

    // INT Abilities
    knowledge.base = int.mod;
    knowledge.total = knowledge.base + knowledge.mod;

    analysis.base = int.mod;
    analysis.total = analysis.base + analysis.mod;

    if (badStatus.dazed) {
      evasion.dice -= 1;
      resistance.dice -= 1;
    }

    if (badStatus.staggered) {
      accuracy.dice -= 1;
    }

    // If any of the dice values goes under 1, get it back to 1.
    for (const check of Object.values(checks)) {
      if (badStatus.confused) {
        check.dice -= 1;
      }
      if (otherStatus.swimming) {
        check.dice -= 1;
      }
      check.dice = Math.max(check.dice, 1);
    }
  }

  /**
   * Function used for reduce function for finding all equipped items
   *
   * @param {array} accumulator See {@link Array.reduce}
   * @param {object} currentValue See {@link Array.reduce}
   * @returns {(array)} the array with all equipped items
   */
  _getItemsEquipped(accumulator, currentValue) {
    if (currentValue.system.equipped) {
      accumulator.push(currentValue);
    }
    return accumulator;
  }

  _computeBattleStatuses() {
    const { itemTypes, system } = this;
    const {
      attributes,
      battleStatus,
      badStatus,
      lifeStatus,
      checks,
      health,
      fate,
    } = system;
    const { str, int, pow, dex } = attributes;
    const { power, defense, initiative, speed } = battleStatus;

    const { attack, magic, restoration } = power;
    const { phys: pDef, magic: mDef } = defense;
    const { accuracy } = checks;

    str.mod ??= 0;
    int.mod ??= 0;
    pow.mod ??= 0;
    dex.mod ??= 0;

    attack.base ??= 0;
    attack.mod ??= 0;

    magic.base ??= 0;
    magic.mod ??= 0;

    restoration.mod ??= 0;

    pDef.mod ??= 0;
    mDef.mod ??= 0;

    initiative.mod ??= 0;
    accuracy.mod ??= 0;
    speed.mod ??= 0;

    lifeStatus.fatigue ??= 0;

    health.max ??= 0;
    fate.max ??= 0;

    let initBonus = 0;
    let pDefBonus = 0;
    let mDefBonus = 0;
    let attackBonus = 0;
    let magicBonus = 0;
    let accuBonus = 0;

    // Get equipped items
    let handSlot = 0;
    let AccessorySlot = 0;

    let mainWeapon;
    const weapons = [];
    for (const weapon of itemTypes.weapon) {
      if (weapon.system.equipped) {
        if (!mainWeapon && weapon.system.isMain) {
          mainWeapon = weapon;
        } else {
          weapons.push(weapon);
        }
      }
    }
    if (!mainWeapon && weapons.length > 0) {
      mainWeapon = weapons.shift();
    }

    const armors = itemTypes.armor.reduce(this._getItemsEquipped, []);
    const shields = itemTypes.shield.reduce(this._getItemsEquipped, []);
    const accessories = itemTypes.accessory.reduce(this._getItemsEquipped, []);
    const magicStones = itemTypes.magicStone.reduce(this._getItemsEquipped, []);

    /** Since only three accessories can be equipped at a time,
     * only take into account the first three equipped accessories.
     * If there is a Magic Stone, it takes priority
     */
    let magicStone;
    for (const currentMagicStone of magicStones) {
      if (!magicStone) {
        magicStone = currentMagicStone;
        magicStone.system.magic ??= 0;
        AccessorySlot++;
      }
    }

    for (const accessory of accessories) {
      if (AccessorySlot < 3) {
        const stat = accessory.system;

        pDefBonus += stat.pdef ?? 0;
        mDefBonus += stat.mdef ?? 0;
        initBonus += stat.initiative ?? 0;
        attackBonus += stat.attack ?? 0;
        magicBonus += stat.magic ?? 0;

        AccessorySlot++;
      }
    }

    /**
     * ATTACK, MAGIC, RESTORATION POWER
     */
    /* English rulebook tips 7
      Players cannot combine the Magic Power of a Staff weapon and a Magic Stone.
      If they want to do something like that, tell them to look at Sigil Guard.
    */

    // case: Has a Weapon
    if (mainWeapon) {
      attack.base = mainWeapon.system.attack ?? 0;

      mainWeapon.system.magic ??= 0;
      // case 1: Magic Stone has better magic stat than Weapon
      if (magicStone && magicStone.system.magic > mainWeapon.system.magic) {
        magic.base = magicStone.system.magic;
        // case 2: Has only a Weapon or Weapon has better magic stat
      } else {
        magic.base = mainWeapon.system.magic;
      }
      initBonus += mainWeapon.system.initiative ?? 0;
      accuBonus += mainWeapon.system.accuracy ?? 0;

      if (mainWeapon.system.isTwoHanded) {
        handSlot += 2;
      } else {
        handSlot++;
      }
      // case 3: Has only a Magic Stone
    } else if (magicStone) {
      magic.base = magicStone.system.magic;
    }

    /**
     * DEFENSES / INITIATIVE
     */
    pDef.base = str.mod * 2;
    mDef.base = int.mod * 2;

    initiative.base = str.mod + int.mod;

    // Since only one armor can be equipped at a time, only take into account the first equipped armor
    let armor;
    for (const currentArmor of armors) {
      if (!armor) {
        armor = currentArmor;
        pDefBonus += currentArmor.system.pdef ?? 0;
        mDefBonus += currentArmor.system.mdef ?? 0;
        initBonus += currentArmor.system.initiative ?? 0;
      }
    }

    // Equip weapons or shields until Hand slot is full
    for (const weapon of weapons) {
      if (handSlot < 2 && !weapon.system.isTwoHanded) {
        initBonus += weapon.system.initiative ?? 0;
        accuBonus += weapon.system.accuracy ?? 0;
        handSlot++;
      }
    }
    for (const shield of shields) {
      if (handSlot < 2) {
        pDefBonus += shield.system.pdef ?? 0;
        mDefBonus += shield.system.mdef ?? 0;
        handSlot++;
      }
    }

    // case 4: Unarmed
    if (handSlot === 0) {
      attack.base = str.mod;
      magic.base = int.mod;
    }

    // Assign values to total
    attack.total = attack.base + attack.mod + attackBonus;
    magic.total = magic.base + magic.mod + magicBonus;
    restoration.total = restoration.mod;

    // Assign values to total
    pDef.total = pDef.base + pDef.mod + pDefBonus;
    mDef.total = mDef.base + mDef.mod + mDefBonus;

    let initTotal = initiative.base + initiative.mod + initBonus;

    // If the initiative goes under zero, it's equal to zero
    initiative.total = Math.max(initTotal, 0);

    accuracy.base = Math.max(str.mod, int.mod, pow.mod, dex.mod);
    accuracy.total = accuracy.base + accuracy.mod + accuBonus;

    /**
     * SPEED/MOVEMENT
     */
    speed.base = 2;
    speed.total = speed.base + speed.mod;

    /**
     * STATUS
     */

    if (badStatus.rigor) {
      speed.total = 0;
    }

    /**
     * - Fatigue reduces the afflicted character's Max HP by its Rating.
     * - Fatigue can reduce Max HP to 0
     */
    health.totalMax = Math.max(health.max - lifeStatus.fatigue, 0);

    // Health value can't be bigger than the total max and less than 0
    const healthValue = Math.min(health.value, health.totalMax);
    health.value = Math.max(healthValue, 0);

    // Fate value can't be less than 0
    fate.value = Math.max(fate.value, 0);
  }

  _computeInventoryMaxSpace() {
    const { inventory } = this.system;

    inventory.base = 2;
    inventory.mod ??= 0;

    // Get equipped bags
    const bags = this.itemTypes.bag.reduce(this._getItemsEquipped, []);

    let bonusBagSpace = 0;
    for (const bag of bags) {
      bonusBagSpace += bag.system.bagSpace ?? 0;
    }

    inventory.maxSpace = inventory.base + inventory.mod + bonusBagSpace;
  }
}
