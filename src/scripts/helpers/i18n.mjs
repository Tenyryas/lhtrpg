export const I18N = {
  skill: {
    check: {
      none: "LHTRPG.Skill.Check.none",
      automatic: "LHTRPG.Skill.Check.automatic",
      evasion: "LHTRPG.Skill.Check.evasion",
      resistance: "LHTRPG.Skill.Check.resistance",
    },
  },
};

export function localizeCheck(check) {
  if (check?.value) {
    check.label = game.i18n.localize(I18N.skill.check[check.value]);
  }
}
