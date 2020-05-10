sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.ui.bw.bozwo.controller.VehicleSearch", {	
		onInit: function () {
		
			var oViewModel = new JSONModel({
				currency: "EUR"
			});
			this.getView().setModel(oViewModel, "view");

		    this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		    this._oRouter.attachRouteMatched(this.onMatch, this);
	
		    this.setInitialFocus(this.byId("vehicleSearchField"));
				
		},		
		onMatch: function() {
			var sQuery = this.byId("vehicleSearchField").getValue();
	
			if(sQuery == ""){
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				var busyDialog = new sap.m.BusyDialog({

		  			text:oBundle.getText("loadingData")

		  			});
				
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.attachRequestSent(function(){busyDialog.open();});
				oModel.loadData("/api/Vehicle/0/0/0/latest/15", false);
				oModel.attachRequestCompleted(function(){busyDialog.close();});
				oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
				
				this.getView().setModel(oModel);
			}else{
				this.onSearchVehicle();
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
		onSearchVehicle : function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("searchingData")

	  			});
			
			var sQuery = this.byId("vehicleSearchField").getValue();
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/Vehicle/0/0/0/search/numberplate="+sQuery+"&name="+sQuery, false);
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			this.getView().setModel(oModel); 
	
		},
		 
		onPress : function(oEvent){
			var oItem;
			oItem = oEvent.getSource();
			//oCtx = oItem.getBindingContext();
			sap.m.MessageToast.show("Action triggered on item: " + oItem.data("vehicleId"));
			this.getOwnerComponent().getRouter().navTo("masterdata-vehicle-edit",{
				Id: oItem.data("vehicleId"),
				masterdataId: '0',
				origin: 'vehicle-search'
				
			});
		},
		onAddVehicle: function (oEvent){

				var oItem;
				oItem = oEvent.getSource();
				sap.m.MessageToast.show("Action onAddVehicle triggered on item: ");
				this.getOwnerComponent().getRouter().navTo("masterdata-vehicle-add",{
					vehicleId: '0',
					masterdataId: '0',
					origin: 'vehicle-search'
				});
		}

	});
 
 
	return PageController;
 
});