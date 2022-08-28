

export class LHTrpgCombat extends Combat {
        /**
         * @override
         * Roll initiative for one or multiple Combatants within the Combat entity
         * @param ids A Combatant id or Array of ids for which to roll
         * @returns A promise which resolves to the updated Combat entity once updates are complete.
         */
        async rollInitiative(ids) {

                let combatantUpdates = [];
                for (const id of ids) {
                        // Get Combatant data
                        const c = this.combatants.get(id, { strict: true });
                        let Init = c.actor.data.data['battle-status'].initiative;

                        console.log(c.actor);
                        //Do not roll for defeated combatants
                        if (c.data.defeated) continue;

                        if(c.actor.type === 'character') {
                                Init += 0.1;
                        }

                        // Draw initiative
                        combatantUpdates.push({
                                _id: c.id,
                                initiative: Init
                        });
                }

                // Update multiple combatants
                await this.updateEmbeddedDocuments('Combatant', combatantUpdates);

                // Return the updated Combat
                return this;

        }
}