sap.ui.define([
	'sap/m/MessageBox'
], function () {
	"use strict";
	return {
   		loginApi: function(){
       		sap.m.MessageToast.show("You called the login Api");
       		return
   		},
   		logoutApi: function(){
       		sap.m.MessageToast.show("You called the logout Api");
       		return
   		},

	
   		callApi: function(parent,oUrl,oParameter,oAction){
   			
			//var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
			//this.getOwnerComponent().getModel("i18n").getResourceBundle();
   			//var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
   			
   			var oBundle = parent.getView().getModel("i18n").getResourceBundle();
   			
   			var oMessage = oBundle.getText("loadingData");
   			
   			if(oAction == 'GET'){
   				oMessage = oBundle.getText("loadingData");
   			}else if(oAction == 'POST'){
   				oMessage = oBundle.getText("savingData");
   			}else if(oAction == 'PUT'){
   				oMessage = oBundle.getText("updatingData");
   			}else if(oAction == 'DELETE'){
   				oMessage = oBundle.getText("deletingData");
   			}
   			
   			
   			
			var busyDialog = new sap.m.BusyDialog({

				text:oMessage,

	  			});
   				
       	
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			
			oModel.loadData("/api/"+oUrl, oParameter, true, oAction, null, false, null);
			
			oModel.attachRequestCompleted(function(){
				busyDialog.close(); 
			});
			
			
			
       		oModel.attachRequestFailed(function(oEvent){
   				sap.m.MessageBox.show(oEvent.getParameter("statusText"), {
   					icon: sap.m.MessageBox.Icon.ERROR,
   					title: oEvent.getParameter("message")+' '+oEvent.getParameter("statusCode"),
   					actions: [sap.m.MessageBox.Action.CLOSE],
   					id: "messageBoxId1",
   					details: oEvent.getParameter("responseText"),
   					
   					contentWidth: "640px"
   				

   				});
       		
       		});
       		
       		return oModel
   		}
     }

});