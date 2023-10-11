export async function _createSkillsCompendiums() {
  let json = await (
    await fetch("https://lhrpg.com/lhz/api/skills.json")
  ).json();
  let job_types = [];

  let collection;
  let newComp;

  for (const value of Object.values(json)) {
    ui.notifications.info(game.i18n.localize("IMPORT.Notif.Skills"));
    for (const val2 of Object.values(value)) {
      //prepopulate job_types with the world's collection to see if any of the compendiums is
      // already created
      game.packs.map((row, index) => {
        if (job_types.indexOf(row.title) === -1) {
          job_types.push(row.title);
        }
      });

      // If a collection name is not in the array, add it, and create a new compendium for it
      if (job_types.indexOf(val2.job_type) === -1) {
        job_types.push(val2.job_type);

        newComp = await CompendiumCollection.createCompendium({
          label: val2.job_type,
          type: "Item",
        });
        collection = newComp.collection;
      } else {
        game.packs.map((row, index) => {
          if (row.title == val2.job_type && row.documentName == "Item") {
            collection = row.collection;
          }
        });
      }

      let skillType;
      switch (val2.type) {
        case "一般":
          skillType = "General";
          break;
        case "戦闘":
          skillType = "Combat";
          break;
        default:
          skillType = "Basic";
          break;
      }

      const desc = `
        <p>${val2.function}</p>
        <hr>
        <p>${val2.explain}</p>
        `;

      let data = {
        name: val2.name,
        type: "skill",
        system: {
          checkType: val2.roll,
          cost: val2.cost,
          description: desc,
          limit: val2.limit,
          range: val2.range,
          skillRank: {
            value: 1,
            max: val2.skill_max_rank,
          },
          subtype: skillType,
          tags: val2.tags,
          target: val2.target,
          timing: val2.timing,
        },
      };

      const indexes = await game.packs.get(collection).getIndex();

      let skill = indexes.getName(val2.name);

      if (skill === undefined) {
        await Item.create(data, { pack: collection });
      }
    }
  }
  ui.notifications.info(game.i18n.localize("IMPORT.Notif.SkillsDone"));
}

export async function _createItemsCompendiums() {
  let json = await (await fetch("https://lhrpg.com/lhz/api/items.json")).json();
  let item_types = [];

  let collection;
  let newComp;

  for (const value of Object.values(json)) {
    ui.notifications.info(game.i18n.localize("IMPORT.Notif.Items"));
    for (const val2 of Object.values(value)) {
      //prepopulate job_types with the world's collection to see if any of the compendiums is
      // already created
      game.packs.map((row, index) => {
        if (
          item_types.indexOf(row.title) === -1 &&
          row.documentName === "Item"
        ) {
          item_types.push(row.title);
        }
      });

      //If a collection name is not in the array, add it, and create a new compendium for it
      if (item_types.indexOf(val2.type) === -1) {
        item_types.push(val2.type);

        newComp = await CompendiumCollection.createCompendium({
          label: val2.type,
          type: "Item",
        });
        collection = newComp.collection;
      } else {
        game.packs.map((row, index) => {
          if (row.title == val2.type && row.documentName == "Item") {
            collection = row.collection;
          }
        });
      }

      let itemType;
      switch (val2.type) {
        case "武器":
        case "楽器":
          itemType = "weapon";
          break;
        case "防具":
          itemType = "armor";
          break;
        case "盾":
          itemType = "shield";
          break;
        case "補助":
          itemType = "accessory";
          break;
        case "収納":
          itemType = "bag";
          break;
        default:
          itemType = "gear";
          break;
      }

      let desc = `<p>${val2.function}</p>`;
      if (val2.recipe !== null) {
        desc = desc + "<hr><p>" + val2.recipe + "</p>";
      }

      const data = {
        name: val2.name,
        type: itemType,
        system: {
          rank: val2.item_rank,

          checkType: val2.roll,
          range: val2.range,
          target: val2.target,
          timing: val2.timing,

          attack: val2.physical_attack,
          magic: val2.magic_attack,
          pdef: val2.physical_defense,
          mdef: val2.magic_defense,
          accuracy: val2.hit,
          initiative: val2.action,

          tags: val2.tags,
          description: desc,
          price: val2.price,
        },
      };

      const indexes = await game.packs.get(collection).getIndex();

      const item = indexes.getName(val2.name);

      if (item === undefined) {
        await Item.create(data, { pack: collection });
      }
    }
    ui.notifications.info(game.i18n.localize("IMPORT.Notif.ItemsDone"));
  }
}
