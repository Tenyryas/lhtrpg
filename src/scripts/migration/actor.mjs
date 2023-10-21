export function migrateActorData(actorData) {
  const updateData = {};

  // Actor Data Updates
  _migrateVehicleOperator(actorData, updateData);
  _migrateGeneralPowerPoints(actorData, updateData);

  // Migrate Owned Items
  if (!actor.items) return updateData;
  const items = actor.items.reduce((arr, i) => {
    // Migrate the Owned Item
    const itemData = i instanceof CONFIG.Item.documentClass ? i.toObject() : i;
    const itemUpdate = migrateItemData(itemData);

    // Update the Owned Item
    if (!foundry.utils.isEmpty(itemUpdate)) {
      itemUpdate._id = i._id;
      arr.push(foundry.utils.expandObject(itemUpdate));
    }

    return arr;
  }, []);

  if (items.length > 0) updateData.items = items;
  return updateData;
}
