sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		"sap/ui/core/routing/History"
	], function(jQuery, Controller, JSONModel, History) {
	"use strict";
	var Id = 0;
	var masterdataId = 0;
	var post_put = '';
	var PageController = Controller.extend("sap.ui.bw.bozwo.controller.MasterdataShippingAddress", {
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("masterdata-shipping-address-edit").attachMatched(this._onRouteMatchedEdit, this);
			oRouter.getRoute("masterdata-shipping-address-add").attachMatched(this._onRouteMatchedAdd, this);
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
			
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("loadingData")

	  			});
		
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/ShippingAddress/"+oArgs.Id, false);
			this.getView().setModel(oModel,"address"); 
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});


			oView.bindElement({
				path : "/masterdata-shipping-address-edit(" + oArgs.Id + ")",
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
			
			
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("loadingData")

	  			});
			
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/ShippingAddress/"+Id, false);
			
			this.getView().setModel(oModel,"address"); 
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});

			
			
			
			
			
			oView.bindElement({
				path : "/masterdata-shipping-address-add(" + Id + ")",
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
			var masterdataIdNew = this.getView().getModel("address").getProperty("/masterdata_id");
			
			if (typeof masterdataIdNew === 'undefined' || masterdataIdNew === null || masterdataIdNew === '') {
    			// variable is undefined or null		
			}else{
				masterdataId = masterdataIdNew;		
			}
			
			this.getOwnerComponent().getRouter().navTo("masterdata-edit",{
				masterdataId: masterdataId
			});
		},
		onSave: function (){
			
			var oModel = new sap.ui.model.json.JSONModel();
			
			if(this.getView().getModel("address").getProperty("/masterdata_id") == 0){
				this.getView().getModel("address").setProperty("/masterdata_id", masterdataId);	
			}
			
			var oParameter = this.getView().getModel("address").getJSON();
			
			oModel.loadData("/api/ShippingAddress/"+Id, oParameter, true, post_put, null, false, null);

			sap.m.MessageToast.show("Saved "+oParameter);
			this.onNavBack();
		}
	});
 
 
	return PageController;
 
});