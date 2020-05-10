sap.ui.define([
	'sap/ui/bw/bozwo/util/api',
	'sap/ui/core/Item'
], function (api, Item) {
	"use strict";
	return {

		onEmailDocument: function(parent,oDocumentModel,oDocumentId,oDocumentNumber,oPersonId){
			

			var oUrl = oDocumentModel+'-'+oDocumentNumber+'.pdf'

			var mailAttachment = [{
				"fileName": oUrl,
				"mimeType": "application/pdf",
				"thumbnailUrl": "",
				"url": "document/"+oUrl,
				"uploadState": "Complete"
			}];
			parent.getView().getModel("email").setProperty("/mailAttachments",mailAttachment);

			
			parent.getView().getModel("email").setProperty("/customer_person_id",oPersonId);
			parent.getView().getModel("email").setProperty("/document_number",oDocumentNumber);
			parent.getView().getModel("email").setProperty("/document_model",oDocumentModel);
			parent.getView().getModel("email").setProperty("/document_id",oDocumentId);

			this.onEmailCreateMessage(parent);
			
			//Create fragment dialog
			var oView = parent.getView();
			var oDialog = oView.byId("emailSendDialog");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bw.bozwo.fragment.EmailSendDialog", parent);
				// connect dialog to view (models, lifecycle)
				oView.addDependent(oDialog);
				
			}

			oDialog.open();

			//var oUploadSet = this.getView().byId("UploadSet");
			//oUploadSet.destroyItems();

   		},onEmailCreateMessage: function (parent) { 

			var oParameter = parent.getView().getModel("email").getJSON();
			console.log("onEmailCreateMessage:",oParameter);

			//Get Data
			var oBundle = parent.getView().getModel("i18n").getResourceBundle();
			
			//Document
			var oDocumentModel = parent.getView().getModel("email").getProperty("/document_model");
			var person_id = parent.getView().getModel("email").getProperty("/customer_person_id");
			var number = parent.getView().getModel("email").getProperty("/document_number");
			//var documentName= parent.getView().getModel("document").getProperty("name");
			
			//Customer
			var first_name = parent.getView().getModel("customer").getProperty("/first_name");
			var last_name = parent.getView().getModel("customer").getProperty("/last_name");
			var emailTo = parent.getView().getModel("customer").getProperty("/email");
			var customer_people = parent.getView().getModel("customer_people").getProperty("/last_name");		
			
			//Salutation
			var mailSalutationFemale = oBundle.getText("mailSalutationFemale");
			var mailSalutationMale = oBundle.getText("mailSalutationMale");
			var mailSalutation = oBundle.getText("mailSalutationGeneric");
			var mailGreeting = oBundle.getText("mailGreeting");

			if(typeof person_id !== 'undefined' || person_id !== "null"){
				var oPeople = parent.getView().getModel("customer_people").oData;
				var person_gender = 0;
				for (var key in oPeople) {
					if(person_id == oPeople[key]['id']){
						person_gender = oPeople[key]['gender'];
						first_name = oPeople[key]['first_name'];
						last_name = oPeople[key]['last_name'];
						emailTo = oPeople[key]['email'];
					}
				}

				if(person_gender == "2"){
					mailSalutation = mailSalutationFemale;
				}else if(person_gender == "3"){
					mailSalutation = mailSalutationMale;
				}
			}

			//Document templates
			var oDocuments = parent.getView().getModel("documents").oData;
				
			var document_name = "";
			var document_template_start = "";
			var document_template_end = "";
			for (var key in oDocuments) {
				if(oDocumentModel == oDocuments[key]['model']){
					document_name = oDocuments[key]['title'];
					document_template_start = oDocuments[key]['template_mail_start'];
					document_template_end = oDocuments[key]['template_mail_end'];
				}
			}

			//Project
			var oProject = parent.getView().getModel("project").oData;
				console.log(oProject);
			//Clerk
			var oClerk = parent.getView().getModel("people").oData;
			var clerk_first_name = "";
			var clerk_last_name = "";
			var clerk_email = "";
			for (var key in oClerk) {
				if(sap.ui.bw.bozwo.User.people_id == oClerk[key]['id']){
					clerk_first_name = oClerk[key]['first_name'];
					clerk_last_name = oClerk[key]['last_name'];
					clerk_email = oClerk[key]['email'];
				}
			}

			//CreateSubject
			var mailSubject = document_name+" "+number+" -> "+oProject['name']+" "+oProject['number'];

			//Create Message
			var mailMessage = mailSalutation+" "
				+last_name+",\n"
				+this.br2nl(document_template_start)+" "
				+number+".\n \n"
				+this.br2nl(document_template_end)
		
				+mailGreeting+" \n"
				+clerk_first_name+" "
				+clerk_last_name;

			

			//Set to model
			parent.getView().getModel("email").setProperty("/mailFrom",clerk_email);
			parent.getView().getModel("email").setProperty("/mailTo",emailTo);
			parent.getView().getModel("email").setProperty("/mailSubject",mailSubject);
			parent.getView().getModel("email").setProperty("/mailMessage",mailMessage);

		},onEmailSend: function (parent) {
			//Send Email
			var oDocumentModel = parent.getView().getModel("email").getProperty("/document_model");
			var oDocumentId = parent.getView().getModel("email").getProperty("/document_id");
			//Set busy
			parent.byId("emailSendDialog").setBusy(true);
			
			//Create Model
			
			var oParameter = parent.getView().getModel("email").getJSON();
			console.log("Parameter to Mail:",oParameter);
			var oModel = api.callApi(parent,oDocumentModel+'/'+oDocumentId+'/0/0/sendEmail',oParameter,'POST');
			
			oModel.attachRequestCompleted(function(){
				parent.byId("emailSendDialog").setBusy(false);
				parent.byId("emailSendDialog").close();
				parent.byId("UploadSet").destroy();
				parent.byId("emailSendDialog").destroy();
			});	

		},onEmailCloseDialog : function (parent) {
			parent.byId("emailSendDialog").close();
			parent.byId("UploadSet").destroy();
			parent.byId("emailSendDialog").destroy();
		

		},onEmailBeforeUploadStarts: function(parent,oEvent) {
			//var oUploadCollection = this.getView().byId("UploadCollection"),
			//oFileUploader = oUploadCollection._getFileUploader();
		  
			// use multipart content (multipart/form-data) for posting files
			//oFileUploader.setUseMultipart(true);

			// Header Slug
			var oUploadSet = parent.getView().byId("UploadSet");
			//oFileUploader = oUploadSet._getFileUploader();

			//var oCustomerHeaderSlug = new UploadCollectionParameter({
				//name: "Filename",
				//value: oEvent.getParameter("fileName")
			//});
			//oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			//MessageToast.show("BeforeUploadStarts event triggered.");
			var oFilename = oEvent.getParameters().item.getProperty("fileName");
			oUploadSet.destroyHeaderFields();
			oUploadSet.addHeaderField(new Item({key: "fileName", text: oFilename}));

			console.log("onBeforeUloadStarts triggered ....");
			console.log(oEvent.getParameters().item.getProperty("fileName"));
			//console.log(oEvent.getParameter("fileName"));

			//this.getView().getModel("email").refresh();
			var oData = parent.getView().getModel("email").getData();
			console.log(oUploadSet.getItems());

		}, onEmailUploadCompleted: function(parent, oEvent) {
			//var oUploadCollection = this.byId("UploadCollection");
			//var oUploadCollection = this.getView().getModel("email");

			var oData = parent.getView().getModel("email").getData();
			
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

			parent.getView().getModel("email").refresh();
			var oData = parent.getView().getModel("email").getData();
			console.log('uploadCompleted:',oData['mailAttachments']);
	
		},br2nl : function (str) {
			if (typeof str === 'undefined' || str === null) {
				return ''
			  }
			
			  return (str + '')
			  .replace(/<br\s*\/?>/mg,"\n");
			  
		},onEmailSelectPerson: function (parent,oEvent) { 
			
			console.log("onSelectPerson");
			console.log(oEvent.getSource().getSelectedItem().getKey()); 

			var person_id = oEvent.getSource().getSelectedItem().getKey();
			var emailTo = '';
			var oPeople = parent.getView().getModel("customer_people").oData;
				for (var key in oPeople) {
					if(person_id == oPeople[key]['id']){
						emailTo = oPeople[key]['email'];
					}
				}
			
			
			parent.getView().getModel("email").setProperty("/mailTo",emailTo);
			parent.getView().getModel("email").setProperty("/customer_person_id",person_id);
			this.onEmailCreateMessage(parent);

		}
     }

});