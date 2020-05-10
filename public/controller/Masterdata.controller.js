sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		"sap/ui/core/routing/History",
		"sap/ui/bw/bozwo/util/formatter"
	], function(jQuery, Controller, JSONModel, History, formatter) {
	"use strict";
	var masterdataId = 0;
	var post_put = '';
	var that = 0;
	var PageController = Controller.extend("sap.ui.bw.bozwo.controller.Masterdata", {
		formatter: formatter,
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			that = this;
			oRouter.getRoute("masterdata-edit").attachMatched(this._onRouteMatchedEdit, this);
			oRouter.getRoute("masterdata-add").attachMatched(this._onRouteMatchedAdd, this);
			

			
		},
		_onRouteMatchedEdit : function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oArgs, oView;
			post_put = 'PUT';
			oArgs = oEvent.getParameter("arguments");
			oView = this.getView();
			masterdataId = oArgs.masterdataId;
			
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("loadingData")

	  			});
			
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/Masterdata/"+oArgs.masterdataId, false);
			this.getView().setModel(oModel,"masterdata"); 
			
			var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+oArgs.masterdataId+"/ShippingAddress", false);
			this.getView().setModel(oModel,"masterdata_shipping_addresses"); 
			
			var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+oArgs.masterdataId+"/Person", false);
			this.getView().setModel(oModel,"masterdata_people"); 
			
			var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+oArgs.masterdataId+"/BankAccount", false);
			this.getView().setModel(oModel,"masterdata_bank_accounts");
			
			var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+oArgs.masterdataId+"/Vehicle", false);
			this.getView().setModel(oModel,"masterdata_vehicles");
			
			var oModel = new sap.ui.model.json.JSONModel("/api/MasterdataGroup", false);
			this.getView().setModel(oModel,"masterdata_groups");
			
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});

			oView.bindElement({
				path : "/masterdataedit(" + oArgs.masterdataId + ")",
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
			masterdataId = 0;
			var busyDialog = new sap.m.BusyDialog({

				text:oBundle.getText("loadingData")

	  			});
			

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/Masterdata/0", false);
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			this.getView().setModel(oModel,"masterdata");
			
			var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+masterdataId+"/ShippingAddress", false);
			this.getView().setModel(oModel,"masterdata_shipping_addresses"); 
			
			var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+masterdataId+"/Person", false);
			this.getView().setModel(oModel,"masterdata_people"); 
			
			var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+oArgs.masterdataId+"/BankAccount", false);
			this.getView().setModel(oModel,"masterdata_bank_accounts");
			
			var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+oArgs.masterdataId+"/Vehicle", false);
			this.getView().setModel(oModel,"masterdata_vehicles");
			
			var oModel = new sap.ui.model.json.JSONModel("/api/MasterdataGroup", false);
			this.getView().setModel(oModel,"masterdata_groups");
			
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			

			oView.bindElement({
				path : "/masterdataadd(" + oArgs.masterdataId + ")",
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
			
			this.getOwnerComponent().getRouter().navTo("masterdata-search");
		},	
		onSave: function (navToAfterSave){
			
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

				text:oBundle.getText("savingData")

	  			});
			
			var oView = this.getView();
			var oDialog = oView.byId("whatNextDialog");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bw.bozwo.fragment.WhatNextDialog", this);
				// connect dialog to view (models, lifecycle)
				oView.addDependent(oDialog);
			}
			

			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			if(masterdataId == 0){
			this.getView().getModel("masterdata").setProperty("/number_object_id", 10);
			this.getView().getModel("masterdata").setProperty("/number", '0');
			this.getView().getModel("masterdata").setProperty("/number_old", '0');
			this.getView().getModel("masterdata").setProperty("/number_ext", '0');
			}
			

			
			var oParameter = this.getView().getModel("masterdata").getJSON();
			
			oModel.loadData("/api/Masterdata/"+masterdataId, oParameter, true, post_put, null, false, null);	
			
			oModel.attachRequestCompleted(function(){
				busyDialog.close(); 
				if(masterdataId == 0 &&  typeof navToAfterSave !== "object"){
					var newMasterdataId = oModel.getProperty("/modelId");
					
					that.getOwnerComponent().getRouter().navTo(navToAfterSave,{
						masterdataId: newMasterdataId,
						origin: "masterdata-edit"
					});
					

				}else{
					//oDialog.open();
					that.getOwnerComponent().getRouter().navTo("overview",{
						masterdataId: newMasterdataId,
						origin: "masterdata-edit"
					});
				}
			});			
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			
			
		},onCloseDialog : function () {
			this.byId("whatNextDialog").close();
			this.onNavBack();
		},
		onAddPerson: function (oEvent){
			if(masterdataId == 0){
				this.onSave("masterdata-person-add");
			}else{
				var oItem;
				oItem = oEvent.getSource();
				sap.m.MessageToast.show("Action onAddPerson triggered on item: " + masterdataId);
				this.getOwnerComponent().getRouter().navTo("masterdata-person-add",{
					masterdataId: masterdataId,
					origin: 'masterdata-edit'
				});
			}
		},
		onAddShippingAddress: function (oEvent){
			if(masterdataId == 0){
				this.onSave("masterdata-shipping-address-add");
			}else{
			var oItem;
			oItem = oEvent.getSource();
			sap.m.MessageToast.show("Action onAddShippingAddress triggered on item: " + masterdataId);
			this.getOwnerComponent().getRouter().navTo("masterdata-shipping-address-add",{
				masterdataId: masterdataId
			});
			}
		},
		onAddBankAccount: function (oEvent){
			if(masterdataId == 0){
				this.onSave("masterdata-bank-account-add");
			}else{
			var oItem;
			oItem = oEvent.getSource();
			sap.m.MessageToast.show("Action onAddBankAccount triggered on item: " + masterdataId);
			this.getOwnerComponent().getRouter().navTo("masterdata-bank-account-add",{
				masterdataId: masterdataId
			});
			}
		},
		onAddVehicle: function (oEvent){
			if(masterdataId == 0){
				this.onSave("masterdata-vehicle-add");
			}else{
			var oItem;
			oItem = oEvent.getSource();
			sap.m.MessageToast.show("Action onAddVehicle triggered on item: " + masterdataId);
			this.getOwnerComponent().getRouter().navTo("masterdata-vehicle-add",{
				masterdataId: masterdataId,
				origin: 'masterdata-edit'
			});
			}
		},
		onPersonPress : function(oEvent){
			var oItem;
			oItem = oEvent.getSource();
			//oCtx = oItem.getBindingContext();
			sap.m.MessageToast.show("Action onPersonPress triggered on item: " + oItem.data("masterdataPersonId"));
			this.getOwnerComponent().getRouter().navTo("masterdata-person-edit",{
				Id: oItem.data("masterdataPersonId"),
				origin: 'masterdata-edit'
			});
		},
		onShippingAddressPress : function(oEvent){
			var oItem;
			oItem = oEvent.getSource();
			//oCtx = oItem.getBindingContext();
			sap.m.MessageToast.show("Action onShippingAddressPress triggered on item: " + oItem.data("masterdataShippingAddressId"));
			this.getOwnerComponent().getRouter().navTo("masterdata-shipping-address-edit",{
				Id: oItem.data("masterdataShippingAddressId")
			});
		},
		onBankAccountPress : function(oEvent){
			var oItem;
			oItem = oEvent.getSource();
			//oCtx = oItem.getBindingContext();
			sap.m.MessageToast.show("Action onBankAccountPress triggered on item: " + oItem.data("masterdataBankAccountId"));
			this.getOwnerComponent().getRouter().navTo("masterdata-bank-account-edit",{
				Id: oItem.data("masterdataBankAccountId")
			});
		},
		onVehiclePress : function(oEvent){
			var oItem;
			oItem = oEvent.getSource();
			//oCtx = oItem.getBindingContext();
			sap.m.MessageToast.show("Action onVehiclePress triggered on item: " + oItem.data("masterdataVehicleId"));
			this.getOwnerComponent().getRouter().navTo("masterdata-vehicle-edit",{
				Id: oItem.data("masterdataVehicleId"),
				origin: 'masterdata-edit'
			});
		},
		onSelectionChangeGroup : function(oEvent){
			var oItem;
			oItem = oEvent.getSource();	    
		    var selectedItem = oEvent.getParameter("listItem");
		    
			var selectedItemId = selectedItem.data("masterdataGroupId");
			
		    //var oModel = new sap.ui.model.json.JSONModel();
			//oModel.loadData("/api/Masterdata/"+masterdataId+"/MasterdataPerson/"+selectedItemId+"/default", '', true, 'PUT', null, false, null);
			
			this.getView().getModel("masterdata").setProperty("/group", selectedItemId);
			
			//console.log('group:');
			//console.log(this.getView().getModel("masterdata").getProperty("/group"));
			
			sap.m.MessageToast.show("Action onSelectionChangeGroup triggered on item: " + selectedItem.data("masterdataGroupId"));
	
		},
		onSelectionChangePeople : function(oEvent){
			var oItem;
			oItem = oEvent.getSource();	    
		    var selectedItem = oEvent.getParameter("listItem");
		    
			var selectedItemId = selectedItem.data("masterdataPersonId");
			
		    var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/Masterdata/"+masterdataId+"/Person/"+selectedItemId+"/default", '', true, 'PUT', null, false, null);
			
			sap.m.MessageToast.show("Action onSelectionChangePeople triggered on item: " + selectedItem.data("masterdataPersonId"));
	
		},
		onSelectionChangeShippingAddress : function(oEvent){
			var oItem;
			oItem = oEvent.getSource();	    
		    var selectedItem = oEvent.getParameter("listItem");
		    
			var selectedItemId = selectedItem.data("masterdataShippingAddressId");
			
		    var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/Masterdata/"+masterdataId+"/ShippingAddress/"+selectedItemId+"/default", '', true, 'PUT', null, false, null);
			
			sap.m.MessageToast.show("Action onSelectionChangeShippingAddress triggered on item: " + selectedItem.data("masterdataShippingAddressId"));
	
		},
		onSelectionChangeBankAccount : function(oEvent){
			var oItem;
			oItem = oEvent.getSource();	    
		    var selectedItem = oEvent.getParameter("listItem");
		    
			var selectedItemId = selectedItem.data("masterdataBankAccountId");
			
		    var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/Masterdata/"+masterdataId+"/BankAccount/"+selectedItemId+"/default", '', true, 'PUT', null, false, null);
			
			sap.m.MessageToast.show("Action onSelectionChangeBankAccount triggered on item: " + selectedItem.data("masterdataBankAccountId"));
	
		},
		onSelectionChangeVehicle : function(oEvent){
			var oItem;
			oItem = oEvent.getSource();	    
		    var selectedItem = oEvent.getParameter("listItem");
		    
			var selectedItemId = selectedItem.data("masterdataVehicleId");
			
		    var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/Masterdata/"+masterdataId+"/Vehicle/"+selectedItemId+"/default", '', true, 'PUT', null, false, null);
			
			sap.m.MessageToast.show("Action onSelectionChangeVehicle triggered on item: " + selectedItem.data("masterdataVehicleId"));
	
		},
		onDeletePeople : function(oEvent){
			//Set list mode to delete
			this.byId("PeopleList").setMode('Delete');
		},
		onDeletePerson : function(oEvent){
			//Get selected object
			var oList = oEvent.getSource(),
			selectedItem = oEvent.getParameter("listItem");
			
			//Get id of selected object
			var selectedItemId = selectedItem.data("masterdataPersonId");
			
			//Delete on server by id of selected object
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/Person/"+selectedItemId, '', true, 'DELETE', null, false, null);
			
			//Set list mode back
			this.byId("PeopleList").setMode('SingleSelectLeft');
			
			// after deletion put the focus back to the list
			oList.attachEventOnce("updateFinished", oList.focus, oList);
			
			//reload list from server
			var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+masterdataId+"/Person", false);
			this.getView().setModel(oModel,"masterdata_people"); 
			
			//Toast a message
			sap.m.MessageToast.show("Action onDeletePerson triggered on item: "+selectedItemId);
		},
		onDeleteShippingAddresses : function(oEvent){
			//Set list mode to delete
			this.byId("ShippingAddressesList").setMode('Delete');
		},
		onDeleteShippingAddress : function(oEvent){
			//Get selected object
			var oList = oEvent.getSource(),
			selectedItem = oEvent.getParameter("listItem");
			
			//Get id of selected object
			var selectedItemId = selectedItem.data("masterdataShippingAddressId");
			
			//Delete on server by id of selected object
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/ShippingAddress/"+selectedItemId, '', true, 'DELETE', null, false, null);
			
			//Set list mode back
			this.byId("ShippingAddressesList").setMode('SingleSelectLeft');
			
			// after deletion put the focus back to the list
			oList.attachEventOnce("updateFinished", oList.focus, oList);
			
			//reload list from server
			var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+masterdataId+"/ShippingAddress", false);
			this.getView().setModel(oModel,"masterdata_shipping_addresses"); 
			
			//Toast a message
			sap.m.MessageToast.show("Action onDeleteShippingAddress triggered on item: "+selectedItemId);
		},
		onDeleteBankAccounts : function(oEvent){
			//Set list mode to delete
			this.byId("BankAccountsList").setMode('Delete');
		},
		onDeleteBankAccount : function(oEvent){
			//Get selected object
			var oList = oEvent.getSource(),
			selectedItem = oEvent.getParameter("listItem");
			
			//Get id of selected object
			var selectedItemId = selectedItem.data("masterdataBankAccountId");
			
			//Delete on server by id of selected object
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/BankAccount/"+selectedItemId, '', true, 'DELETE', null, false, null);
			
			//Set list mode back
			this.byId("BankAccountsList").setMode('SingleSelectLeft');
			
			// after deletion put the focus back to the list
			oList.attachEventOnce("updateFinished", oList.focus, oList);
			
			//reload list from server
			var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+masterdataId+"/BankAccount", false);
			this.getView().setModel(oModel,"masterdata_bank_account"); 
			
			//Toast a message
			sap.m.MessageToast.show("Action onDeleteBankAccount triggered on item: "+selectedItemId);
		},
		onDeleteVehicles : function(oEvent){
			//Set list mode to delete
			this.byId("VehiclesList").setMode('Delete');
		},
		onDeleteVehicle : function(oEvent){
			//Get selected object
			var oList = oEvent.getSource(),
			selectedItem = oEvent.getParameter("listItem");
			
			//Get id of selected object
			var selectedItemId = selectedItem.data("masterdataVehicleId");
			
			//Delete on server by id of selected object
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/Vehicle/"+selectedItemId, '', true, 'DELETE', null, false, null);
			
			//Set list mode back
			this.byId("VehiclesList").setMode('SingleSelectLeft');
			
			// after deletion put the focus back to the list
			oList.attachEventOnce("updateFinished", oList.focus, oList);
			
			//reload list from server
			var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+masterdataId+"/Vehicle", false);
			this.getView().setModel(oModel,"masterdata_vehicles"); 
			
			//Toast a message
			sap.m.MessageToast.show("Action onDeleteVehicle triggered on item: "+selectedItemId);
		},
		onDelete: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var dialog = new sap.m.Dialog({
				title: oBundle.getText("deleteMasterdata"),
				type: 'Message',
				content: new sap.m.Text({ text: oBundle.getText("deleteMasterdataDialog") }),
				beginButton: new sap.m.Button({
					text: oBundle.getText("delete"),
					press: function () {
						
						//Delete on server by id of selected object
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.loadData("/api/Masterdata/"+masterdataId, '', true, 'DELETE', null, false, null);

						oRouter.navTo("masterdata-search", {
							masterdataId: masterdataId
						});
						sap.m.MessageToast.show(oBundle.getText("deleted"));
						dialog.destroy();
					}
				}),
				endButton: new sap.m.Button({
					text: oBundle.getText("cancel"),
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					
					//
					
				}
			});

			dialog.open();
		}
		
		
		
		
	});
 
 
	return PageController;
 
});