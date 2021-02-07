sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (jQuery, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.ui.bw.bozwo.controller.NumberSearch", {
		onInit: function () {
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("number-search").attachMatched(this.onMatch, this);

			this.setInitialFocus(this.byId("numberSearchField"));

		},
		onMatch: function () {
			var sQuery = this.byId("numberSearchField").getValue();

			if (sQuery == "") {
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				var busyDialog = new sap.m.BusyDialog({

					text: oBundle.getText("loadingData")

				});

				var oModel = new sap.ui.model.json.JSONModel();
				oModel.attachRequestSent(function () { busyDialog.open(); });
				oModel.loadData("/api/NumberObject", false);
				oModel.attachRequestCompleted(function () { busyDialog.close(); });
				oModel.attachRequestFailed(function () { sap.m.MessageToast.show(oBundle.getText("sessionEnded")); sap.m.URLHelper.redirect("/login"); });

				this.getView().setModel(oModel);
			} else {
				this.onSearchNumbers();
			}


		},
		setInitialFocus: function (control) {
			this.getView().addEventDelegate({
				onAfterShow: function () {
					setTimeout(function () {
						control.focus();
					}.bind(this), 0);
				},
			}, this);
		},
		onSearchNumbers: function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

				text: oBundle.getText("searchingData")

			});

			var sQuery = this.byId("numberSearchField").getValue();

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function () { busyDialog.open(); });
			oModel.loadData("/api/NumberObject/0/0/0/search/name=" + sQuery + "&description=" + sQuery, false);
			oModel.attachRequestCompleted(function () { busyDialog.close(); });
			oModel.attachRequestFailed(function () { sap.m.MessageToast.show(oBundle.getText("sessionEnded")); sap.m.URLHelper.redirect("/login"); });

			this.getView().setModel(oModel);

		},

		onPress: function (oEvent) {
			var oItem;
			oItem = oEvent.getSource();
			//oCtx = oItem.getBindingContext();
			sap.m.MessageToast.show("Action triggered on item: " + oItem.data("numberId"));
			this.getOwnerComponent().getRouter().navTo("number-edit", {
				Id: oItem.data("numberId"),
				origin: 'number-search'

			});
		},
		onAddNumber: function (oEvent) {

			var oItem;
			oItem = oEvent.getSource();
			sap.m.MessageToast.show("Action onAddNumber triggered on item: ");
			this.getOwnerComponent().getRouter().navTo("number-add", {
				numberId: '0',
				origin: 'number-search'
			});
		}

	});


	return PageController;

});