sap.ui.define([
	'sap/ui/bw/bozwo/util/api',
	'sap/ui/core/Item',
	'sap/ui/model/json/JSONModel'
], function (api, Item, JSONModel) {
	"use strict";

	return {

		onMorphDocument: function(parent,oDocumentModel,oDocumentId,oDocumentNumber){
			var oModelMorph = new JSONModel(
				{
				document_model: oDocumentModel,
				document_id: oDocumentId,
				document_number: oDocumentNumber,
				document_new_model: oDocumentModel,
				goto_new_document: 1 
				}
			);
			parent.getView().setModel(oModelMorph,"morph");
			//Create fragment dialog
			var oView = parent.getView();
			var oDialog = oView.byId("morphDialog");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bw.bozwo.fragment.MorphDialog", parent);
				// connect dialog to view (models, lifecycle)
				oView.addDependent(oDialog);
				
			}

			oDialog.open();

   		
		},onMorphCloseDialog : function (parent) {
			parent.byId("morphDialog").close();
			parent.byId("morphDialog").destroy();
		},onMorphRequest : (parent) => {
			var oDocumentModel = parent.getView().getModel("morph").getProperty("/document_model");
			var oDocumentId = parent.getView().getModel("morph").getProperty("/document_id");
			var oDocumentNewModel = parent.getView().getModel("morph").getProperty("/document_new_model");
			var oDocumentGotoNewDocument = parent.getView().getModel("morph").getProperty("/goto_new_document");
	

			
			//Set busy
			parent.byId("morphDialog").setBusy(true);
			//Create Model

			var oParameter = parent.getView().getModel("morph").getJSON();
			console.log("Morph:",oParameter);
			var oModel = api.callApi(parent,oDocumentModel+'/'+oDocumentId+'/'+oDocumentNewModel+'/0/morph',oParameter,'POST');
			parent.getView().setModel(oModel,"documentMorphRequest");

			oModel.attachRequestCompleted(function(){
				var oDocumentNewId= parent.getView().getModel("documentMorphRequest").getProperty("/id");
				
				parent.byId("morphDialog").setBusy(false);
				parent.byId("morphDialog").close();

				parent.byId("morphDialog").destroy();

				if(oDocumentGotoNewDocument == 1){
					parent.getOwnerComponent().getRouter().navTo("document",{
						Id: oDocumentNewId,
						model: oDocumentNewModel,
						origin: "document"
					});
				}

			});
			
		}
     }

});