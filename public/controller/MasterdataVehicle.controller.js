sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		"sap/ui/core/routing/History",
		"sap/ui/bw/bozwo/util/formatter"
	], function(jQuery, Controller, JSONModel, History, formatter) {
	"use strict";
	var Id = 0;
	var masterdataId = 0;
	var origin = '';
	var post_put = '';
	var PageController = Controller.extend("sap.ui.bw.bozwo.controller.MasterdataVehicle", {
		formatter: formatter,
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("masterdata-vehicle-edit").attachMatched(this._onRouteMatchedEdit, this);
			oRouter.getRoute("masterdata-vehicle-add").attachMatched(this._onRouteMatchedAdd, this);
			// Hint: we don't want to do it this way
			/*
			oRouter.attachRouteMatched(function (oEvent){
				var sRouteName, oArgs, oView;
				sRouteName = oEvent.getParameter("name");
				if (sRouteName === "employee"){
					this._onRouteMatched(oEvent);
				}
			}, this);
			*/


			
		},
		changeModel: function () {
			console.log('change the Model:');
			console.log(this.getView().getModel("resources").getProperty("/"));	
			
		},
		_onRouteMatchedEdit : function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oArgs, oView;
			post_put = 'PUT';
			oArgs = oEvent.getParameter("arguments");
			oView = this.getView();
			Id = oArgs.Id;
			origin = oArgs.origin;
			
			console.log(origin);
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("loadingData")

	  			});
		
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/Vehicle/"+oArgs.Id, false);
			this.getView().setModel(oModel,"vehicle");
			
			var oModel = new sap.ui.model.json.JSONModel("/api/PeopleGroup", false);
			this.getView().setModel(oModel,"people_groups");
					
			var oModel = new sap.ui.model.json.JSONModel("/api/Vehicle/"+Id+"/ResourceType/0/merged/0/role=vehicle", false);
			this.getView().setModel(oModel,"resources");
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/MasterdataGroup/0/Masterdata/0/role/company,supplier", false);
			this.getView().setModel(oModel,"masterdata");
			
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});

			oView.bindElement({
				path : "/masterdata-vehicle-edit(" + oArgs.Id + ")",
				events : {
					change: this._onBindingChange.bind(this),
					dataRequested: function (oEvent) {
						oView.setBusy(true);
					},
					dataReceived: function (oEvent) {
						oView.setBusy(false);
					}
				}
			});

		},
		_onRouteMatchedAdd : function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oArgs, oView;
			post_put = 'POST';
			oArgs = oEvent.getParameter("arguments");
			oView = this.getView();
			Id = 0;		
			masterdataId = oArgs.masterdataId;
			origin = oArgs.origin;
			
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("loadingData")

	  			});
			
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/Vehicle/"+Id, false);
			
			this.getView().setModel(oModel,"vehicle"); 
			
			var oModel = new sap.ui.model.json.JSONModel("/api/PeopleGroup", false);
			this.getView().setModel(oModel,"people_groups");
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/MasterdataGroup/0/Masterdata/0/role/company,supplier", false);
			this.getView().setModel(oModel,"masterdata");
			
			
			var oModel = new sap.ui.model.json.JSONModel("/api/Vehicle/"+Id+"/ResourceType/0/merged/0/role=vehicle", false);
			this.getView().setModel(oModel,"resources");
			
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});

			
			
			
			
			
			oView.bindElement({
				path : "/masterdata-vehicle-add(" + Id + ")",
				events : {
					change: this._onBindingChange.bind(this),
					dataRequested: function (oEvent) {
						oView.setBusy(true);
					},
					dataReceived: function (oEvent) {
						oView.setBusy(false);
					}
				}
			});

		},
		_onBindingChange : function (oEvent) {
			// No data for the binding
			if (!this.getView().getBindingContext()) {
				this.getRouter().getTargets().display("notFound");
			}
		},
		onNavBack: function () {
			/*
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("overview", true);
			}
			*/
			
			var masterdataIdNew = this.getView().getModel("vehicle").getProperty("/masterdata_id");
			
			if (typeof masterdataIdNew === 'undefined' || masterdataIdNew === null || masterdataIdNew === '') {
    			// variable is undefined or null		
			}else{
				masterdataId = masterdataIdNew;		
			}
			
			
			this.getOwnerComponent().getRouter().navTo(origin,{
				masterdataId: masterdataId
			});
			
		},
		onSelectionChangeGroup : function(oEvent){
			var oItem;
			oItem = oEvent.getSource();	    
		    var selectedItem = oEvent.getParameter("listItem");
		    
			var selectedItemId = selectedItem.data("peopleGroupId");
			var selectedItemRole = selectedItem.data("peopleGroupRole");
			var resourceTypeTableTitle = this.getView().byId("resourceTypeTableTitle");
			var resourceTypeTable = this.getView().byId("resourceTypeTable");
			
			/*
			if (selectedItemRole == "customer"){
				resourceTypeTableTitle.setVisible(false);
				resourceTypeTable.setVisible(false);
			}else{
				resourceTypeTableTitle.setVisible(true);
				resourceTypeTable.setVisible(true);
			}
			
			*/
		    //var oModel = new sap.ui.model.json.JSONModel();
			//oModel.loadData("/api/Masterdata/"+masterdataId+"/MasterdataVehicle/"+selectedItemId+"/default", '', true, 'PUT', null, false, null);
			this.getView().getModel("vehicle").setProperty("/role", selectedItemRole);
			this.getView().getModel("vehicle").setProperty("/group", selectedItemId);
			

			//console.log('group:');
			//console.log(this.getView().getModel("vehicle").getProperty("/group"));
			
			sap.m.MessageToast.show("Action onSelectionChangeGroup triggered on item: " + selectedItem.data("peopleGroupId") +" "+selectedItemRole);
	
		},
		onSave: function (){
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oModel = new sap.ui.model.json.JSONModel();
			var oModel2 = new sap.ui.model.json.JSONModel();
			
			if(this.getView().getModel("vehicle").getProperty("/masterdata_id") == 0){
				this.getView().getModel("vehicle").setProperty("/masterdata_id", masterdataId);
			}
			
			//Vehicle
			var oParameter = this.getView().getModel("vehicle").getJSON();
			oModel.loadData("/api/Vehicle/"+Id, oParameter, true, post_put, null, false, null);
			
			var oParameter = this.getView().getModel("resources").getJSON();
			oModel.attachRequestCompleted(function(){
				if (Id == 0){
					Id = oModel.getProperty("/modelId");	
				}
			
			//Resource_types
				
			oModel2.loadData("/api/Vehicle/"+Id+"/ResourceType/0/sync", oParameter, true, 'PUT', null, false, null);
			
			
			sap.m.MessageToast.show(oBundle.getText("saved"));
			});
			this.onNavBack();
			
			
		}
	});
 
 
	return PageController;
 
});