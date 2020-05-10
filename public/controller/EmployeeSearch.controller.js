sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.ui.bw.bozwo.controller.EmployeeSearch", {	
		onInit: function () {
		
			var oViewModel = new JSONModel({
				currency: "EUR"
			});
			this.getView().setModel(oViewModel, "view");

		    this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		    this._oRouter.attachRouteMatched(this.onMatch, this);
	
		    this.setInitialFocus(this.byId("employeeSearchField"));
				
		},		
		onMatch: function() {
			var sQuery = this.byId("employeeSearchField").getValue();
	
			if(sQuery == ""){
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				var busyDialog = new sap.m.BusyDialog({

		  			text:oBundle.getText("loadingData")

		  			});
				
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.attachRequestSent(function(){busyDialog.open();});
				oModel.loadData("/api/Person/0/0/0/search/first_name=/role=employee", false);
				oModel.attachRequestCompleted(function(){busyDialog.close();});
				oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
				
				this.getView().setModel(oModel);
			}else{
				this.onSearchEmployees();
			}
			

			    },
		setInitialFocus: function(control) {
		      this.getView().addEventDelegate({
		        onAfterShow: function() {
		          setTimeout(function() {
		            control.focus();
		          }.bind(this), 0);
		        },
		      }, this);
		    },
		onSearchEmployees : function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("searchingData")

	  			});
			
			var sQuery = this.byId("employeeSearchField").getValue();
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/Person/0/0/0/search/first_name="+sQuery+"&last_name="+sQuery+"/role=employee", false);
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			this.getView().setModel(oModel); 
	
		},
		 
		onPress : function(oEvent){
			var oItem;
			oItem = oEvent.getSource();
			//oCtx = oItem.getBindingContext();
			sap.m.MessageToast.show("Action triggered on item: " + oItem.data("employeeId"));
			this.getOwnerComponent().getRouter().navTo("masterdata-person-edit",{
				Id: oItem.data("employeeId"),
				origin: 'employee-search'
				
			});
		},
		onAddPerson: function (oEvent){

				var oItem;
				oItem = oEvent.getSource();
				sap.m.MessageToast.show("Action onAddPerson triggered on item: ");
				this.getOwnerComponent().getRouter().navTo("masterdata-search",{
					masterdataId: '0',
					origin: 'employee-search'
				});
		}

	});
 
 
	return PageController;
 
});