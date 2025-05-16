import { documentation } from "./materialdeck-pf1.js"

export class Helpers {

    static getDocumentationUrl(path, action) {
        let url = `${documentation}/actions/${action}/${path}`;
        return url;
    }
    
    static localize(str, category='', formatData) {
        if (category === '') return game.i18n.format(`MATERIALDECK_PF1.${str}`, formatData);
        else if (category === 'ALL') return game.i18n.format(str, formatData);
        else if (category === 'MD') return game.i18n.format(`MATERIALDECK.${str}`, formatData);
        else if (category === 'PF1') return game.i18n.format(`PF1.${str}`, formatData);
        return game.i18n.format(`MATERIALDECK_PF1.${category}.${str}`, formatData);
    }

    static getImage(name, path=`modules/materialdeck-pf1/img/`) {
        return path + name;
    }

    /**
     * Roll Modifiers
     */
    static rollModifier;

    static getRollModifiers() {
        return [
            { value: 'dialog', label: localize('Dialog') },
            { value: 'normal', label: localize('Normal', 'PF1') },
            { value: 'take10', label: localize('TakeX', 'PF1', {number:10}) },
            { value: 'take20', label: localize('TakeX', 'PF1', {number:20}) }
        ]
    }

    static getRollModifierIcon(type) {
        if (type === 'dialog') return [{icon: 'fas fa-window-maximize', size: 0.9, spacing: {x:0, y:10}}];
        else if (type === 'normal') return [{icon: 'fas fa-dice-d20', size: 0.9, spacing: {x:0, y:10}}];
        else if (type === 'take10') return [{icon: 'fas fa-dice-d20', size: 0.9, spacing: {x:0, y:10}}];
        else if (type === 'take20') return [{icon: 'fas fa-dice-d20', size: 0.9, spacing: {x:0, y:10}}];
    }
}

const localize = Helpers.localize;