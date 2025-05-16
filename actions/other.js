import { Helpers } from "../helpers.js";

const localize = Helpers.localize;

function getDocs(path, action="otherActions") {
    return Helpers.getDocumentationUrl(path, action);
}

export const otherAction = {

    id: 'other',

    buttonActions: function(settings) {
        let actions = { update: [], keyDown: [], keyUp: [] };

        if (settings.function === 'rollModifier') {
            actions.update.push({
                run: this.onUpdateRollModifiers,
                on: ['mdUpdateRollModifier']
            })
            actions.keyDown.push({
                run: this.onKeypressRollModifiers
            }) 
        }
        return actions;
    },

    onUpdateRollModifiers: function(data) {
        const mode = data.settings.rollModifier.mode;

        return {
            text: data.settings.display.modeName ? Helpers.getRollModifiers().find(a => a.value === mode)?.label : '',
            icon: data.settings.display.icon ? Helpers.getRollModifierIcon(mode) : "",
            options: {
                border: true,
                borderColor: Helpers.rollModifier.get() === mode ? data.settings.colors.rollModeOn : data.settings.colors.rollModeOff,
            }
        };
    },

    onKeypressRollModifiers: function(data) {
        Helpers.rollModifier.set(data.settings.rollModifier.mode, data.settings.rollModifier.reset);
    },

    settingsConfig: function() {
        return [
            {
                id: "function",
                link: "",
                appendOptions: [
                    { value: 'rollModifier', label: localize('SetDefaultRollModifier') }
                ]
            },{
                id: `rollModifier-wrapper`,
                type: "wrapper",
                indent: true,
                before: "pause.mode",
                visibility: { showOn: [{ function: "rollModifier" }]},
                settings:[
                    {
                        id: "rollModifier.mode",
                        label: localize('Modifier'),
                        link: "",
                        type: "select",
                        options: Helpers.getRollModifiers()
                        ,
                    },{
                        id: "rollModifier.reset",
                        label: localize('SetAfterUseTo'),
                        link: "",
                        type: "select",
                        indent: true,
                        sync: "rollModifier.pageWide",
                        options: [
                            { value: 'none', label: localize('DoNotChange') },
                            ...Helpers.getRollModifiers()
                        ]
                    },{
                        label: '',
                        id: "rollModifier.pageWide",
                        type: "checkbox",
                        default: true,
                        visibility: false
                    }
                ]
            },{
                id: "display-table",
                prependColumnVisibility: [
                    { 
                        showOn: [ 
                            { function: "rollModifier" }
                        ]
                    }
                ],
                prependColumns: [
                    {
                        label: localize("Name", "ALL"),
                    }
                ],
                prependRows: [
                    [
                        {
                            id: "display.modeName",
                            type: "checkbox",
                            default: true
                        }
                    ]
                ]
            },{
                id: "colors-table",
                prependColumnVisibility: [
                    { 
                        showOn: [ 
                            { function: "rollModifier" }
                        ]
                    },{ 
                        showOn: [ 
                            { function: "rollModifier" }
                        ]
                    }
                ],
                prependColumns: [
                    {
                        label: localize("OnColor", "MD"),
                    },{
                        label: localize("OffColor", "MD"),
                    }
                ],
                prependRows: [
                    [
                        {
                            id: "colors.rollModeOn",
                            type: "color",
                            default: "#FFFF00"
                        },{
                            id: "colors.rollModeOff",
                            type: "color",
                            default: "#000000"
                        }
                    ]
                ]
            }
        ]
    }
}