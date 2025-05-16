import { Helpers } from "../../helpers.js";

const localize = Helpers.localize;

function getDocs(path, action="token") {
    return Helpers.getDocumentationUrl(path, action);
}

let inventoryOffset = 0;

export const inventoryMode = {

    updateAll: function() {
        for (let device of game.materialDeck.streamDeck.deviceManager.devices) {
            for (let button of device.buttons.buttons) {
                if (game.materialDeck.Helpers.getButtonAction(button) !== 'token') continue;
                if (game.materialDeck.Helpers.getButtonSettings(button).mode !== 'inventory') continue;
                button.update('md-pf1.updateAllTokenInventory')
            }
        }
    },

    getActions: function(settings) {
        let actions = { update: [], keyDown: [], keyUp: [], hold: [] };
        const holdTime = game.materialDeck.holdTime;

        const inventorySettings = settings.inventoryMode;

        if (inventorySettings.mode === 'offset') {
            actions.update.push({
                run: this.onOffsetUpdate
            });
            actions.keyDown.push({
                run: this.onOffsetKeydown
            })
        }

        else if (inventorySettings.mode === 'setSyncFilter') {
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
                run: this.onInventoryUpdate,
                on: ['updateItem', 'refreshToken']
            });
            
            const onPress = inventorySettings.keyUp.mode;
            const onHold = inventorySettings.hold.mode;
            
            if (onPress === 'useItem') {
                actions.keyUp.push({
                    run: this.onKeypressUseItem,
                    stopOnHold: true
                });
            }
            if (onHold === 'useItem') {
                actions.hold.push({
                    run: this.onKeypressUseItem,
                    delay: holdTime
                });
            }

            if (onPress === 'equip') {
                actions.keyUp.push({
                    run: this.onKeypressEquip,
                    stopOnHold: true
                });
            }
            if (onHold === 'equip') {
                actions.hold.push({
                    run: this.onKeypressEquip,
                    delay: holdTime
                });
            }
        }

        
        return actions;
    },

    onOffsetUpdate: function(data) {
        const settings = data.settings.inventoryMode.offset;
        let icon = '';
        if (data.settings.display.inventoryMode.offsetIcon) {
            if (settings.mode === 'set' || settings.value == 0) icon = 'fas fa-arrow-right-to-bracket';
            else if (settings.value > 0) icon = 'fas fa-arrow-right';
            else if (settings.value < 0) icon = 'fas fa-arrow-left';
        }
        
        return {
            icon,
            text: data.settings.display.inventoryMode.offset ? inventoryOffset : '',
            options: {
                border: true,
                borderColor: (settings.mode === 'set' && inventoryOffset == parseInt(settings.value)) ? data.settings.colors.system.on : data.settings.colors.system.off
            }
        }
    },

    onOffsetKeydown: function(data) {
        const settings = data.settings.inventoryMode.offset;
        if (settings.mode === 'set') inventoryOffset = parseInt(settings.value);
        else if (settings.mode === 'increment') inventoryOffset += parseInt(settings.value);

        inventoryMode.updateAll();
    },

    onSetSyncFilterUpdate: function(data) {
        const mode = data.settings.inventoryMode.setSync.mode;
        const displaySettings = data.settings.display.inventoryMode.setSync;
        
        let text = displaySettings.name ? getItemTypes().find(t => t.value === mode)?.label : '';
        const thisSelected = game.materialDeck.Helpers.isSynced(data.settings.inventoryMode.setSync, 'inventoryMode.syncFilter', 'inventoryMode.',  'token');

        return {
            text,
            options: {
                border: true,
                borderColor: thisSelected ? data.settings.colors.system.on : data.settings.colors.system.off
            }
        }
        
    },

    onSetSyncFilterKeydown: function(data) {
        const settings = data.settings.inventoryMode.setSync;

        let syncedSettings = [
            { key: 'inventoryMode.mode', value: settings.mode },
            { key: 'inventoryMode.selection.filter.equipped', value: settings.selection.filter.equipped },
            { key: 'inventoryMode.selection.filter.unequipped', value: settings.selection.filter.unequipped },
            { key: 'inventoryMode.selection.filter.identified', value: settings.selection.filter.identified },
            { key: 'inventoryMode.selection.filter.unidentified', value: settings.selection.filter.unidentified },
            { key: 'inventoryMode.selection.filter.carried', value: settings.selection.filter.carried },
            { key: 'inventoryMode.selection.filter.notCarried', value: settings.selection.filter.notCarried },
        ]

        data.button.sendData({
            type: 'setPageSync',
            payload: {
                context: data.button.context,
                device: data.button.device.id,
                action: 'token',
                sync: 'inventoryMode.syncFilter',
                settings: syncedSettings
            }
        })
    },

    onInventoryUpdate: function(data) {
        if (!data.actor) return;
        const settings = data.settings.inventoryMode;
        const item = getItem(data.actor, settings);
        if (!item) return;

        if (data.hooks === 'updateItem' && data.args[0].id !== item.id) return 'doNothing';
        if (data.hooks === 'refreshToken' && data.args[0].id !== token.id) return 'doNothing';
        
        let text = "";
        let options = {};

        const displaySettings = data.settings.display.inventoryMode;
        if (displaySettings.name) text = item.name;

        if (displaySettings.box === 'quantity') options.uses = { available: item.system.quantity, box: true }; 
        else if (displaySettings.box === 'uses') options.uses = { available: item.system.uses?.value, maximum: item.system.uses?.max, box: true };

        if (settings.keyUp.mode === 'equip') {
            options.border = true;
            options.borderColor = item.system.equipped ? data.settings.colors.system.on : data.settings.colors.system.off
        }

        return {
            text, 
            icon: displaySettings.icon ? item.img : '', 
            options
        };
    },

    onKeypressUseItem: function(data) {
        if (!data.actor) return;
        const settings = data.settings.inventoryMode;
        const onPressSettings = settings[data.actionType];
        const item = getItem(data.actor, settings);
        if (!item) return;

        item.use({
            skipDialog: !onPressSettings.showDialog
        });
    },

    onKeypressEquip: function(data) {
        if (!data.actor) return;
        const settings = data.settings.inventoryMode;
        const mode = settings[data.actionType].equip.mode;
        const item = getItem(data.actor, settings);
        if (!item) return;
        
        if (mode === 'toggle') item.update({"system.equipped": !item.system.equipped});
        else if (mode === 'equip') item.update({"system.equipped": true});
        else if (mode === 'unequip') item.update({"system.equipped": false});
    },

    getSelectionSettings(type='', sync='inventoryMode.syncFilter') {

        let modeOptions = [];
        if (type === '') 
            modeOptions = [ 
                { label: localize("DOCUMENT.Item", "ALL"), children: getItemTypes()},
                { value: 'setSyncFilter', label: localize('SetTypeAndFilterSync') },
                { value: 'offset', label: localize('Offset', 'MD') }
            ]
        else modeOptions = getItemTypes()

        return [{
            label: localize('ItemType'),
            id: `inventoryMode${type}.mode`,
            type: "select",
            default: "any",
            link: getDocs('#inventory-mode'),
            sync,
            options: modeOptions
        },{
            label: localize("SelectionFilter"),
            id: `inventoryMode${type}-selectionFilter-table`,
            type: "table",
            visibility: { 
                hideOn: [ 
                    { [`inventoryMode.mode`]: "offset" },
                    { [`inventoryMode.mode`]: type === "" ? "setSyncFilter" : "" } 
                ] 
            },
            columns: 
            [
                { label: localize('Equipped', 'PF1') },
                { label: localize('Unequipped') }
            ],
            rows: 
            [
                [
                    { 
                        id: `inventoryMode${type}.selection.filter.equipped`,
                        type: "checkbox",
                        sync,
                        default: true
                    },{ 
                        id: `inventoryMode${type}.selection.filter.unequipped`,
                        type: "checkbox",
                        sync,
                        default: true
                    }
                ],[
                    { 
                        label: localize('Identified', 'PF1'),
                        type: 'label',
                        font: 'bold'
                    },{ 
                        label: localize('Unidentified', 'PF1'),
                        type: 'label',
                        font: 'bold'
                    }
                ],[
                    { 
                        id: `inventoryMode${type}.selection.filter.identified`,
                        type: "checkbox",
                        sync,
                        default: true
                    },{ 
                        id: `inventoryMode${type}.selection.filter.unidentified`,
                        type: "checkbox",
                        sync,
                        default: true
                    }
                ],[
                    { 
                        label: localize('Carried', 'PF1'),
                        type: 'label',
                        font: 'bold'
                    },{ 
                        label: localize('NotCarried'),
                        type: 'label',
                        font: 'bold'
                    }
                ],[
                    { 
                        id: `inventoryMode${type}.selection.filter.carried`,
                        type: "checkbox",
                        sync,
                        default: true
                    },{ 
                        id: `inventoryMode${type}.selection.filter.notCarried`,
                        type: "checkbox",
                        sync,
                        default: true
                    }
                ]
            ]
        }]
    },

    getSettings: function() {
        return [
            ...inventoryMode.getSelectionSettings(),
            {
                label: localize('SyncTypeAndFilter'),
                id: 'inventoryMode.syncFilter',
                type: 'checkbox',
                link: getDocs('#synced-settings'),
                indent: true,
                visibility: { 
                    hideOn: [ 
                        { [`inventoryMode.mode`]: "offset" },
                        { [`inventoryMode.mode`]: "setSyncFilter" } 
                    ] 
                },
            },{
                id: `inventoryMode-item-wrapper`,
                type: "wrapper",
                visibility: { 
                    hideOn: [ 
                        { [`inventoryMode.mode`]: "offset" },
                        { [`inventoryMode.mode`]: "setSyncFilter" } 
                    ] 
                },
                settings:
                [
                    {
                        label: localize('Selection', 'MD'),
                        id: "inventoryMode.selection.mode",
                        type: "select",
                        default: "nr",
                        options: [
                            {value:'nr', label: localize('SelectByNr', 'MD')},
                            {value:'nameId', label: localize('SelectByName/Id', 'MD')}
                        ]
                    },{
                        label: localize("Order"),
                        id: "inventoryMode.selection.order",
                        type: "select",
                        indent: true,
                        options: [
                            {value:'order', label: localize('CharacterSheet')},
                            {value:'name', label: localize('Alphabetically')}
                        ],
                        visibility: { showOn: [ { ["inventoryMode.selection.mode"]: "nr" } ] }
                    },{
                        label: localize("Nr", "MD"),
                        id: "inventoryMode.selection.nr",
                        type: "number",
                        default: "1",
                        indent: true,
                        visibility: { showOn: [ { ['inventoryMode.selection.mode']: "nr" } ] }
                    },{
                        label: localize("Name/Id", "MD"),
                        id: "inventoryMode.selection.nameId",
                        type: "textbox",
                        indent: true,
                        visibility: { showOn: [ { ['inventoryMode.selection.mode']: "nameId" } ] }
                    },{
                        type: "line-right"
                    },
                    ...getItemOnPressSettings(),{
                        type: "line-right"
                    },
                    ...getItemOnPressSettings('hold'),
                    {
                        type: "line-right"
                    },{
                        label: localize("Display", "MD"),
                        id: "inventoryMode-display-table",
                        type: "table",
                        columnVisibility: [
                            true,
                            true,
                            true
                        ],
                        columns: 
                        [
                            { label: localize("Icon", "MD") },
                            { label: localize("Name", "ALL") },
                            { label: localize("Box", "MD") }
                        ],
                        rows: 
                        [
                            [
                                {
                                    id: "display.inventoryMode.icon",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.inventoryMode.name",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.inventoryMode.box",
                                    type: "select",
                                    default: "none",
                                    options: [
                                        { value: 'none', label: localize('None', "ALL") },
                                        { value: 'quantity', label: localize('Quantity', 'PF1') },
                                        { value: 'uses', label: localize('ChargePlural', 'PF1') }
                                    ]
                                }
                            ]
                        ]
                    }
                ]
            },{
                id: `inventoryMode-offset-wrapper`,
                type: "wrapper",
                visibility: { showOn: [ { [`inventoryMode.mode`]: "offset" } ] },
                settings:
                [
                    {
                        type: "line-right"
                    },{
                        label: localize("Offset", "MD"),
                        id: "inventoryMode.offset.mode",
                        type: "select",
                        link: getDocs('#offset'),
                        options: [
                            { value: "set", label: localize("SetToValue", "MD") },
                            { value: "increment", label: localize("IncreaseDecrease", "MD") }
                        ]
                    },{
                        label: localize("Value", "PF1"),
                        id: "inventoryMode.offset.value",
                        type: "number",
                        step: "1",
                        default: "0",
                        indent: true
                    },{
                        type: "line-right"
                    },{
                        label: localize("Display", "MD"),
                        id: "inventoryMode-offset-display-table",
                        type: "table",
                        columns: 
                        [
                            { label: localize("Icon", "MD") },
                            { label: localize("Offset", "MD") }
                        ],
                        rows: 
                        [
                            [
                                {
                                    id: "display.inventoryMode.offsetIcon",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.inventoryMode.offset",
                                    type: "checkbox",
                                    default: true
                                }
                            ]
                        ]
                    }
                ]
            },{
                id: `inventoryMode-setSync-wrapper`,
                type: "wrapper",
                indent: "true",
                visibility: { showOn: [ { [`inventoryMode.mode`]: "setSyncFilter" } ] },
                settings: [
                    ...inventoryMode.getSelectionSettings('.setSync', undefined),
                    {
                        label: localize("Display", "MD"),
                        id: "inventoryMode-setSync-display-table",
                        type: "table",
                        columns: 
                        [
                            { label: localize("Name", "ALL") }
                        ],
                        rows: 
                        [
                            [
                                {
                                    id: "display.inventoryMode.setSync.name",
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

function getItemTypes() {
    return [
        {value: 'any', label: Helpers.localize('Any', 'MD') },
        {value: 'weapon', label: Helpers.localize('InventoryWeapons', 'PF1') },
        {value: 'armor', label: Helpers.localize('ArmorOrShield', 'PF1')},
        {value: 'equipment', label: Helpers.localize('InventoryEquipment', 'PF1') },
        {value: 'consumable', label: Helpers.localize('InventoryConsumables', 'PF1') },
        {value: 'gear', label: Helpers.localize('Subtypes.Item.loot.gear.Plural', 'PF1') },
        {value: 'ammo', label: Helpers.localize('Subtypes.Item.loot.ammo.Plural', 'PF1') },
        {value: 'misc', label: Helpers.localize('Subtypes.Item.loot.misc.Plural', 'PF1') },
        {value: 'tradeGoods', label: Helpers.localize('Subtypes.Item.loot.tradeGoods.Plural', 'PF1') },
        {value: 'container', label: Helpers.localize('InventoryContainers', 'PF1') }
    ]
}

function getItem(actor, settings) {
    let items = [];

    //Filter items
    const filter = settings.selection.filter;
    if (filter.equipped) items.push(...actor.items.filter(i => i.system.equipped === true));
    if (filter.unequipped) items.push(...actor.items.filter(i => i.system.equipped === false));
    if (filter.identified && !filter.unidentified) items = items.filter(i => i.system.identified);
    else if (!filter.identified && filter.unidentified) items = items.filter(i => i.system.identified === false);
    else if (!filter.identified && !filter.unidentified) items = items.filter(i => i.system.identified === undefined);
    if (filter.carried && !filter.notCarried) items = items.filter(i => i.system.carried);
    else if (!filter.carried && filter.notCarried) items = items.filter(i => i.system.carried === false);
    else if (!filter.carried && !filter.notCarried) items = items.filter(i => i.system.carried === undefined);

    if (settings.mode === 'any') {}
    else if (settings.mode === 'armor')
        items = items.filter(i => i.type === 'equipment' && (i.system.subType === 'armor' || i.system.subType === 'shield'));
    else if (settings.mode === 'equipment')
        items = items.filter(i => i.type === 'equipment' && i.system.subType !== 'armor' && i.system.subType !== 'shield');
    else if (settings.mode === 'gear')
        items = items.filter(i => i.type === 'loot' && i.system.subType !== 'ammo' && i.system.subType !== 'misc' && i.system.subType !== 'tradeGoods');
    else
        items = items.filter(i => i.type === settings.mode || i.system.subType === settings.mode);

    items = game.materialDeck.Helpers.sort(items, settings.selection.order);

    if (!items || items.length === 0) return;

    let item;
    if (settings.selection.mode === 'nr') {
        let itemNr = parseInt(settings.selection.nr) - 1 + inventoryOffset;
        item = items[itemNr];
    }
    else if (settings.selection.mode === 'nameId') {
        item = items.find(i => i.id === settings.selection.nameId.split('.').pop());
        if (!item) item = items.find(i => i.name === settings.selection.nameId);
        if (!item) item = items.find(i => game.materialDeck.Helpers.stringIncludes(i.name, settings.selection.nameId));
    }
    return item;
}

function getItemOnPressSettings(type='keyUp') {
    return [
        {
            label: localize(type=='keyUp' ? 'OnPress' : 'OnHold', 'MD'),
            id: `inventoryMode.${type}.mode`,
            type: "select",
            link: getDocs("#use-item"),
            options: [
                { value: 'doNothing', label: localize('DoNothing', 'MD') },
                { value: 'useItem', label: localize('Use', 'PF1') },
                { value: 'equip', label: localize('Equip') }
            ]
        },{
            id: `inventoryMode-${type}-useItem-wrapper`,
            type: "wrapper",
            indent: true,
            visibility: { showOn: [ { [`inventoryMode.${type}.mode`]: "useItem" } ] },
            settings:
            [
                {
                    label: localize('ShowDialog'),
                    id: `inventoryMode.${type}.showDialog`,
                    type: 'checkbox',
                    default: true
                }
            ]
        },{
            label: localize("Mode", "MD"),
            id: `inventoryMode.${type}.equip.mode`,
            type: "select",
            indent: true,
            visibility: { showOn: [ { [`inventoryMode.${type}.mode`]: "equip" } ] },
            options: [
                { value: 'toggle', label: localize('Toggle', 'MD') },
                { value: 'equip', label: localize('Equip') },
                { value: 'unequip', label: localize('Unequip') }
            ]
        }
    ]
}