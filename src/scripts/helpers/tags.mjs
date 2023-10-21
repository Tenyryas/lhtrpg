/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning document which manages these tags
 */
export async function onManageTags(event, owner) {
  event.preventDefault();
  const { tagId, tags, action } = event.currentTarget.dataset;
  let copyTags = [...tags];

  switch (action) {
    case "create":
      await _onTagCreate(owner, copyTags);
      break;
    case "delete":
      await _onTagDelete(owner, copyTags, tagId);
      break;
    case "edit":
      await _onTagEdit(owner);
  }
}

async function _onTagCreate(owner, tags) {
  let newTag;
  const renderedDialog = await renderTemplate(
    "systems/lhtrpg/templates/dialogs/newTagDialog.html",
  );

  let d = new Dialog({
    title: game.i18n.localize("LHTRPG.WindowTitle.Tag.AddNewTag"),
    content: renderedDialog,
    buttons: {
      roll: {
        icon: '<i class="fas fa-plus"></i>',
        label: game.i18n.localize("LHTRPG.ButtonLabel.Tag.Add"),
        callback: (html) => {
          newTag = html.find(".create-new-tag-input").val();
          tags.push(newTag);

          owner.update({
            "data.tags": tags,
          });
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("LHTRPG.ButtonLabel.Cancel"),
      },
    },
    default: "cancel",
  });
  d.render(true);
}

async function _onTagDelete(owner, tags, id) {
  tags.splice(id, 1);
  await owner.update({
    "data.tags": tags,
  });
}

async function _onTagEdit(owner) {
  const flagValue = owner.getFlag("lhtrpg", "isTagEditActive");

  const isTagEditActive = flagValue === undefined || !flagValue;
  await owner.setFlag("lhtrpg", "isTagEditActive", isTagEditActive);
}
