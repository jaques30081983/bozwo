sap.ui.define([
	'sap/ui/bw/bozwo/util/api',
	'sap/ui/core/Item',
	'sap/m/MessageToast'
], function (api, Item, MessageToast) {
	"use strict";
	return {

		onLetterDocument: function(parent,oDocumentModel,oDocumentId,oDocumentNumber,oPersonId){
			
			//Get status of hybrid letter service
			var oModelStatus = api.callApi(parent,'0/0/0/0/hybridLetterBalance','','GET');
			parent.getView().setModel(oModelStatus,"hybridLetterStatus");
			
			oModelStatus.attachRequestCompleted(function(){
				var oLetterStatus= parent.getView().getModel("hybridLetterStatus").getProperty("/status");
				var oLetterBalance= parent.getView().getModel("hybridLetterStatus").getProperty("/balanceCents") / 100;
				var aLetterBalance = [oLetterBalance,'€']
				parent.getView().getModel("letter").setProperty("/letterStatus",oLetterStatus);
				parent.getView().getModel("letter").setProperty("/letterBalanceCents",aLetterBalance);
			
			});	

			//Letter
			var oUrl = oDocumentModel+'-'+oDocumentNumber+'.pdf'

			var letterAttachment = [{
				"fileName": oUrl,
				"mimeType": "application/pdf",
				"thumbnailUrl": "",
				"url": "document/"+oUrl,
				"uploadState": "Complete"
			}];
			parent.getView().getModel("letter").setProperty("/letterAttachments",letterAttachment);

			
			parent.getView().getModel("letter").setProperty("/customer_person_id",oPersonId);
			parent.getView().getModel("letter").setProperty("/document_number",oDocumentNumber);
			parent.getView().getModel("letter").setProperty("/document_model",oDocumentModel);
			parent.getView().getModel("letter").setProperty("/document_id",oDocumentId);

			//Customer
			var oCustomerCountryId = parent.getView().getModel("customer").getProperty("/country_id");
			var oCountries = parent.getView().getModel("countries").getProperty("/");
			
			for (var key in oCountries) {
				if(oCustomerCountryId == oCountries[key]['id']){
					var oCountryCode = oCountries[key]['code'];
				}
			}
			
			parent.getView().getModel("letter").setProperty("/customer_country_code",oCountryCode);
			//this.onLetterCreateMessage(parent);
			
			//Create fragment dialog
			var oView = parent.getView();
			var oDialog = oView.byId("letterSendDialog");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bw.bozwo.fragment.LetterSendDialog", parent);
				// connect dialog to view (models, lifecycle)
				oView.addDependent(oDialog);
				
			}

			oDialog.open();

			//var oUploadSet = this.getView().byId("UploadSet");
			//oUploadSet.destroyItems();

   		},onLetterSend: function (parent) {
			//Send Letter
			var oDocumentModel = parent.getView().getModel("letter").getProperty("/document_model");
			var oDocumentId = parent.getView().getModel("letter").getProperty("/document_id");
			//Set busy
			parent.byId("letterSendDialog").setBusy(true);
			
			//Create Model
			var oParameter = parent.getView().getModel("letter").getJSON();
			console.log("Parameter to Mail:",oParameter);
			var oModel = api.callApi(parent,oDocumentModel+'/'+oDocumentId+'/0/0/sendLetter',oParameter,'POST');
			parent.getView().setModel(oModel,"hybridLetterStatusSend");
			
			oModel.attachRequestCompleted(function(){
				parent.byId("letterSendDialog").setBusy(false);
				parent.byId("letterSendDialog").close();
				parent.byId("UploadSet").destroy();
				parent.byId("letterSendDialog").destroy();
				var oLetterStatus= parent.getView().getModel("hybridLetterStatusSend").getProperty("/status");
				var oLetterchargedCents = parent.getView().getModel("hybridLetterStatusSend").getProperty("/chargedCents");
				oLetterchargedCents = oLetterchargedCents / 100;
				var oLetterJobId = parent.getView().getModel("hybridLetterStatusSend").getProperty("/jobId");
				
				MessageToast.show(oLetterStatus+'\n\n'+oLetterchargedCents+' € \n\n'+oLetterJobId,
				{
					duration: 10000,
					width: "60em",
					my: "center center",
					at: "center center"
				});
			});	

		},onLetterCloseDialog : function (parent) {
			parent.byId("letterSendDialog").close();
			parent.byId("UploadSet").destroy();
			parent.byId("letterSendDialog").destroy();
		

		},onLetterBeforeUploadStarts: function(parent,oEvent) {
			
			// Header Slug
			var oUploadSet = parent.getView().byId("UploadSet");
			
			var oFilename = oEvent.getParameters().item.getProperty("fileName");
			oUploadSet.destroyHeaderFields();
			oUploadSet.addHeaderField(new Item({key: "fileName", text: oFilename}));

			console.log("onBeforeUloadStarts triggered ....");
			console.log(oEvent.getParameters().item.getProperty("fileName"));
			
			
			var oData = parent.getView().getModel("letter").getData();
			console.log(oUploadSet.getItems());

		}, onLetterUploadCompleted: function(parent, oEvent) {
			
			var oData = parent.getView().getModel("letter").getData();
			
			oData.mailAttachments.unshift({
				"documentId": jQuery.now().toString(), // generate Id,
				"fileName": oEvent.getParameters().item.getProperty("fileName"),
				"mimeType": "",
				"thumbnailUrl": "",
				"url": "attachments/"+oEvent.getParameters().item.getProperty("fileName"),
				"uploadState": "Complete",
				"selected": false
			});
			
			var oUploadSet = parent.getView().byId("UploadSet");
			oUploadSet.destroyIncompleteItems();

			parent.getView().getModel("letter").refresh();
			var oData = parent.getView().getModel("letter").getData();
			console.log('uploadCompleted:',oData['mailAttachments']);
	
		},br2nl : function (str) {
			if (typeof str === 'undefined' || str === null) {
				return ''
			  }
			
			  return (str + '')
			  .replace(/<br\s*\/?>/mg,"\n");
			  
		}
     }

});