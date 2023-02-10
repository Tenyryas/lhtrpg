import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import {onManageTags} from "../helpers/tags.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class LHTrpgActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["lhtrpg", "sheet", "actor"],
      template: "systems/lhtrpg/templates/actor/actor-sheet.html",
      width: 700,
      height: 700,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" },
      { navSelector: ".status-tabs", contentSelector: ".status-body", initial: "status" },
      { navSelector: ".skills-tabs", contentSelector: ".skills-body", initial: "basic" },
      { navSelector: ".bio-tabs", contentSelector: ".bio-body", initial: "bio" }],
      dragDrop: [{dragSelector: ".items-list .item", dropSelector: null},
      {dragSelector: ".inventory-list .item", dropSelector: null}]
    });
  }

  /** @override */
  get template() {
    return `systems/lhtrpg/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Enrich textarea content
    context.enrichments = {
      "biography": await TextEditor.enrichHTML(context.system.biography, {async: true})
    };

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {


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
    const skillsBasic = [];
    const skillsCombat = [];
    const skillsGeneral = [];

    const itemsEquippedWeapon = [];
    const itemsEquippedArmor = [];
    const itemsEquippedShield = [];
    const itemsEquippedAccessory = [];
    const itemsEquippedBag = [];
    const itemsEquippedGear = [];
    const itemsWeapon = [];
    const itemsArmor = [];
    const itemsShield = [];
    const itemsAccessory = [];
    const itemsBag = [];
    const itemsGear = [];

    const itemsConnection = [];
    const itemsUnion = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to Combat Skills.
      if (i.type === 'skill' && i.system.subtype === 'Combat') {
        skillsCombat.push(i);
      }
      // Append to Basic Skills.
      else if (i.type === 'skill' && i.system.subtype === 'Basic') {
        skillsBasic.push(i);
      }
      // Append to General Skills.
      else if (i.type === 'skill' && i.system.subtype === 'General') {
        skillsGeneral.push(i);
      }
      // Append to Equipped gear.
      else if (i.system.equipped === true && i.type === 'weapon') {
        itemsEquippedWeapon.push(i);
      }
      else if (i.system.equipped === true && i.type === 'armor') {
        itemsEquippedArmor.push(i);
      }
      else if (i.system.equipped === true && i.type === 'shield') {
        itemsEquippedShield.push(i);
      }
      else if (i.system.equipped === true && i.type === 'accessory') {
        itemsEquippedAccessory.push(i);
      }
      else if (i.system.equipped === true && i.type === 'bag') {
        itemsEquippedBag.push(i);
      }
      else if (i.system.equipped === true && i.type === 'gear') {
        itemsEquippedGear.push(i);
      }
      // Append to Weapons.
      else if (i.system.equipped === false && i.type === 'weapon') {
        itemsWeapon.push(i);
      }
      // Append to Armors.
      else if (i.system.equipped === false && i.type === 'armor') {
        itemsArmor.push(i);
      }
      // Append to Shields.
      else if (i.system.equipped === false && i.type === 'shield') {
        itemsShield.push(i);
      }
      // Append to Accessories.
      else if (i.system.equipped === false && i.type === 'accessory') {
        itemsAccessory.push(i);
      }
      // Append to Bags.
      else if (i.system.equipped === false && i.type === 'bag') {
        itemsBag.push(i);
      }
      // Append to Gear.
      else if (i.system.equipped === false && i.type === 'gear') {
        itemsGear.push(i);
      }
      // Append to Connections.
      else if (i.type === 'connection') {
        itemsConnection.push(i);
      }
      // Append to Unions.
      else if (i.type === 'union') {
        itemsUnion.push(i);
      }
    }

    // Assign and return
    context.skills = {
      "combat": skillsCombat,
      "basic": skillsBasic,
      "general": skillsGeneral
    };

    context.items = {
      "equipped": {
        "weapons": itemsEquippedWeapon,
        "armors": itemsEquippedArmor,
        "shields": itemsEquippedShield,
        "accessories": itemsEquippedAccessory,
        "bags": itemsEquippedBag,
        "gear": itemsEquippedGear
      },
      "weapons": itemsWeapon,
      "armors": itemsArmor,
      "shields": itemsShield,
      "accessories": itemsAccessory,
      "bags": itemsBag,
      "gear": itemsGear,
    }

    context.social = {
      "connections": itemsConnection,
      "unions": itemsUnion
    }
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.addItem a.item-controls').click(ev => {
      $('.addItem .dropdown-content').toggleClass('show');
    });

    html.find('#hate-button').click(ev => {
      let content = ev.target.nextElementSibling;
      ev.target.classList.toggle("active");

      if (content.style.transform === "perspective(400px) rotateY(-30deg)"){
        content.style.transform = "perspective(400px) rotateY(-90deg)";
        // this._onOpeningInfoWindow(false, this.actor);
      } else {
        content.style.transform = "perspective(400px) rotateY(-30deg)";    
        // this._onOpeningInfoWindow(true, this.actor);
      }

    });

    // Roll skill
    html.find('.rollableSkill').click(this._onRollSkill.bind(this));
    

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-equip').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      let equipped = item.system.equipped;
      equipped = !equipped;
      item.update(
        { 'system.equipped': equipped}
      )
      li.slideUp(200, () => this.render(false));
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Tag management
    html.find(".tag-control").click(ev => onManageTags(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    console.log(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };

    console.log(itemData);
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[roll] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  async _onRollSkill(event) {

    const element = event.currentTarget;
    const dataset = element.dataset;
    const dice = dataset.dice;
    const bonus = dataset.bonus;
    const skillName = dataset.name;
    console.log(dataset);
    const rendered_dialog = await renderTemplate("systems/lhtrpg/templates/dialogs/rollDialog.html");
    const checkName = `LHTRPG.Check.${skillName}`;
    let mod;

    let d = new Dialog({
      title: `${game.i18n.localize("LHTRPG.WindowTitle.AbilityCheck")} - ${game.i18n.localize(checkName)}`,
      content: rendered_dialog,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice"></i>',
          label: game.i18n.localize("LHTRPG.ButtonLabel.Roll"),
          callback: html => {
            mod = html.find('.abilityCheckMod').val();
            this.rollSkill(skillName, dice, bonus, mod);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("LHTRPG.ButtonLabel.Cancel"),
        }
      },
      default: "cancel"
    });
    d.render(true);

  }

  rollSkill(skillName, dice, bonus, mod) {

    const checkName = `LHTRPG.Check.${skillName}`;
    const flavorText = `${game.i18n.localize("LHTRPG.WindowTitle.AbilityCheck")} - ${game.i18n.localize(checkName)}`;
    let roll;
    let formula;

    if(mod === undefined || mod == 0) {
      formula = `${dice}d6+${bonus}`;
    }
    else if (mod > 0) {
      formula = `${dice}d6+${bonus}+${mod}`;
    }
    else {
      formula = `${dice}d6+${bonus}-${Math.abs(mod)}`;
    }

    console.log(formula);


    roll = new Roll(formula);

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: flavorText,
      rollMode: game.settings.get('core', 'rollMode'),
    });

    return roll;

  }

  // async _onOpeningInfoWindow (state, actor) {
  //   console.log(state);
  //   console.log(actor);
  //   await actor.setFlag("lhtrpg", "hfWindowOpened", state);
  // }

}
