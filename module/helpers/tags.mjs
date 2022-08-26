/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning document which manages these tags
 */
export async function onManageTags(event, owner) {
  event.preventDefault();
  const a = event.currentTarget;
  let tags = [...owner.data.data.tags];
  const id = a.dataset.tagId;

  // window div id owner
  const html = "#" + owner.documentName.toLowerCase() + "-" + owner.data._id;

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
      $(`${html} .tag-control[data-action='delete']`).toggleClass("active");
  }
}

async function _onTagCreate(owner, tags) {

  let newTag;
  const rendered_dialog = await renderTemplate("systems/lhtrpg/templates/dialogs/newTagDialog.html");

  let d = new Dialog({
    title: `Create new tag`,
    content: rendered_dialog,
    buttons: {
      roll: {
        icon: '<i class="fas fa-plus"></i>',
        label: "Create",
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
        label: "Cancel",
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