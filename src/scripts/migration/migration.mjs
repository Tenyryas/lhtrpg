export async function migrateWorld() {
  const version = game.system.version;

  Logger.info(
    `Applying Lhtrpg System Migration for version ${version}. Please be patient and do not close your game or shut down your server.`,
    { permanent: true, toast: true },
  );

  // Gather the World Actors/Items to migrate
  const actors = game.actors
    .map((a) => [a, true])
    .concat(
      Array.from(game.actors.invalidDocumentIds).map((id) => [
        game.actors.getInvalid(id),
        false,
      ]),
    );

  const items = game.items
    .map((i) => [i, true])
    .concat(
      Array.from(game.items.invalidDocumentIds).map((id) => [
        game.items.getInvalid(id),
        false,
      ]),
    );

  const packs = game.packs.filter((p) =>
    ["Actor", "Item", "Scene"].includes(p.documentName),
  );

  const counter = new MigrationCounter(
    items.length +
      actors.length +
      packs.length +
      game.scenes.size +
      game.users.size,
  );

  // Migrate World Actors
  for (const [actor, valid] of actors) {
    try {
      await dedupeActorActiveEffects(actor);
      await _migratePTModifiers(actor);
      const source = valid
        ? actor.toObject()
        : game.data.actors.find((a) => a._id === actor.id);
      const updateData = migrateActorData(source);
      if (!foundry.utils.isEmpty(updateData)) {
        console.log(`Migrating Actor document ${actor.name}`);
        await actor.update(updateData, { enforceTypes: false, diff: valid });
      }
    } catch (err) {
      err.message = `Failed Lhtrpg System Migration for Actor ${actor.name}: ${err.message}`;
      console.error(err);
    } finally {
      counter.increment();
    }
  }

  // Migrate Compendium Packs
  for (const pack of packs) {
    await migrateCompendium(pack);
    counter.increment();
  }

  // Set the migration as complete
  await game.settings.set("lhtrpg", "systemMigrationVersion", version);
  Logger.info(`Lhtrpg System Migration to version ${version} completed!`, {
    permanent: true,
    toast: true,
  });
}
