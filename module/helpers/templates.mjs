/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/lhtrpg/templates/actor/parts/actor-stats.html",
    "systems/lhtrpg/templates/actor/parts/actor-effects.html",

    //Items partials
    "systems/lhtrpg/templates/item/parts/item-effects.html",
  ]);
};
