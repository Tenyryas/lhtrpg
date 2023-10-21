/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning document which manages this effect
 */
export function onManageActiveEffect(event, owner) {
  event.preventDefault();
  const a = event.currentTarget;
  const li = a.closest("li");
  const { effectId, effectType } = li.dataset;
  const effect = owner.effects.get(effectId);
  switch (a.dataset.action) {
    case "create":
      return owner.createEmbeddedDocuments("ActiveEffect", [
        {
          label: "New Effect",
          icon: "icons/svg/aura.svg",
          origin: owner.uuid,
          "duration.rounds": effectType === "temporary" ? 1 : undefined,
          disabled: effectType === "inactive",
        },
      ]);
    case "edit":
      return effect.sheet.render(true);
    case "delete":
      return effect.delete();
    case "toggle":
      return effect.update({ disabled: !effect.disabled });
  }
}

/**
 * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
 * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
 * @return {object}                   Data for rendering
 */
export function prepareActiveEffectCategories(effects) {
  // Define effect header categories
  const categories = {
    temporary: {
      type: "temporary",
      label: "Temporary Effects",
      effects: [],
    },
    passive: {
      type: "passive",
      label: "Passive Effects",
      effects: [],
    },
    inactive: {
      type: "inactive",
      label: "Inactive Effects",
      effects: [],
    },
    suppressed: {
      type: "suppressed",
      label: "Suppressed Effects",
      effects: [],
    },
  };

  // Iterate over active effects, classifying them into categories
  for (let effect of effects) {
    effect.sourceName; // Trigger a lookup for the source name
    if (effect.isSuppressed) categories.suppressed.effects.push(effect);
    else if (effect.disabled) categories.inactive.effects.push(effect);
    else if (effect.isTemporary) categories.temporary.effects.push(effect);
    else categories.passive.effects.push(effect);
  }

  categories.suppressed.hidden = true;
  return categories;
}
