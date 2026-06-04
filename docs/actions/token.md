# Token Action

The token action has extra features for the `Token` mode, and adds new modes:

* [Token Mode](#token-mode): New `Stats`, `On Press` and `On Hold` options
* [Inventory Mode](#inventory-mode): Display and roll weapons and other items
* [Features Mode](#features-mode): Display and roll actor features
* [Spellbook Mode](#spellbook-mode): Display and roll spells

All modes also have the [Wound Overlay](#wound-overlay) functionality.

## Token Mode
The [Token mode](https://materialfoundry.github.io/MaterialDeck/actions/token/token/#token-mode) has new `Stats`, `On Press` and `On Hold` options.

| Option            | Description   |
|-------------------|---------------|
| Stats             | Stat to display:<br><b>-HP</b><br><b>-Temporary HP</b><br><b>-AC</b><br><b>-Speed</b><br><b>-Initiative</b><br><b>-Hit Dice</b><br><b>-Spellcasting</b>: Spellcasting ability, or spell slots.<br><b>-Currency</b>: All, or a specified type of currency.<br><b>-Encumbrance</b><br><b>-Ability Score</b>: Ability score of a specified ability.<br><b>-Ability Modifier</b>: Ability modifier of a specified ability.<br><b>-Save</b>: Saving throw bonus of a specified ability.<br><b>-Skill Ranks</b>: Skill bonus of a specified skill.<br><b>-Skill Modifier</b>: Modifier score of a specified skill.<br><b>-Experience:</b> Experience points|
| On Press/On Hold  | Sets what to do when the button is pressed/held down:<br><b>-Toggle Condition</b>: Toggle a specified condition or clear all conditions.<br><b>-[Dice Roll](#dice-roll)</b>: Roll a dice for a specified feature. |

### Dice Roll
`Dice Roll` allows you to roll a dice for the selected token/actor.

| Option            | Description   |
|-------------------|---------------|
| Roll             | Type of roll:<br><b>-Initiative</b>: Roll initiative (if in combat).<br><b>-Ability</b>: Roll an ability check.<br><b>-Save</b>: Roll a saving throw.<br><b>-Skill Check</b>: Roll a skill check. |
| Ability<br>(`Ability Check` &<br>`Saving Throw`)           | Ability to roll.    |
| Skill<br>(`Skill Check`) | Skill to roll.   |
| Roll Modifier<br>(All but `Initiative`)   | Roll modifier:<br><b>-Default</b>: Roll using the [default roll modifier](./otherActions.md#set-default-roll-modifier)<br><b>-Normal</b>: Perform a normal roll<br><b>-Take 10</b>: Perform a roll using 'Take 10'<br><b>-Take 20</b>: Perform a roll using 'Take 20'|

## Inventory Mode
The inventory mode can be used to display and control items in the token/actor's inventory.

| Option            | Description   |
|-------------------|---------------|
| Item Type         | <b>-Item</b>: Select the type of item to display, or select 'Any' for all items.<br><b>-[Set Type & Filter Sync](#synced-settings)</b>: Set the synced settings for this page. Will synchronize `Item Type` and `Selection Filter`.<br><b>-[Offset](#offset)</b>: Set item offsets. |
| Selection Filter  | Selects item parameters to filter out, such as unequipped or identified items. |
| Sync Type & Filter | Will [synchronize](#synced-settings) `Item Type` and `Selection Filter` for all buttons on this page with this setting enabled. |
| Selection         | Set how to select the item:<br><b>-Select by Nr</b>: Select an item using a number.<br><b>-Select by Name/Id</b>: Select an item using its name or id. |
| Order<br>(`Select by Nr`) | Sets how to order the items:<br><b>-Character Sheet</b>: Follow the order of the character sheet.<br><b>-Alphabetically</b>: Order items alphabetically.    |
| Nr<br>(`Select by Nr`)    | Number of the item to select. |
| Name/Id<br>(`Select by Name/Id`)  | Name or id of the item to select.  |
| On Press/On Hold  | Sets what to do when the button is pressed/held down:<br><b>-Do Nothing</b>: Do nothing.<br><b>-[Use](#use-item)</b>: Use (roll) the item.<br><b>-Equip</b>: Equip or unequip the item.   |
| Show Dialog<br>(`Use Item`)      | Will show the roll dialog with all (applicable) options, if selected. |
| Mode<br>(`Equip`)    | Configure what to do:<br><b>-Toggle</b>: Toggle between equipping and unequipping item.<br><b>-Equip</b>: Equip item.<br><b>-Unequip</b>: Unequip item.  |
| Display           | <b>-Icon</b>: Display item's icon.<br><b>-Name</b>: Display item's name.<br><b>-Box</b>: Display a box with data. |

## Features Mode
The features mode can be used to display and control token/actor features.

| Option            | Description   |
|-------------------|---------------|
| Features Type         | <b>-Feature</b>: Select the type of feature to display, or select 'Any' for all features.<br><b>-[Set Type Sync](#synced-settings)</b>: Set the synced settings for this page. Will synchronize `Feature Type` and `Feature Type Filter`.<br><b>-[Offset](#offset)</b>: Set feature offsets. |
| Sync Type | Will [synchronize](#synced-settings) `Feature Type` for all buttons on this page with this setting enabled. |
| Selection         | Set how to select the feature:<br><b>-Select by Nr</b>: Select a feature using a number.<br><b>-Select by Name/Id</b>: Select a feature using its name or id. |
| Order<br>(`Select by Nr`) | Sets how to order the features:<br><b>-Character Sheet</b>: Follow the order of the character sheet.<br><b>-Alphabetically</b>: Order features alphabetically.    |
| Nr<br>(`Select by Nr`)    | Number of the feature to select. |
| Name/Id<br>(`Select by Name/Id`)  | Name or id of the feature to select.  |
| Display           | <b>-Icon</b>: Display feature's icon.<br><b>-Name</b>: Display feature's name.<br><b>-Charges</b>: Display the feature's charges. |

## Spellbook Mode
The spellbook mode can be used to display and control token/actor spells.

| Option            | Description   |
|-------------------|---------------|
| Spell Type         | <b>-Level</b>: Select the level of the spell to select from, or select 'Any' for all spells.<br><b>-[Set Type Sync](#synced-settings)</b>: Set the synced settings for this page. Will synchronize `Spell Type`.<br><b>-[Offset](#offset)</b>: Set item offsets. |
| Sync Type | Will [synchronize](#synced-settings) `Spell Type` for all buttons on this page with this setting enabled. |
| Selection         | Set how to select the spell:<br><b>-Select by Nr</b>: Select a spell using a number.<br><b>-Select by Name/Id</b>: Select a spell using its name or id. |
| Order<br>(`Select by Nr`) | Sets how to order the spells:<br><b>-Character Sheet</b>: Follow the order of the character sheet.<br><b>-Alphabetically</b>: Order spells alphabetically.    |
| Nr<br>(`Select by Nr`)    | Number of the spell to select. |
| Name/Id<br>(`Select by Name/Id`)  | Name or id of the spell to select.  |
| Display           | <b>-Icon</b>: Display spell's icon.<br><b>-Name</b>: Display spell's name.<br><b>-Slots</b>: Display the spell's slots. |

## Synced Settings
You can synchronize setting across multiple buttons on the same page, where a page is all the buttons that are currently visible on the device.<br>
If two buttons have `Sync Type & Filter` selected, and you change one of the filter settings on one, the otheer button will also be changed.

Each of the modes have a `Set Type & Filter Sync` setting. If you press this button, all buttons with `Syn Type & Filter` will have their settings changed to what you have configured for the `Set Type & Filter Sync` button.

## Offset
Offsets can be used in combination with the `Select by Nr` `Selection Mode`.<br>
By setting an offset, you increase `Nr` for all buttons with that offset.

For example, say you have 9 `Inventory Mode` buttons, with `Nr` set from 1 to 9.<br>
If you then set the offset to 9, it will display items 10 - 19.

| Option            | Description   |
|-------------------|---------------|
| Offset Mode       | Sets how to set the offset:<br><b>-Set to Value</b>: Sets the offset to the value set in `Offset`.<br><b>-Increase/Decrease</b>: Increases the offset by the value set in `Offset`. |
| Offset            | The value to set the offset to (in case of `Set to Value`), or the value to increment the offset with (in case of `Increase/Decrease`).<br> The offset can be any value, positive or negative. |
| Display           | <b>-Offset</b>: Display the current offset on the Stream Deck.<br><b>-Icon</b>: Display an icon on the Stream Deck. |
| Colors            | <b>-On Color</b>: (`Set to Value` only) A border is drawn on the Stream Deck of this color if the current offset is equal to the offset configured in `Offset`.<br><b>-Off Color</b>: (`Set to Value` only) A border is drawn on the Stream Deck of this color if the current offset is not equal to the offset configured in `Offset`.<br><b>-Background</b>: Background color of the button. |

## Wound Overlay
<div class="imgContainer"><img src="../../img/wound-overlays.jpg"></div>
Wound overlays can give the approximate health state of a token. For example, based on how much relative HP a token has it can overlay one or more blood drops over the token icon:

| HP Percentage | Overlay       |
|---------------|---------------|
| 76% - 100%    | No overlay    |
| 51% - 75%     | 1 Droplets    |
| 26% - 50%     | 2 Droplets    |
| 1% - 25%      | 3 Droplets    |
| 0             | Skull overlay |

This can be useful if you want to give players an overview of a token's health, without giving the actual HP.

Wound overlays are available in all Token Modes.

| Option            | Description   |
|-------------------|---------------|
| Wound Overlay     | Sets the overlay type. |
| Opacity           | Sets the opacity of the overlay, with 0 being fully transparant and 1 being fully opaque. |
| Color             | Sets the color of the overlay. |