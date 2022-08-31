/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning document which manages these tags
 */
export async function onManageTags(event, owner) {
  event.preventDefault();
  const a = event.currentTarget;
  let tags = [...owner.system.tags];
  const id = a.dataset.tagId;

  // window div id owner
  const html = "#" + owner.documentName.toLowerCase() + "-" + owner._id;

  // console.log(event);
  // console.log(owner);
  // console.log("tags: " + html);
  switch (a.dataset.action) {
    case "create":
      await _onTagCreate(owner, tags);
      break;
    case "delete":
      await _onTagDelete(owner, tags, id);
      break;
    case "edit":
      await _onTagEdit(owner);
  }
}

async function _onTagCreate(owner, tags) {

  let newTag;
  const rendered_dialog = await renderTemplate("systems/lhtrpg/templates/dialogs/newTagDialog.html");

  let d = new Dialog({
    title: game.i18n.localize("LHTRPG.WindowTitle.Tag.AddNewTag"),
    content: rendered_dialog,
    buttons: {
      roll: {
        icon: '<i class="fas fa-plus"></i>',
        label: game.i18n.localize("LHTRPG.ButtonLabel.Tag.Add"),
        callback: html => {
          newTag = html.find('.create-new-tag-input').val();
          tags.push(newTag);

          owner.update(
            {
              "data.tags": tags
            }
          );
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("LHTRPG.ButtonLabel.Tag.Cancel"),
      }
    },
    default: "cancel"
  });
  d.render(true);
}

async function _onTagDelete(owner, tags, id) {

  tags.splice(id, 1);
  await owner.update(
    {
      "data.tags": tags
    }
  );
}

async function _onTagEdit(owner) {

  const flagValue = owner.getFlag('lhtrpg', 'isTagEditActive');

  if(flagValue === undefined || !flagValue){
    await owner.setFlag('lhtrpg', 'isTagEditActive', true);
  } else {
    await owner.setFlag('lhtrpg', 'isTagEditActive', false);
  }
}