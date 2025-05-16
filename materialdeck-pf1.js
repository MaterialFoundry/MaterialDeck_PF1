import { tokenAction } from "./actions/token.js";
import { otherAction } from "./actions/other.js";
import { combatTrackerAction } from "./actions/combatTracker.js";
import { Helpers } from "./helpers.js";

export const documentation = "https://materialfoundry.github.io/MaterialDeck_PF1/";

Hooks.once('MaterialDeck_Ready', () => {
    Helpers.rollModifier = new game.materialDeck.Helpers.ModeSwitcher('normal', 'mdUpdateRollModifier');
    
    const moduleData = game.modules.get('materialdeck-pf1');

    game.materialDeck.registerSystem({
        systemId: 'pf1',
        moduleId: 'materialdeck-pf1',
        systemName: 'Pathfinder 1',
        version: moduleData.version,
        manifest: moduleData.manifest,
        documentation, 
        actions: [
            tokenAction,
            otherAction,
            combatTrackerAction
        ]
    });
});