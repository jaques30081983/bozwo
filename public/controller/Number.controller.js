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
	var PageController = Controller.extend("sap.ui.bw.bozwo.controller.Number", {
		formatter: formatter,
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("number-edit").attachMatched(this._onRouteMatchedEdit, this);
			oRouter.getRoute("number-add").attachMatched(this._onRouteMatchedAdd, this);
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
		_onRouteMatchedEdit : function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oArgs, oView;
			post_put = 'PUT';
			oArgs = oEvent.getParameter("arguments");
			oView = this.getView();
			Id = oArgs.Id;
			origin = oArgs.origin;
			
			console.log(origin);
			
			this.byId("numberResult").setValue('');
			
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("loadingData")

	  			});
		
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/NumberObject/"+oArgs.Id, false);
			this.getView().setModel(oModel,"number");
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/MasterdataGroup/0/Masterdata/0/role/company", false);
			this.getView().setModel(oModel,"masterdata");
			
			var parent = this;
			oModel.attachRequestCompleted(function(){
				busyDialog.close();
				parent.onLiveChange();
			});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});

			oView.bindElement({
				path : "/number-edit(" + oArgs.Id + ")",
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
			this.byId("numberResult").setValue('');
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("loadingData")

	  			});
			
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/NumberObject/"+Id, false);
			
			this.getView().setModel(oModel,"number"); 
			
			var parent = this;
			oModel.attachRequestCompleted(function(){
				busyDialog.close();
				parent.getView().getModel("number").setProperty("/reset", 0);
				parent.getView().getModel("number").setProperty("/masterdata_id", 0);
				parent.getView().getModel("number").setProperty("/current_year", 1970);
				parent.getView().getModel("number").setProperty("/sequential_number", 0);
				parent.getView().getModel("number").setProperty("/length", 6);
			});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});

			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/MasterdataGroup/0/Masterdata/0/role/company", false);
			this.getView().setModel(oModel,"masterdata");
			
			
			
			oView.bindElement({
				path : "/number-add(" + Id + ")",
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
	    onLiveChange: function(event) {
			var pattern= this.byId("patternInput").getValue();
	    	var number= this.byId("numberInput").getValue();
	    	var length= this.byId("lengthInput").getValue();
	    	
	    	var oModelTest = new sap.ui.model.json.JSONModel();
	    	
			
			//Number

			oModelTest.loadData("/api/NumberObject/"+Id+"/0/0/number/test=true&pattern="+pattern+"&length="+length+"&sequential_number="+number, null, true, 'GET', null, false, null);
			
			
			
			var parent = this;
			this.byId("numberResult").setValue('wait...');
			oModelTest.attachRequestCompleted(function(){
				var test_number = oModelTest.getProperty("/number");
				parent.byId("numberResult").setValue(test_number);
				
			});
			/*
	    		
	    	//var thisRegex = new RegExp('#+(number)+#');
	    	var text= this.getView().getModel("number").getProperty("/pattern")
	    	
	    	var number= this.getView().getModel("number").getProperty("/sequential_number")
	    	var length= this.getView().getModel("number").getProperty("/length")
	    	number.pad(length);
			var fixed = text.replace(/#+(number)+#/,number);
	    	
	    	this.byId("numberResult").setValue(fixed);
	    	*/
	    	
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
			
			var masterdataIdNew = this.getView().getModel("number").getProperty("/masterdata_id");
			
			if (typeof masterdataIdNew === 'undefined' || masterdataIdNew === null || masterdataIdNew === '') {
    			// variable is undefined or null		
			}else{
				masterdataId = masterdataIdNew;		
			}
			
			
			this.getOwnerComponent().getRouter().navTo(origin,{
				masterdataId: masterdataId
			});
			
		},
		onSave: function (){
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oModel = new sap.ui.model.json.JSONModel();
			

			
			//Number
			var oParameter = this.getView().getModel("number").getJSON();
			oModel.loadData("/api/NumberObject/"+Id, oParameter, true, post_put, null, false, null);
			

			oModel.attachRequestCompleted(function(){

			
			sap.m.MessageToast.show(oBundle.getText("saved"));
			});
			this.onNavBack();
			
			
		}
	});
 
 
	return PageController;
 
});