sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/ui/bw/bozwo/util/formatter',
		'sap/ui/bw/bozwo/util/api',
		'sap/ui/model/Filter',
		'sap/ui/core/routing/History'
	], function(Controller, JSONModel, formatter, api, Filter, History) {
	"use strict";

	var PageController = Controller.extend("sap.ui.bw.bozwo.controller.DocumentSearch", {
		formatter: formatter,
		onInit: function () {
		
			var oViewModel = new JSONModel({
				currency: "EUR"
			});
			this.getView().setModel(oViewModel, "view");

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this).getRoute('document-search');
			this._oRouter.attachMatched(this.onMatch, this);
	
		    this.setInitialFocus(this.byId("documentSearchField"));
				
		},	
		onMatch: function(oEvent) {
            var sQuery = this.byId("documentSearchField").getValue();
            
            var oArgs = oEvent.getParameter("arguments");
            var oDocumentModel = oArgs.model;



            var oModel0 = new JSONModel([
				{model:oDocumentModel}
			]);
			this.getView().setModel(oModel0,"document_selectedKey");

			//TODO i18n
			//Set models
			var oModel0 = new JSONModel([
				{id:"1", name: "Vermietung - Selbstabholer"},
				{id:"2", name: "Vermietung - Mit Lieferung"},
				{id:"3", name: "Nur Resourcen"},
				{id:"4", name: "Full-Service"},
				{id:"5", name: "Verkauf"}
			]);
			this.getView().setModel(oModel0,"types");
			
			//Search
			if(sQuery === ""){
				console.log("onMatch triggered",oDocumentModel);
	
				var oModel = api.callApi(this,oDocumentModel+"/0/0/0/latest/15", null,'GET');
				this.getView().setModel(oModel);
			}else{
				this.onSearchDocuments();
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
		onSearchDocuments : function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("searchingData")

	  			});
			
            var sQuery = this.byId("documentSearchField").getValue();
            var oDocumentModel=this.byId("filterSelect").getSelectedKey();

            //Get Document model
            /*	
            var oDocumentsModel = this.getView().getModel("documents").getData(); 
            for (var key in oDocumentsModel) {
                if(documentId == oDocumentsModel[key]['id']){
                    var oDocumentModel = oDocumentsModel[key]['model'];
                }
            }
            */
            console.log(oDocumentModel);
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/"+oDocumentModel+"/0/0/0/search/number="+sQuery, false);
			
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			this.getView().setModel(oModel); 
			
			
			//Set filter
			/*
			console.log('Selected ID:', documentId);
	        this.byId("searchResultList").getBinding("items").filter(documentId ? new Filter({
		          path: "documents",
		          operator: "EQ",
		          value1: documentId,
		        }) : null);
	*/
		},
		 
		onPress : function(oEvent){
			var oItem;
			oItem = oEvent.getSource();
            var id = oItem.data("documentId");

            //Get Document model
            var oDocumentModel=this.byId("filterSelect").getSelectedKey();	
            /*
            var oDocumentsModel = this.getView().getModel("documents").getData(); 
            for (var key in oDocumentsModel) {
                if(documentId == oDocumentsModel[key]['id']){
                    var oDocumentModel = oDocumentsModel[key]['model'];
                }
            }
            */


			sap.m.MessageToast.show("Action triggered on item: " + id);
			this.getOwnerComponent().getRouter().navTo("document",{
                Id: id,
                model: oDocumentModel,
                origin: "document-search"
			});
		},	
		onSetFilter: function(oEvent) {
	        //var documentId = oEvent.getSource().getSelectedKey();
	        var documentId=oEvent.getParameter("selectedItem").getKey();
	        console.log('ID:', documentId);
	        this.byId("searchResultList").getBinding("items").filter(documentId ? new Filter({
	          path: "documents",
	          operator: "EQ",
	          value1: documentId,
	        }) : null);
	      },
		  onNewDocument : function(oEvent){
			var oModelDocument = new JSONModel();
			  oModelDocument.setData({
				  "transaction_id":0,
				  "project_id": 0,
				  "subproject_id": 0,
				  "masterdata_id": 0,
				  "person_id": 0,
				  "masterdata_name": '',
				  "number": '',
				  "type": 0,
				  "payment_method_id": 0,
				  "payment_term_id": 0,
				  "total": 0,
				  "discount_id": 0,
				  "discount": 0
				  });
			  this.getView().setModel(oModelDocument,"document");
			  
			  //Customer
				var oModelCustomer = new JSONModel();
				this.getView().setModel(oModelCustomer,"customer");

			  //Open document add dialog
			  var oView = this.getView();
			  var oDialog = oView.byId("documentAddDialog");
			  
			  if (!oDialog) {
				  // create dialog via fragment factory
				  oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bw.bozwo.fragment.DocumentAddDialog", this);
				  // connect dialog to view (models, lifecycle)
				  oView.addDependent(oDialog);
			  }
			  oDialog.open();
		  },
		  onCloseDocumentAddDialog: function(oEvent) {
			  this.byId("documentAddDialog").close();
		  },
		  onAddDocument : function(oEvent){
			  this.byId("documentAddDialog").close();
			  var oDocumentModel=this.byId("filterSelect").getSelectedKey();

			  /*
			  //Create busy Dialog
			  var oBundle = this.getView().getModel("i18n").getResourceBundle();
			  var busyDialog = new sap.m.BusyDialog({
  
				  text:oBundle.getText("savingData")
  
					});
			 
			  //Create Model
			  var oModel = new sap.ui.model.json.JSONModel();
			  oModel.attachRequestSent(function(){busyDialog.open();});
			  
			  var oParameter = this.getView().getModel("document").getJSON();
			  

			  //Post to backend
			  oModel.loadData("/api/"+oDocumentModel+"/0", oParameter, true, 'POST', null, false, null);
			  
			  var parent = this;
			  oModel.attachRequestCompleted(function(){
				  busyDialog.close();   
			  });	
			  //oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			  
			  */
			 //Post to api 
			 var oParameter = this.getView().getModel("document").getJSON();
			 var oModel = api.callApi(this,oDocumentModel+"/0",oParameter,'POST');
			 

			//On request completed
			 var parent = this;
			  oModel.attachRequestCompleted(function(){
	
				//Nav to created document
				var newId = oModel.getProperty("/modelId");
				parent.getOwnerComponent().getRouter().navTo("document",{
					Id: newId,
					model: oDocumentModel,
					origin: "document-search"
				});
				  

			  });	
			  
			  
			  
		  },
		handleSelectMasterdataDialogPress: function (oEvent) {
			var oView = this.getView();
			var oDialog = oView.byId("masterdataSelectDialog");
			
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bw.bozwo.fragment.MasterdataSelectDialog", this);
				// connect dialog to view (models, lifecycle)
				oView.addDependent(oDialog);
			}
			oDialog.open();
		},
		handleMasterdataSearch: function(oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("searchingData")

	  			});
			
			//var sQuery = this.byId("masterdataComboBox").getValue();
			var sQuery = oEvent.getParameter("value");
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/Masterdata/0/0/0/search/first_name="+sQuery+"&last_name="+sQuery+"&company_name_1="+sQuery+"&company_name_2="+sQuery+"&zip="+sQuery, false);
			
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			this.getView().setModel(oModel,"masterdata"); 
		},

		handleMasterdataClose: function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			
			var masterdata_id = aContexts.map(function(oContext) { return oContext.getObject().id; }).join(", ");
			var company_name_1 = aContexts.map(function(oContext) { return oContext.getObject().company_name_1; }).join(", ");
			var company_name_2 = aContexts.map(function(oContext) { return oContext.getObject().company_name_2; }).join(", ");
			var first_name = aContexts.map(function(oContext) { return oContext.getObject().first_name; }).join(", ");
			var last_name = aContexts.map(function(oContext) { return oContext.getObject().last_name; }).join(", ");
			var payment_term_id = aContexts.map(function(oContext) { return oContext.getObject().payment_term_id; }).join(", ");
			var payment_method_id = aContexts.map(function(oContext) { return oContext.getObject().payment_method_id; }).join(", ");
			var discount_id = aContexts.map(function(oContext) { return oContext.getObject().discount_id; }).join(", ");
			
			this.getView().getModel("document").setProperty("/masterdata_id", masterdata_id);
			this.getView().getModel("customer").setProperty("/customer_name", company_name_1+" "+company_name_2+" "+first_name+" "+last_name);
			//TODO set default person
			this.getView().getModel("document").setProperty("/person_id", 0);
			this.getView().getModel("document").setProperty("/payment_method_id", payment_method_id);
			this.getView().getModel("document").setProperty("/payment_term_id", payment_term_id);
			this.getView().getModel("document").setProperty("/discount_id", discount_id);
			
			//People
			var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+masterdata_id+"/Person", false);
			this.getView().setModel(oModel,"customer_people"); 
			
			//Shipping Addresses
			var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+masterdata_id+"/ShippingAddress", false);
			this.getView().setModel(oModel,"masterdata_shipping_addresses"); 
			
			if (aContexts && aContexts.length) {
				sap.m.MessageToast.show("You have chosen " + company_name_1+" "+company_name_2+" "+first_name+" "+last_name);
			} else {
				sap.m.MessageToast.show("No new item was selected.");
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		onNavBack: function () {
			
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("overview", true);
			}

			
		}

	});
 
 
	return PageController;
 
});