/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 * @extends {ActiveEffect}
 */
export class LHTrpgActiveEffect extends ActiveEffect {

    /**
     * Is this active effect currently suppressed?
     * @type {boolean}
     */
    isSuppressed = false;

    /* --------------------------------------------- */

    /** @inheritdoc */
    apply(actor, change) {
        if (this.isSuppressed) return null;

        return super.apply(actor, change);
    }

    /**
     * Determine whether this Active Effect is suppressed or not.
     */
    determineSuppression() {
        this.isSuppressed = false;
        
        if (this.disabled || (this.parent.documentName !== "Actor")) return;
        const [parentType, parentId, documentType, documentId] = this.origin?.split(".") ?? [];
        
        if ((parentType !== "Actor") || (parentId !== this.parent.id) || (documentType !== "Item")) return;
        const item = this.parent.items.get(documentId);

        if (!item) return;
        this.isSuppressed = item.areEffectsSuppressed;
    }

    determineSuppressionCombat() {
        console.log(this.label + ":");
        if (this.disabled || (this.parent.documentName !== "Actor")) return;
        console.log("Remaining: " + this.duration.remaining);

        if (this.duration.type !== "turns") return;
        
        if(this.isExpired)
        {
            console.log("effect suppressed");
            return true;
        }
        else return;

    }

    isExpired() {
        return this.duration.remaining < 1;
    }


}