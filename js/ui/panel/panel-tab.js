/**
 * panel-tab.js: the base class of the tabs of the in-game panel (quest log, skills, store, achievements, settings).
 */


/** One tab: its label, the markup of its body, and how it reacts to clicks and form input in that body. */
export class PanelTab {
	id;                 // Tab id, as in data-tab and TabbedPanel.Open()
	label;              // Text of the tab button
	panel;              // The TabbedPanel showing this tab


	constructor(panel, id, label) {
		this.panel = panel;
		this.id = id;
		this.label = label;
	}


	/** The body's markup, rebuilt every time the tab is drawn. */
	Markup() {
		return '';
	}


	/** The tab was selected or opened. */
	OnShow() {
	}


	/** A button in the body was clicked. */
	OnClick(button) {
	}


	/** A form control in the body changed. */
	OnInput(control) {
	}
}
