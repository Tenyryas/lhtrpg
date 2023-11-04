import { prepareModelData, calculateTotal } from "../datamodel/common.mjs";

export class LHTrpgActor extends Actor {
  static HAND_SLOT = 2;
  static ACCESSORY_SLOT = 3;
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
    this.applyToData(prepareModelData);
    if (this.type === "character") {
      this.prepareCharacterBaseData();
    }
  }

  prepareCharacterBaseData() {
    this.system.equipment = {
      mainWeapon: null,
      magicStone: null,
      hands: [],
      armor: null,
      accessories: [],
      bag: null,
    };

    const { equipment } = this.system;

    // Get equipped items
    let handSlot = LHTrpgActor.HAND_SLOT;

    const weapons = [];
    for (const weapon of this.itemTypes.weapon) {
      const { inventory } = weapon.system;
      if (inventory.isEquipped) {
        if (!equipment.mainWeapon && inventory.isMain) {
          equipment.mainWeapon = weapon;
        } else {
          weapons.push(weapon);
        }
      }
    }
    if (!equipment.mainWeapon && weapons.length > 0) {
      equipment.mainWeapon = weapons.shift();
    }
    if (equipment.mainWeapon) {
      equipment.hand.push(equipment.mainWeapon);
      handSlot -= mainWeapon.system.equipmentSlot;
    }

    const armors = this._getEquippedItems(this.itemTypes.armor);
    const shields = this._getEquippedItems(this.itemTypes.shield);
    const accessories = this._getEquippedItems(this.itemTypes.accessory);
    const magicStones = this._getEquippedItems(this.itemTypes.magicStone);
    const bags = this._getEquippedItems(this.itemTypes.bag);

    /** Since only three accessories can be equipped at a time,
     * only take into account the first three equipped accessories.
     * If there is a Magic Stone, it takes priority
     */
    if (magicStones.length > 0) {
      equipment.magicStone = magicStones.shift();
      equipment.accessory.push(equipment.magicStone);
    }

    for (const accessory of accessories) {
      if (equipment.accessory.length < LHTrpgActor.ACCESSORY_SLOT) {
        equipment.accessory.push(accessory);
      }
    }

    // Since only one armor can be equipped at a time, only take into account the first equipped armor
    if (armors.length > 0) {
      equipment.armor.push(armors[0]);
    }

    // Equip weapons or shields until Hand slot is full
    for (const weapon of weapons) {
      if (handSlot - weapon.system.equipmentSlot >= 0) {
        equipment.hand.push(weapon);
        handSlot -= weapon.system.equipmentSlot;
      }
    }
    for (const shield of shields) {
      if (handSlot - shield.system.equipmentSlot >= 0) {
        equipment.hand.push(shield);
        handSlot -= shield.system.equipmentSlot;
      }
    }

    if (bags.length > 0) {
      equipment.bag = bags.shift();
    }
  }

  /** @override */
  applyActiveEffects() {
    // The Active Effects do not have access to their parent at preparation time so we wait until this stage to determine whether they are suppressed or not.
    this.effects.forEach((e) => e.determineSuppression());
    return super.applyActiveEffects();
  }

  prepareDerivedData() {
    const { attribute, initiative } = this.system.stats;
    if (this.type === "character") {
      this.prepareCharacterDerivedData();
    }
    this.applyToData(calculateTotal);
    // Dice number can't be under 1
    for (const key in attribute) {
      const { dice } = attribute[key];
      Math.max(dice.total, 1);
    }
    // If the initiative goes under zero, it's equal to zero
    initiative.total = Math.max(initiative.total, 0);
  }

  prepareCharacterDerivedData() {
    const { items, system } = this;
    const { stats, inventory, equipment } = system;
    const { mainWeapon, magicStone, hands, armor, accessories, bag } =
      equipment;
    const { power } = stats;
    const { attack, magic } = power;

    const magicStoneMagic = magicStone?.system.stats.power.magic ?? 0;

    /* English rulebook tips 7
      Players cannot combine the Magic Power of a Staff weapon and a Magic Stone.
      If they want to do something like that, tell them to look at Sigil Guard.
    */
    if (mainWeapon) {
      attack.items += mainWeapon.system.stats.power.attack;
      // case 1: Magic Stone has better magic stat than Weapon
      const weaponMagic = mainWeapon.system.stats.power.magic;
      if (magicStone && magicStoneMagic > weaponMagic) {
        magic.items += magicStoneMagic;
        // case 2: Has only a Weapon or Weapon has better magic stat
      } else {
        magic.items += weaponMagic;
      }

      handSlot -= mainWeapon.system.equipmentSlot;
      // case 3: Has only a Magic Stone
    } else if (magicStone) {
      magic.items = magicStoneMagic;
    }

    for (hand of hands) {
      this.addCommonItemStat(hand);
    }

    this.addAllItemStat(armor);

    for (accessory of accessories) {
      if (accessory.type === "magicStone") {
        this.addCommonItemStat(accessory);
      } else {
        this.addAllItemStat(accessory);
      }
    }

    this.addAllItemStat(bag);

    // item count inventory
    inventory.space.used = items.reduce((used, item) => {
      used += item.system.space;
    }, 0);
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
   * Function used for reduce function for finding all equipped items
   *
   * @param {array} accumulator See {@link Array.reduce}
   * @param {object} currentValue See {@link Array.reduce}
   * @returns {(array)} the array with all equipped items
   */
  _getEquippedItems(items) {
    return items.reduce((list, item) => {
      if (item.system.inventory.isEquipped) {
        list.push(currentValue);
      }
      return list;
    }, []);
  }

  addCommonItemStat(item) {
    if (!item) return;
    const { stats, inventory } = this.system;
    const { attribute, defense, initiative } = stats;
    const { accuracy } = attribute;
    const { physical, magical } = defense;

    const { space } = inventory;

    if (item.system.stats) {
      const { stats: itemStats } = item.system;

      accuracy.mod.items += itemStats.attribute.accuracy ?? 0;

      physical.items += itemStats.defense.physical ?? 0;
      magical.items += itemStats.defense.magical ?? 0;

      initiative.items += itemStats.initiative ?? 0;
    }

    if (item.system.inventory) {
      const { inventory: itemInventory } = item.system;

      space.items += itemInventory.space ?? 0;
    }
  }

  addAllItemStat(item) {
    if (!item) return;

    this.addCommonItemStat(item);

    if (item.system.stats) {
      const { attack, magic } = this.system.stats.power;
      const { stats: itemStats } = item.system;

      attack.items += itemStats.power.attack ?? 0;
      magic.items += itemStats.power.magic ?? 0;
    }
  }

  applyToData(callback) {
    const { stats, inventory } = this.system;
    const { attribute, power, defense, initiative } = stats;
    const { space } = inventory;

    for (const key in attribute) {
      const { mod, dice } = attribute[key];
      callback(mod);
      callback(dice);
    }
    for (const key in power) {
      const mod = power[key];
      callback(mod);
    }
    for (const key in defense) {
      const mod = defense[key];
      callback(mod);
    }
    callback(initiative);

    callback(space);
  }
}
