wazeModel.actionManager.events.register("afteraction", null, autoSave);
wazeModel.actionManager.events.register("afterundoaction", null, autoSave);
wazeModel.actionManager.events.register("afterclearaction", null, autoSave);

function autoSave(event) {
	if ((wazeModel.actionManager.unsavedActionsNum() >= 30) && 
	    wazeModel.actionManager.canSave())
		$("div[title=Save]").trigger('click');
}
