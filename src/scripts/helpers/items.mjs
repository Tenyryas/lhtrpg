export function getItemFromEvent(event, actor) {
  const li = $(event.currentTarget).parents(".item");
  const itemId = li.data("itemId");
  return actor.items.get(itemId);
}
