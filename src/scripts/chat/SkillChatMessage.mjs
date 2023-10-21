import AccuracyRoll from "../roll/AccuracyRoll.mjs";
import DamageRoll from "../roll/DamageRoll.mjs";
import HealRoll from "../roll/HealRoll.mjs";

const SKILL_TEMPLATE = "systems/lhtrpg/templates/chat/skill-chat-message.html";

export async function skillChatMessage(item) {
  const isPrivate = false;
  const actor = item.actor;
  const speaker = ChatMessage.getSpeaker({ actor: actor });
  const rolls = [];

  const accuracyRoll = AccuracyRoll.fromItem(item);
  if (accuracyRoll) {
    rolls.push(accuracyRoll);
  }
  const damageRoll = DamageRoll.fromItem(item);
  if (damageRoll) {
    rolls.push(damageRoll);
  }
  const healRoll = HealRoll.fromItem(item);
  if (healRoll) {
    rolls.push(healRoll);
  }

  for (const roll of rolls) {
    await roll.evaluate({ async: true });
    roll.tooltip = await roll.getTooltip();
  }
  const template = await renderTemplate(SKILL_TEMPLATE, {
    target: actor,
    speaker: speaker,
    isPrivate: isPrivate,
    item: item.system,
    rolls: rolls,
  });
  await ChatMessage.create({
    speaker: speaker,
    rolls: rolls,
    content: template,
  });
}
