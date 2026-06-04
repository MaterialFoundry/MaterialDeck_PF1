import { Helpers } from "../../helpers.js";

const localize = Helpers.localize;

function getDocs(path, action="token") {
    return Helpers.getDocumentationUrl(path, action);
}

let spellbookOffset = 0;

export const spellbookMode = {

    updateAll: function() {
        for (let device of game.materialDeck.streamDeck.deviceManager.devices) {
            for (let button of device.buttons.buttons) {
                if (game.materialDeck.Helpers.getButtonAction(button) !== 'token') continue;
                if (game.materialDeck.Helpers.getButtonSettings(button).mode !== 'spellbook') continue;
                button.update('md-pf1.updateAllTokenSpellbook')
            }
        }
    },

    getActions: function(settings) {
        let actions = { update: [], keyDown: [], keyUp: [], hold: [] };
        const holdTime = game.materialDeck.holdTime;

        const spellbookSettings = settings.spellbookMode;

        if (spellbookSettings.mode === 'offset') {
            actions.update.push({
                run: this.onOffsetUpdate
            });
            actions.keyDown.push({
                run: this.onOffsetKeydown
            })
        }

        else if (spellbookSettings.mode === 'setSyncFilter') {
            actions.update.push({
                run: this.onSetSyncFilterUpdate,
                on: ['md-token-PageSettingChanged']
            });
            actions.keyDown.push({
                run: this.onSetSyncFilterKeydown
            })
        }

        else {
            actions.update.push({
                run: this.onSpellbookUpdate,
                on: ['updateItem', 'refreshToken']
            });

            const onPress = spellbookSettings.keyUp.mode;
            const onHold = spellbookSettings.hold.mode;

            if (onPress === 'castSpell') {
                actions.keyUp.push({
                    run: this.onCastSpellKeyDown,
                    stopOnHold: true
                });
            }
            if (onHold === 'castSpell') {
                actions.hold.push({
                    run: this.onCastSpellKeyDown,
                    delay: holdTime
                });
            }
        }

        return actions;
    },

    onOffsetUpdate: function(data) {
        const settings = data.settings.spellbookMode.offset;
        let icon = '';
        if (data.settings.display.spellbookMode.offsetIcon) {
            if (settings.mode === 'set' || settings.value == 0) icon = 'fas fa-arrow-right-to-bracket';
            else if (settings.value > 0) icon = 'fas fa-arrow-right';
            else if (settings.value < 0) icon = 'fas fa-arrow-left';
        }
        
        return {
            icon,
            text: data.settings.display.spellbookMode.offset ? spellbookOffset : '',
            options: {
                border: true,
                borderColor: (settings.mode === 'set' && spellbookOffset == parseInt(settings.value)) ? data.settings.colors.system.on : data.settings.colors.system.off
            }
        }
    },

    onOffsetKeydown: function(data) {
        const settings = data.settings.spellbookMode.offset;
        if (settings.mode === 'set') spellbookOffset = parseInt(settings.value);
        else if (settings.mode === 'increment') spellbookOffset += parseInt(settings.value);

        spellbookMode.updateAll();
    },

    onSetSyncFilterUpdate: function(data) {
        const mode = data.settings.spellbookMode.setSync.mode;
        const displaySettings = data.settings.display.spellbookMode.setSync;
        
        let text = displaySettings.name ? getSpellTypes(true).find(t => t.value === mode)?.label : '';
        const thisSelected = game.materialDeck.Helpers.isSynced(data.settings.spellbookMode.setSync, 'spellbookMode.syncFilter', 'spellbookMode.',  'token');

        return {
            text,
            options: {
                border: true,
                borderColor: thisSelected ? data.settings.colors.system.on : data.settings.colors.system.off
            }
        }
        
    },

    onSetSyncFilterKeydown: function(data) {
        const settings = data.settings.spellbookMode.setSync;

        let syncedSettings = [
            { key: 'spellbookMode.mode', value: settings.mode }
        ]

        data.button.sendData({
            type: 'setPageSync',
            payload: {
                context: data.button.context,
                device: data.button.device.id,
                action: 'token',
                sync: 'spellbookMode.syncFilter',
                settings: syncedSettings
            }
        })
    },

    onSpellbookUpdate: function(data) {
        const settings = data.settings.spellbookMode;
        const spell = getSpellbook(data.actor, settings);
       
        if (data.hooks === 'updateItem' && data.args[0].id !== spell.id) return 'doNothing';
        if (data.hooks === 'refreshToken' && data.args[0].id !== token.id) return 'doNothing';

        if (!spell) return;

        const spellbook = data.actor.system.attributes.spells.spellbooks[spell.system.spellbook]
        
        const slots = spell.system.preparation;

        const displaySettings = data.settings.display.spellbookMode;
        
        return {
            text: displaySettings.name ? spell.name : '', 
            icon: displaySettings.icon ? spell.img : '', 
            options: displaySettings.slots ? { uses: { available: slots?.value, maximum: slots?.max, box: slots?.max }} : undefined
        };
    },

    onCastSpellKeyDown: function(data) {
        if (!data.actor) return;
        const settings = data.settings.spellbookMode;
        const onPressSettings = settings[data.actionType];
        const spell = getSpellbook(data.actor, settings);
        if (!spell) return;
        spell.use({
            skipDialog: !onPressSettings.showDialog
        });
    },

    getSelectionSettings(type='', sync='spellbookMode.syncFilter') {
        let modeOptions = [];
        if (type === '') 
            modeOptions = [ 
                { label: localize("Level", "PF1"), children: [
                    { value: 'any', label: localize("Any", "MD") },
                    ...getSpellTypes(true)
                ] },
                { value: 'setSyncFilter', label: localize('SetTypeSync') },
                { value: 'offset', label: localize('Offset', 'MD') }
            ]
        else modeOptions = getSpellTypes(true)

        return [{
            label: localize('SpellType'),
            id: `spellbookMode${type}.mode`,
            type: "select",
            default: "any",
            link: getDocs('#spellbook-mode'),
            sync,
            options: modeOptions
        }]
    },

    getSettings() {
        return [
            ...spellbookMode.getSelectionSettings(),
            {
                id: `spellbookMode-spell-wrapper`,
                type: "wrapper",
                visibility: { 
                    hideOn: [ 
                        { [`spellbookMode.mode`]: "offset" },
                        { [`spellbookMode.mode`]: "setSyncFilter" } 
                    ] 
                },
                settings: [
                    {
                        label: localize('SyncType'),
                        id: 'spellbookMode.syncFilter',
                        type: 'checkbox',
                        link: getDocs('#synced-settings'),
                        indent: true
                    },{
                        label: localize('Selection', 'MD'),
                        id: "spellbookMode.selection.mode",
                        type: "select",
                        default: "nr",
                        options: [
                            {value:'nr', label: localize('SelectByNr', 'MD')},
                            {value:'nameId', label: localize('SelectByName/Id', 'MD')}
                        ]
                    },{
                        label: localize("Order"),
                        id: "spellbookMode.selection.order",
                        type: "select",
                        indent: true,
                        options: [
                            {value:'charSheet', label: localize('CharacterSheet')},
                            {value:'name', label: localize('Alphabetically')}
                        ],
                        visibility: { showOn: [ { ["spellbookMode.selection.mode"]: "nr" } ] }
                    },{
                        label: localize("Nr", "MD"),
                        id: "spellbookMode.selection.nr",
                        type: "number",
                        default: "1",
                        indent: true,
                        visibility: { showOn: [ { ["spellbookMode.selection.mode"]: "nr" } ] }
                    },{
                        label: localize("Name/Id", "MD"),
                        id: "spellbookMode.selection.nameId",
                        type: "textbox",
                        indent: true,
                        visibility: { showOn: [ { ["spellbookMode.selection.mode"]: "nameId" } ] }
                    },{
                        type: "line-right"
                    },{
                        id: `spellbookMode-item-wrapper`,
                        type: "wrapper",
                        visibility: { hideOn: [ { [`spellbookMode.mode`]: "offset" } ] },
                        settings: [
                            ...getSpellOnPressSettings(),
                            {
                                type: "line-right"
                            },
                            ...getSpellOnPressSettings('hold'),
                            {
                                type: "line-right"
                            },{
                                label: localize("Display", "MD"),
                                id: "spellbookMode-display-table",
                                type: "table",
                                columns: 
                                [
                                    { label: localize("Icon", "MD") },
                                    { label: localize("Name", "ALL") },
                                    { label: localize("SpellSlots") }
                                ],
                                rows: 
                                [
                                    [
                                        {
                                            id: "display.spellbookMode.icon",
                                            type: "checkbox",
                                            default: true
                                        },{
                                            id: "display.spellbookMode.name",
                                            type: "checkbox",
                                            default: true
                                        },{
                                            id: "display.spellbookMode.slots",
                                            type: "checkbox",
                                            default: true
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                ]
            },{
                id: `spellbookMode-offset-wrapper`,
                type: "wrapper",
                visibility: { showOn: [ { [`spellbookMode.mode`]: "offset" } ] },
                settings: [
                    {
                        label: localize("Offset", "MD"),
                        id: "spellbookMode.offset.mode",
                        type: "select",
                        link: getDocs('#offset'),
                        options: [
                            { value: "set", label: localize("SetToValue", "MD") },
                            { value: "increment", label: localize("IncreaseDecrease", "MD") }
                        ]
                    },{
                        label: localize("Value", "PF1"),
                        id: "spellbookMode.offset.value",
                        type: "number",
                        step: "1",
                        default: "0",
                        indent: true
                    },{
                        type: "line-right"
                    },{
                        label: localize("Display", "MD"),
                        id: "spellbookMode-offset-display-table",
                        type: "table",
                        columns: 
                        [
                            { label: localize("ACTIVITY.FIELDS.img.label", "PF1") },
                            { label: localize("Offset", "MD") }
                        ],
                        rows: 
                        [
                            [
                                {
                                    id: "display.spellbookMode.offsetIcon",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.spellbookMode.offset",
                                    type: "checkbox",
                                    default: true
                                }
                            ]
                        ]
                    }
                ]
            },{
                id: `spellbookMode-setSync-wrapper`,
                type: "wrapper",
                indent: "true",
                visibility: { showOn: [ { [`spellbookMode.mode`]: "setSyncFilter" } ] },
                settings: [
                    ...spellbookMode.getSelectionSettings('.setSync', undefined),
                    {
                        label: localize("Display", "MD"),
                        id: "spellbookMode-setSync-display-table",
                        type: "table",
                        columnVisibility: [
                            true,
                            true
                        ],
                        columns: 
                        [
                            { label: localize("Name", "ALL") }
                        ],
                        rows: 
                        [
                            [
                                {
                                    id: "display.spellbookMode.setSync.name",
                                    type: "checkbox",
                                    default: true
                                }
                            ]
                        ]
                    }
                ]
            }
        ]
    }
}

export function getSpellTypes(includeCantrips=false) {
    let spellTypes = [];

    for (let [key, value] of Object.entries(CONFIG.PF1.spellLevels)) {
        if (!includeCantrips && key == 0) continue;
        spellTypes.push({ value: `spell${key}`, label: value })
    }

    return spellTypes;
}

function getSpellbook(actor, settings) {
    if (!actor) return;
    let spells = Array.from(actor.items).filter(i=>i.type === 'spell');
    const filter = settings.selection.filter;

    if (settings.mode !== 'any') spells = spells.filter(s => s.system.level == settings.mode.replace('spell', ''))
    if (filter) {
        for (let k of Object.keys(CONFIG.PF1.spellLevels) ) {   
            if (!filter?.preparation[k]) spells = spells.filter(s => s.system.preparation.mode && s.system.preparation.mode != k)
        }
    }
    
    if (settings.selection.order === 'charSheet') {
        let spellbook = {};

        spells = spells.sort((a, b) => a.sort - b.sort);

        const sections = Object.entries(CONFIG.PF1.spellLevels).reduce((acc, [k, {order}]) => {
            if ( Number.isNumeric(order) ) acc[k] = Number(order);
            return acc;
        }, {});

        for (let spell of spells) {
            const mode = spell.system.preparation.mode || "prepared";
            const level = spell.system.level;
        
            if (mode in sections) {
                if (!spellbook[mode])
                    spellbook[mode] = {type: mode, order: sections[mode], spells: []}
                spellbook[mode].spells.push(spell);
            }
            else {
                if (!spellbook[level])
                    spellbook[level] = {type: level, order: level, spells: []}
                spellbook[level].spells.push(spell);
            }
        }

        spellbook = Object.values(spellbook).sort((a, b) => a.order - b.order);

        spells = [];
        for (let spellMode of spellbook) {
            spells.push(...spellMode.spells)
        }
    }
    else {
        spells = game.materialDeck.Helpers.sort(spells, settings.selection.order);
    }

    let spell;
    if (settings.selection.mode === 'nr') {
        let spellNr = parseInt(settings.selection.nr) - 1 + spellbookOffset;
        spell = spells[spellNr];
    }
    else if (settings.selection.mode === 'nameId') {
        spell = spells.find(i => i.id === settings.selection.nameId.split('.').pop());
        if (!spell) spell = spells.find(i => i.name === settings.selection.nameId);
        if (!spell) spell = spells.find(i => game.materialDeck.Helpers.stringIncludes(i.name,settings.selection.nameId));
    }

    return spell;
}

function getSpellOnPressSettings(type='keyUp') {
    return [
        {
            label: localize(type=='keyUp' ? 'OnPress' : 'OnHold', 'MD'),
            id: `spellbookMode.${type}.mode`,
            type: "select",
            options: [
                { value: 'doNothing', label: localize('DoNothing', 'MD') },
                { value: 'castSpell', label: localize('CastSpell') }
            ]
        },{
            id: `spellbookMode-${type}-castSpell-wrapper`,
            type: "wrapper",
            indent: true,
            visibility: { showOn: [ { [`spellbookMode.${type}.mode`]: "castSpell" } ] },
            settings:
            [
                {
                    label: localize('ShowDialog'),
                    id: `spellbookMode.${type}.showDialog`,
                    type: 'checkbox',
                    default: true
                }
            ]
        }
    ]
}