sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/ui/bw/bozwo/util/formatter',
		'sap/ui/model/Filter'
	], function(jQuery, Controller, JSONModel, formatter, Filter) {
	"use strict";

	var PageController = Controller.extend("sap.ui.bw.bozwo.controller.MasterdataSearch", {
		/*
		onInit: function (oEvent) {
			// set explored app's demo model on this sample
			//var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/supplier.json"));
			var oModel = new sap.ui.model.json.JSONModel("/masterdatas", false);
			this.getView().setModel(oModel);
 
			this.getView().bindElement("/Masterdata/Edit/0");
 
		}
		*/
		formatter: formatter,
		onInit: function () {
		
			var oViewModel = new JSONModel({
				currency: "EUR"
			});
			this.getView().setModel(oViewModel, "view");

		    this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		    this._oRouter.attachRouteMatched(this.onMatch, this);
	
		    this.setInitialFocus(this.byId("masterdataSearchField"));
				
		},		
		onMatch: function() {
			var sQuery = this.byId("masterdataSearchField").getValue();
	
			if(sQuery == ""){
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				var busyDialog = new sap.m.BusyDialog({

		  			text:oBundle.getText("loadingData")

		  			});
				
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.attachRequestSent(function(){busyDialog.open();});
				oModel.loadData("/api/Masterdata/0/0/0/latest/15", false);
				oModel.attachRequestCompleted(function(){busyDialog.close();});
				oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
				
				this.getView().setModel(oModel);
			}else{
				this.onSearchMasterdatas();
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
		onSearchMasterdatas : function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("searchingData")

	  			});
			
			var sQuery = this.byId("masterdataSearchField").getValue();
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/Masterdata/0/0/0/search/first_name="+sQuery+"&last_name="+sQuery+"&company_name_1="+sQuery+"&company_name_2="+sQuery+"&zip="+sQuery, false);
			
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			this.getView().setModel(oModel); 
			
			
			//Set filter
			var groupId=this.byId("filterSelect").getSelectedKey();
			console.log('Selected ID:', groupId);
	        this.byId("searchResultList").getBinding("items").filter(groupId ? new Filter({
		          path: "group",
		          operator: "EQ",
		          value1: groupId,
		        }) : null);
	
		},
		 
		onPress : function(oEvent){
			var oItem;
			oItem = oEvent.getSource();
			//oCtx = oItem.getBindingContext();
			sap.m.MessageToast.show("Action triggered on item: " + oItem.data("masterdataId"));
			this.getOwnerComponent().getRouter().navTo("masterdata-edit",{
				masterdataId: oItem.data("masterdataId")
			});
		},	
		onSetFilter: function(oEvent) {
	        //var groupId = oEvent.getSource().getSelectedKey();
	        var groupId=oEvent.getParameter("selectedItem").getKey();
	        console.log('ID:', groupId);
	        this.byId("searchResultList").getBinding("items").filter(groupId ? new Filter({
	          path: "group",
	          operator: "EQ",
	          value1: groupId,
	        }) : null);
	      }

	});
 
 
	return PageController;
 
});