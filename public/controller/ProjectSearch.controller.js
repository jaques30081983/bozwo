sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
	"use strict";
	var oArgs;
	var PageController = Controller.extend("sap.ui.bw.bozwo.controller.ProjectSearch", {	
		onInit: function () {

		    this._oRouter = sap.ui.core.UIComponent.getRouterFor(this).getRoute('project-search');
			this._oRouter.attachMatched(this.onMatch, this);
			
		    this.setInitialFocus(this.byId("projectSearchField"));
				
		},		
		onMatch: function(oEvent) {
			var sQuery = this.byId("projectSearchField").getValue();

			oArgs = oEvent.getParameter("arguments");
			console.log("Dette Model", oArgs.model);
	
			if(sQuery == ""){
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				var busyDialog = new sap.m.BusyDialog({

		  			text:oBundle.getText("loadingData")

		  			});
				
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.attachRequestSent(function(){busyDialog.open();});
				
				if(oArgs.model === "upcomingProjects"){
					oModel.loadData("/api/Project/0/0/0/upcomingProjects", false);
				}else if(oArgs.model === "notInvoicedProjects"){
					oModel.loadData("/api/Project/0/0/0/notInvoicedProjects", false);

				}else{
					oModel.loadData("/api/Project/0/0/0/latest/15", false);
					
				}
				
				
				oModel.attachRequestCompleted(function(){busyDialog.close();});
				oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
				
				this.getView().setModel(oModel);
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
		onSearchProject : function (oEvent) {
			console.log("Search triggered...")
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("searchingData")

	  			});
			
			var sQuery = this.byId("projectSearchField").getValue();
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/Project/0/0/0/search/name="+sQuery+"&description="+sQuery, false);
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			this.getView().setModel(oModel); 
	
		},

		onGetNotInvoicedProject : function (oEvent) {
			oArgs.model = "notInvoicedProjects";
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("loadingData")

	  			});
			
			var sQuery = this.byId("projectSearchField").getValue();
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/Project/0/0/0/notInvoicedProjects", false);
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			this.getView().setModel(oModel); 
	
		},

		onUpcomingProject : function (oEvent) {
			oArgs.model = "upcomingProjects";
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("loadingData")

	  			});
			
			var sQuery = this.byId("projectSearchField").getValue();
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/Project/0/0/0/upcomingProjects", false);
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			this.getView().setModel(oModel); 
	
		},
		 
		onPress : function(oEvent){
			var oItem;
			oItem = oEvent.getSource();
			//oCtx = oItem.getBindingContext();
			//sap.m.MessageToast.show("Action triggered on item: " + oItem.data("projectId"));
			
			this.getOwnerComponent().getRouter().navTo("project-edit",{
				Id: oItem.data("projectId"),
				masterdataId: '0',
				origin: 'project-search',
				model: oArgs.model
				
			});
		},
		onAddProject: function (oEvent){

				var oItem;
				oItem = oEvent.getSource();
				sap.m.MessageToast.show("Action onAddProject triggered on item: ");
				this.getOwnerComponent().getRouter().navTo("overview",{
					projectId: '0',
					masterdataId: '0',
					origin: 'project-search'
				});
		}

	});
 
 
	return PageController;
 
});