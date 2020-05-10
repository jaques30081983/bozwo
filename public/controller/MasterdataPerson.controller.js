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
	var PageController = Controller.extend("sap.ui.bw.bozwo.controller.MasterdataPerson", {
		formatter: formatter,
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("masterdata-person-edit").attachMatched(this._onRouteMatchedEdit, this);
			oRouter.getRoute("masterdata-person-add").attachMatched(this._onRouteMatchedAdd, this);
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
			
			var oModel0 = new JSONModel([
				{id:"1", name: "Neutral"},
				{id:"2", name: "Frau"},
				{id:"3", name: "Mann"}
			]);
			this.getView().setModel(oModel0,"gender");

			
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
			oModel.loadData("/api/Person/"+oArgs.Id, false);
			this.getView().setModel(oModel,"person");
			
			var oModel = new sap.ui.model.json.JSONModel("/api/PeopleGroup", false);
			this.getView().setModel(oModel,"people_groups");
					
			var oModel = new sap.ui.model.json.JSONModel("/api/Person/"+Id+"/ResourceType/0/merged/0/role=person", false);
			this.getView().setModel(oModel,"resources");
			
			
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});

			oView.bindElement({
				path : "/masterdata-person-edit(" + oArgs.Id + ")",
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
			oModel.loadData("/api/Person/"+Id, false);
			
			this.getView().setModel(oModel,"person"); 
			
			var oModel = new sap.ui.model.json.JSONModel("/api/PeopleGroup", false);
			this.getView().setModel(oModel,"people_groups");
			
			var oModel = new sap.ui.model.json.JSONModel("/api/MasterdataGroup/1/Masterdata", false);
			this.getView().setModel(oModel,"company");
			
			var oModel = new sap.ui.model.json.JSONModel("/api/Person/"+Id+"/ResourceType/0/merged/0/role=person", false);
			this.getView().setModel(oModel,"resources");
			
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});

			
			
			
			
			
			oView.bindElement({
				path : "/masterdata-person-add(" + Id + ")",
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
			
			var masterdataIdNew = this.getView().getModel("person").getProperty("/masterdata_id");
			
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
			//oModel.loadData("/api/Masterdata/"+masterdataId+"/MasterdataPerson/"+selectedItemId+"/default", '', true, 'PUT', null, false, null);
			this.getView().getModel("person").setProperty("/role", selectedItemRole);
			this.getView().getModel("person").setProperty("/group", selectedItemId);
			

			//console.log('group:');
			//console.log(this.getView().getModel("person").getProperty("/group"));
			
			sap.m.MessageToast.show("Action onSelectionChangeGroup triggered on item: " + selectedItem.data("peopleGroupId") +" "+selectedItemRole);
	
		},
		onSave: function (){
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oModel = new sap.ui.model.json.JSONModel();
			var oModel2 = new sap.ui.model.json.JSONModel();
			
			if(this.getView().getModel("person").getProperty("/masterdata_id") == 0){
				this.getView().getModel("person").setProperty("/masterdata_id", masterdataId);
			}
			
			//Person
			this.getView().getModel("person").setProperty("/user_id", 0);
			var oParameter = this.getView().getModel("person").getJSON();
			oModel.loadData("/api/Person/"+Id, oParameter, true, post_put, null, false, null);
			
			var oParameter = this.getView().getModel("resources").getJSON();
			oModel.attachRequestCompleted(function(){
				if (Id == 0){
					Id = oModel.getProperty("/modelId");	
					
				}
			
			//Resource_types
				
			oModel2.loadData("/api/Person/"+Id+"/ResourceType/0/sync", oParameter, true, 'PUT', null, false, null);
			
			
			sap.m.MessageToast.show(oBundle.getText("saved"));
			});
			this.onNavBack();
			
			
		}
	});
 
 
	return PageController;
 
});