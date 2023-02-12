

export class LHTrpgCombat extends Combat {
	/**
	 * @override
	 * Roll initiative for one or multiple Combatants within the Combat entity
	 * @param ids A Combatant id or Array of ids for which to roll
	 * @returns A promise which resolves to the updated Combat entity once updates are complete.
	 */
	async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {

		// Structure input data
		ids = typeof ids === "string" ? [ids] : ids;
		const currentId = this.combatant?.id;
		let combatantUpdates = [];

		for (const id of ids) {
			// Get Combatant data
			const c = this.combatants.get(id, { strict: true });

			let Init;
			if (c.actor.type === 'character') {
				Init = c.actor.system['battle-status'].initiative.total ?? 0;
			}
			else {
				Init = c.actor.system['battle-status'].initiative ?? 0;
			}

			//Do not roll for defeated combatants
			if (c.defeated) continue;

			if (c.actor.type === 'character') {
				Init += 0.1;
			}

			// Draw initiative
			combatantUpdates.push({
				_id: c.id,
				initiative: Init
			});
		}

		// Ensure the turn order remains with the same combatant
		if (updateTurn && currentId) {
			await this.update({ turn: this.turns.findIndex(t => t.id === currentId) });
		}

		// Update multiple combatants
		await this.updateEmbeddedDocuments('Combatant', combatantUpdates);

		// Return the updated Combat
		return this;

	}

	/**
	 * @override
	 * Begin the combat encounter, advancing to round 1 and turn 1
	 * @returns {Promise<Combat>}
	 */
	async startCombat() {
		let ids = [];

		this.combatants.forEach(combatant => {
			ids.push(combatant.id);
		});

		super.startCombat();

		await this.rollInitiative(ids);
		await this._resetHate();
	}

	/**
   * Display a dialog querying the GM whether they wish to end the combat encounter and empty the tracker
   * @returns {Promise<Combat>}
   */
	async endCombat() {
		return Dialog.confirm({
			title: game.i18n.localize("COMBAT.EndTitle"),
			content: `<p>${game.i18n.localize("COMBAT.EndConfirmation")}</p>`,
			yes: async () => {
				this.delete();
				await this._resetHate();
			}
		});
	}

	/**
	 * @override
	 * Advance the combat to the next round
	 * @returns {Promise<Combat>}
	 */
	async nextRound() {

		let ids = [];

		this.combatants.forEach(combatant => {
			ids.push(combatant.id);
		});

		await super.nextRound();

		for (let combatant of this.combatants){
			await this._checkEffects(combatant);
		};

		await this.rollInitiative(ids);
	}

	/**
	 * @override
	 * Rewind the combat to the previous round
	 * @returns {Promise<Combat>}
	 */
	async previousRound() {
		let ids = [];

		this.combatants.forEach(combatant => {
			ids.push(combatant.id);
		});

		await super.previousRound();

		for (let combatant of this.combatants){
			await this._checkEffects(combatant);
		};

		await this.rollInitiative(ids);
	}

			/**
	 * @override
	 * Rewind the combat to the next turn
	 * @returns {Promise<Combat>}
	 */
			async nextTurn() {
				let ids = [];
		
				this.combatants.forEach(combatant => {
					ids.push(combatant.id);
				});""
		
				await super.nextTurn();
		
				for (let combatant of this.combatants){
					await this._checkEffects(combatant);
				};
			}

		/**
	 * @override
	 * Rewind the combat to the previous turn
	 * @returns {Promise<Combat>}
	 */
		async previousTurn() {
			let ids = [];
	
			this.combatants.forEach(combatant => {
				ids.push(combatant.id);
			});
	
			await super.previousTurn();
	
			for (let combatant of this.combatants){
				await this._checkEffects(combatant);
			};
		}

	async _resetHate(){
		for (let combatant of this.combatants) {

			if (combatant.actor.type === "character") {
				let actor = game.actors.get(combatant.actorId);
				await actor.update({ "system.infos.hate": 0 });
			}
		};
	}

	async _checkEffects(combatant) {
		if(combatant.actor.type === "character"){
			let actor = game.actors.get(combatant.actorId);

			for(let effect of actor.effects){
				effect.determineSuppressionCombat();

				console.log(effect);
			}
		}
	}

}