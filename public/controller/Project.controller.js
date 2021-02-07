sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		"sap/ui/core/routing/History",
		"sap/ui/bw/bozwo/util/formatter",
		"sap/ui/bw/bozwo/util/api",
		"sap/ui/bw/bozwo/util/email",
		"sap/ui/bw/bozwo/util/letter",
		"sap/m/PDFViewer",
		'sap/m/Dialog',
		'sap/m/Button',
		'sap/m/Text',
		"sap/ui/model/Filter"
	], function(jQuery, Controller, JSONModel, History, formatter, api, email, letter, PDFViewer, Dialog, Button, Text, Filter) {
	"use strict";
	
	sap.ui.model.SimpleType.extend("sap.ui.model.type.Boolean", {
		formatValue: function(oValue) {
		if (oValue === 1) {
		return true;
		} if (oValue === null || oValue === 0)
		{ return false; }
		},
		parseValue: function(oValue) {
		if (oValue === true) {
		return 1; }
		else if (oValue === false) {
		return 0;
		}
		},
		validateValue: function(oValue) {
		return oValue;
		}
		});
	
	var Id = 0;
	var subprojectId = 0;
	var masterdataId = 0;
	var origin = '';
	var originModel = 'none';
	var post_put = '';
	var inputAmount = '';
	var inputAmountParsed = '1.00';
	var projectDataChanged = false;
	var subprojectDataChanged = false;
	var projectOrSubprojectSelected = false;
	
	var PageController = Controller.extend("sap.ui.bw.bozwo.controller.MasterdataProject", {
		formatter: formatter,
		
		onInit: function () {
			this._pdfViewer = new PDFViewer();
			this.getView().addDependent(this._pdfViewer);
			
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("project-edit").attachMatched(this._onRouteMatchedEdit, this);
			oRouter.getRoute("project-add").attachMatched(this._onRouteMatchedAdd, this);

	        var oViewModel = new JSONModel({id: sap.ui.bw.bozwo.User.id, people_id: sap.ui.bw.bozwo.User.people_id, name: sap.ui.bw.bozwo.User.name});
            this.getView().setModel(oViewModel,"user");
			
		},
	    onAfterRendering: function() {
	        var number; 
	    	jQuery(document).on("keydown",
	           function(evt) {
	    		//Check origin
	    		var tag = evt.target.tagName.toLowerCase();
	    	
	    		if (tag == 'input' || tag == 'textarea') {
	    			//Nothing
	    		}else{
		            //Number pressed 
		    		if (evt.keyCode == 48 || evt.keyCode == 96) {
		            	 number = '0';
		             }else if(evt.keyCode == 49 || evt.keyCode == 97){
		            	 number = '1';
		             }else if(evt.keyCode == 50 || evt.keyCode == 98){
		            	 number = '2';
		             }else if(evt.keyCode == 51 || evt.keyCode == 99){
		            	 number = '3';
		             }else if(evt.keyCode == 52 || evt.keyCode == 100){
		            	 number = '4';
		             }else if(evt.keyCode == 53 || evt.keyCode == 101){
		            	 number = '5';
		             }else if(evt.keyCode == 54 || evt.keyCode == 102){
		            	 number = '6';
		             }else if(evt.keyCode == 55 || evt.keyCode == 103){
		            	 number = '7';
		             }else if(evt.keyCode == 56 || evt.keyCode == 104){
		            	 number = '8';
		             }else if(evt.keyCode == 57 || evt.keyCode == 105){
		            	 number = '9';
		             }else if(evt.keyCode == 188 || evt.keyCode == 190 || evt.keyCode == 108){
		            	 number = '.';
		             }else{
		            	 number = 'abc';
		             }
		             
		    		//ESC pressed
		    		if (evt.keyCode == 27) {
		            	 number = '1';
		            	 inputAmountParsed = '1.00';
		            	 inputAmount = '';
		            	 sap.m.MessageToast.show('reset');
		             }else{
		            	//Concat
			    		if(number != 'abc'){
			            	inputAmount = inputAmount.toString()+number;
					    	inputAmountParsed = parseFloat(inputAmount).toFixed(2);
					    	sap.m.MessageToast.show(inputAmountParsed.toString());
			    		}
			    			
			    		
			    		
		             }
		             //console.log('Pressed:',evt.keyCode,' Amount:',inputAmountParsed.toString(), ' Number:',number);
		             //sap.m.MessageToast.show('Pressed:'+evt.keyCode.toString()+' Number:'+number+'Amount:'+inputAmountParsed.toString());
		             
		             
	    			}
	    		});
	       
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
			originModel = oArgs.model;
			
			console.log(origin);
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("loadingData")

	  			});
			
			//Nav to Project
			this.byId("projectNavCon").to(this.byId("projectPage"));
			
			   
			
			//Set Models
			var oModel0 = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel0,"search");
			
			
			//TODO i18n
			var oModel0 = new JSONModel([
				{id:"1", name: "Vermietung - Selbstabholer"},
				{id:"2", name: "Vermietung - Mit Lieferung"},
				{id:"3", name: "Nur Resourcen"},
				{id:"4", name: "Full-Service"},
				{id:"5", name: "Verkauf"}
			]);
			this.getView().setModel(oModel0,"types");
			

			//TODO i18n
			var oModel1 = new JSONModel([
				{id:"1", name: "Angebot"},
				{id:"2", name: "Bestätigt"},
				{id:"3", name: "Abgesagt"}
			]);
			this.getView().setModel(oModel1,"statuses");
			
			
			var oModel2 = new JSONModel([
				{id:"1", name: "Überschrift"},
				{id:"2", name: "Zwischensumme"},
				{id:"3", name: "Rabatt"},
				{id:"4", name: "Rabatt Kategorie"},
				{id:"5", name: "Freier Text"}
			]);
			this.getView().setModel(oModel2,"miscellaneousList");
			
			//TODO i18n
			var oModel3 = new JSONModel([
				{id:"1", name: "Angedacht"},
				{id:"2", name: "Anfrage"},
				{id:"3", name: "Bestätigt"},
				{id:"4", name: "Abgesagt"}
			]);
			this.getView().setModel(oModel3,"resourceStatuses");
			
			//var oModel = new sap.ui.model.json.JSONModel();
			//oModel.attachRequestSent(function(){busyDialog.open();});
			//oModel.loadData("/api/Project/"+oArgs.Id, false);
			var oModelProject = api.callApi(this,"Project/"+oArgs.Id);
			oModelProject.attachRequestSent(function(){busyDialog.open();});
			this.getView().setModel(oModelProject,"project");
			
			
			//Observe Project models
			var oBindingModel = new sap.ui.model.Binding(oModelProject, "/", oModelProject.getContext("/"));
			oBindingModel.attachChange(function(){
				console.log('Project Model changed');



			});
			
			var oModel1 = new sap.ui.model.json.JSONModel();
			oModel1.loadData("/api/Project/"+oArgs.Id+"/ProjectResource", false);
			
			
			var parent = this;
			oModel1.attachRequestCompleted(function(){	
				var oData = oModel1['oData'];
				var oDataNew = [];
				for (var key in oData) {
					if(oData[key]['ref_id']== 0){
						var oItemsNew = [];
						for (var key2 in oData) {
							if(oData[key2]['ref_id']== oData[key]['id']){
								oItemsNew.push(oData[key2]);
							}
						}
						oData[key]['items']=oItemsNew;
						oDataNew.push(oData[key]);	
					}
				}
				oModel1.setData(oDataNew);
				parent.getView().setModel(oModel1,"projectResource");
			});
			
			//var oModel = new sap.ui.model.json.JSONModel();
			//oModel.loadData("/api/MasterdataGroup/0/Masterdata/0/role/customer", false);
			//this.getView().setModel(oModel,"masterdata");
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/MasterdataGroup/0/Masterdata/0/role/company", false);
			this.getView().setModel(oModel,"masterdata_company");
			
			//var oModel = new sap.ui.model.json.JSONModel();
			//oModel.loadData("/api/MasterdataGroup/0/Masterdata/0/role/customer,supplier", false);
			//this.getView().setModel(oModel,"customer");
			

			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/Project/"+Id+"/0/0/project_tree", false);
			this.getView().setModel(oModel,"projectTree");
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/InventoryCategory/0/0/0/tree", false);
			this.getView().setModel(oModel,"inventoryTree");
			
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/PeopleGroup/0/Person/0/role/employee", false);
			this.getView().setModel(oModel,"people");

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/Vehicle", false);
			this.getView().setModel(oModel,"vehicle");
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/ResourceType/0/0/0/role/person", false);
			this.getView().setModel(oModel,"employeeList");
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/ResourceType/0/0/0/role/vehicle", false);
			this.getView().setModel(oModel,"vehicleList");
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/Document", false);
			this.getView().setModel(oModel,"documents");

			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/Project/"+Id+"/0/0/relatedDocuments", false);
			this.getView().setModel(oModel,"project_documents");
			
			
			var parent = this;
			
			oModel.attachRequestCompleted(function(){
				var masterdataId = parent.getView().getModel("project").getProperty("/customer_id");
				var projectStartDate = parent.getView().getModel("project").getProperty("/start_date_time");
				
				//Expand project tree
				parent.byId("projectTree").expandToLevel(1);
				
				//Customer
				var oModelCustomer = new sap.ui.model.json.JSONModel("/api/Masterdata/"+masterdataId, false);
				parent.getView().setModel(oModelCustomer,"customer"); 
				
					oModelCustomer.attachRequestCompleted(function(){
						var company_name_1 = parent.getView().getModel("customer").getProperty("/company_name_1");
						var company_name_2 = parent.getView().getModel("customer").getProperty("/company_name_2");
						var first_name = parent.getView().getModel("customer").getProperty("/first_name");
						var last_name = parent.getView().getModel("customer").getProperty("/last_name");
						var payment_method_id = parent.getView().getModel("customer").getProperty("/payment_method_id");
						var payment_term_id = parent.getView().getModel("customer").getProperty("/payment_term_id");
						var oAttendees = parent.getView().getModel("project").getProperty("/attendees");
						//this.getView().getModel("project").setProperty("/customer_id", masterdata_id);
						parent.getView().getModel("customer").setProperty("/customer_name", company_name_1+" "+company_name_2+" "+first_name+" "+last_name);
						
						if(parent.getView().getModel("project").getProperty("/payment_method_id") <= 1){
							parent.getView().getModel("project").setProperty("/payment_method_id", payment_method_id);
						}
						if(parent.getView().getModel("project").getProperty("/payment_term_id") <= 1){
							parent.getView().getModel("project").setProperty("/payment_term_id", payment_term_id);
						}
						//this.getView().getModel("project").setProperty("/customer_person_id", 0);


						//Attendees
						parent.getView().byId("projectAddMultiComboBox").setSelectedKeys(oAttendees.split(','));
						
			 			
						
						
					});
				

				//People
				var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+masterdataId+"/Person", false);
				parent.getView().setModel(oModel,"customer_people"); 
				
				//Shipping Addresses
				var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+masterdataId+"/ShippingAddress", false);
				parent.getView().setModel(oModel,"masterdata_shipping_addresses"); 
				
				//Document preview
				parent.getView().getModel("documents").setProperty("/preview",1);
				
				/*
	 			var oStartDate = new Date(projectStartDate);
				var oEndDate = new Date(oStartDate);
				
				oStartDate.setDate(oStartDate.getDate() - 2); // Set now - 2 days as the new date
				oEndDate.setDate(oEndDate.getDate() + 40); // Set now + 30 days as the new date
					
				var oStartDateFormat =
					oStartDate.getFullYear() + "-" +
				    ("0" + (oStartDate.getMonth()+1)).slice(-2) + "-" +
				    ("0" + oStartDate.getDate()).slice(-2);

				var oEndDateFormat =
					oEndDate.getFullYear() + "-" +
				    ("0" + (oEndDate.getMonth()+1)).slice(-2) + "-" +
				    ("0" + oEndDate.getDate()).slice(-2);
	 			
	 			// create model
				var oModel = new JSONModel();
				oModel.loadData("/api/Calendar/1/0/0/calendar/start="+oStartDateFormat+"&end="+oEndDateFormat, false);
				parent.getView().setModel(oModel);
				*/
				
				//parent.getView().byId("projectPlanningCalendar").setStartDate(oStartDate);
				
				busyDialog.close();
			});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});

			oView.bindElement({
				path : "/masterdata-project-edit(" + oArgs.Id + ")",
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
			originModel = oArgs.model;
			
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("loadingData")

	  			});
			
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/Project/"+Id, false);
			
			this.getView().setModel(oModel,"project"); 
			

			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/MasterdataGroup/0/Masterdata/0/role/customer", false);
			this.getView().setModel(oModel,"masterdata");
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/MasterdataGroup/0/Masterdata/0/role/customer,supplier", false);
			this.getView().setModel(oModel,"customer");
			
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/PeopleGroup/0/Person/0/role/employee", false);
			this.getView().setModel(oModel,"people");
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/PeopleGroup/0/Person/0/role/customer", false);
			this.getView().setModel(oModel,"customer_people");
			
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});

			
			
			
			
			
			oView.bindElement({
				path : "/masterdata-project-add(" + Id + ")",
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
			
			var masterdataIdNew = this.getView().getModel("project").getProperty("/masterdata_id");
			
			if (typeof masterdataIdNew === 'undefined' || masterdataIdNew === null || masterdataIdNew === '') {
    			// variable is undefined or null		
			}else{
				masterdataId = masterdataIdNew;		
			}
			
			
			this.getOwnerComponent().getRouter().navTo(origin,{
				masterdataId: masterdataId,
				model: originModel
			});
			
		},
		onChangeDate: function(oEvent){
			const modelName = oEvent.getSource().data("modelName");

			//Calculate date difference
			const oModel = this.getView().getModel(modelName);
			const days = oModel.getProperty("/days");
			var date1 = new Date(oModel.getProperty("/start_date_time"));
			var date2 = new Date(oModel.getProperty("/end_date_time"));

			//Check if end is under start date
			if(date2 <= date1){
				date2.setDate(date1.getDate()+days);
				var date_format_str = date2.getFullYear().toString()+"-"+
				((date2.getMonth()+1).toString().length==2?(date2.getMonth()+1).toString():"0"+
				(date2.getMonth()+1).toString())+"-"+
				(date2.getDate().toString().length==2?date2.getDate().toString():"0"+
				date2.getDate().toString())+" "+
				(date2.getHours().toString().length==2?date2.getHours().toString():"0"+
				date2.getHours().toString())+":"+
				(date2.getMinutes().toString().length==2?date2.getMinutes().toString():"0"+
				date2.getMinutes().toString())+":00";

				this.getView().getModel(modelName).setProperty("/end_date_time", date_format_str);
			}
			
			//Calculate date difference
			const diffTime = Math.abs(date2 - date1);
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
			console.log('Days Difference: ',date1, date2, diffDays);
			//oData['days'] = diffDays;
			//oData['days_used'] = diffDays;
			this.getView().getModel(modelName).setProperty("/days", diffDays);
			this.getView().getModel(modelName).setProperty("/days_used", diffDays);
			this.onChangeDaysUsed(oEvent);
					
		},
		onChangeDays: function(oEvent){
			const modelName = oEvent.getSource().data("modelName");
			const oModel = this.getView().getModel(modelName);
			const days = oModel.getProperty("/days");
			const daysUsed = oModel.getProperty("/days_used");
			var date1 = new Date(oModel.getProperty("/start_date_time"));
			var date2 = new Date(oModel.getProperty("/end_date_time"));

			//daysUsed should not be larger than days
			if(days <= daysUsed){
				this.getView().getModel(modelName).setProperty("/days_used", days);
				this.onChangeDaysUsed(oEvent);
			}

			
			date2.setDate(date1.getDate()+days-1);
			
			

			var date_format_str = date2.getFullYear().toString()+"-"+
			((date2.getMonth()+1).toString().length==2?(date2.getMonth()+1).toString():"0"+
			(date2.getMonth()+1).toString())+"-"+
			(date2.getDate().toString().length==2?date2.getDate().toString():"0"+
			date2.getDate().toString())+" "+
			(date2.getHours().toString().length==2?date2.getHours().toString():"0"+
			date2.getHours().toString())+":"+
			(date2.getMinutes().toString().length==2?date2.getMinutes().toString():"0"+
			date2.getMinutes().toString())+":00";

			this.getView().getModel(modelName).setProperty("/end_date_time", date_format_str);

			
			this.onChangeDaysUsed(oEvent);

		},
		onChangeDaysUsed: function(oEvent){
			const modelName = oEvent.getSource().data("modelName");
			//Calculate factor from Days used
			const oModel = this.getView().getModel(modelName);
			const oModelFactors = this.getView().getModel("factors");
			
			const days = oModel.getProperty("/days");
			var daysUsed = oModel.getProperty("/days_used");
			
			//daysUsed should not be larger than days
			if(days <= daysUsed){
				this.getView().getModel(modelName).setProperty("/days_used", days);
				daysUsed = days;
			}
	
			
			var oDataFactors = oModelFactors['oData'];
			for (var key in oDataFactors) {
				
				if(oDataFactors[key]['range_end_days'] >= daysUsed && oDataFactors[key]['range_start_days'] <= daysUsed){
					console.log('Factor:', daysUsed, oDataFactors[key]['range_start_days'],oDataFactors[key]['range_end_days'],oDataFactors[key]['factor']);
					
					var factor = oDataFactors[key]['factor'];

					//Calculate further days if needed
					if(daysUsed >= oDataFactors[key]['range_start_days']){
						var furtherDays = daysUsed - oDataFactors[key]['range_start_days'];
						var furtherFactor = oDataFactors[key]['further_factor'] * furtherDays;
						factor = parseFloat(factor) + furtherFactor;

						console.log('furtherDays, furtherFactor: ', furtherDays, furtherFactor, factor);
					}
					
					this.getView().getModel(modelName).setProperty("/factor", factor);
				}
			}

			
					
		},
		onTreeChange: function(event) {
	        if (event.getParameter("reason") == "filter") {
		          const model = this.getView().getModel("search");
		          const query = model.getProperty("/query");
		          this.byId("inventoryTree").expandToLevel(query ? 99 : 0);
		        }
		},
	    onLiveChange: function(event) {
	        const query = event.getParameter("newValue").trim();
	        this.byId("inventoryTree").getBinding("items").filter(query ? new Filter({
	          path: "name",
	          operator: "Contains",
	          value1: query,
	        }) : null);
	    },
		
		onDragStart : function (oEvent) {
			var oTree = this.byId("inventoryTree");
			var oBinding = oTree.getBinding("items");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDraggedItem = oEvent.getParameter("target");
			var iDraggedItemIndex = oTree.indexOfItem(oDraggedItem);
			var aSelectedIndices = oTree.getBinding("items").getSelectedIndices();
			var aSelectedItems = oTree.getSelectedItems();
			var aDraggedItemContexts = [];
			
			
			
			/*
			var oDepth = oDraggedItem.data("depth");
			console.log(oDepth)
			
			if (oDepth == 0) {
                oEvent.preventDefault();
            }
            */
			
			if (aSelectedItems.length > 0) {
				// If items are selected, do not allow to start dragging from a item which is not selected.
				if (aSelectedIndices.indexOf(iDraggedItemIndex) === -1) {
					oEvent.preventDefault();
				} else {
					for (var i = 0; i < aSelectedItems.length; i++) {
						aDraggedItemContexts.push(oBinding.getContextByIndex(aSelectedIndices[i]));
					}
				}
			} else {
				aDraggedItemContexts.push(oBinding.getContextByIndex(iDraggedItemIndex));
			}

			oDragSession.setComplexData("hierarchymaintenance", {
				draggedItemContexts: aDraggedItemContexts
			});
		},
        onDragEnter: function(oEvent) {
			var oDraggedControl = oEvent.getParameter("target");
	
			
			
			
			
			if(oDraggedControl.data("category_id") == null){
				//It is a Category
				console.log('Its a Cat '+oDraggedControl.data("id"));
	
			}else{
				//It is a Item
				console.log('Its a Item')
				oEvent.preventDefault();
			}
			
			
			
		},
		onTreeToItemsTreeTableDrop: function (oEvent) {
			var oTree = this.byId("itemsTreeTable");
			var oDraggedControl = oEvent.getParameter("draggedControl");
			
			if(oDraggedControl.data("category_id") == null){
				console.log('Category not to put')
			}else{
				//It is a Item, put it
				console.log('Item to put')
				
				var oModelListItem = new sap.ui.model.json.JSONModel();
				var oModelListItem = this.getView().getModel("standard_associated_items");
				
				var oModelItem = new sap.ui.model.json.JSONModel();
				var Id = this.getView().getModel("inventory").getProperty("/id");
				oModelItem.loadData("/api/InventoryStandardAssociatedItems/0", '{"ref_id":'+Id+',"inventory_id":'+oDraggedControl.data("id")+',"quantity":1}', true, 'post', null, false, null);
				
				oModelItem.attachRequestCompleted(function(){	
					var newModelItemId = oModelItem.getProperty("/modelId");
					
					console.log('Returned Model Id: '+newModelItemId);

				    var aItems = oModelListItem.getProperty("/");
				    var oNewItem =
				    {
				    	 id     : newModelItemId,
				         name     : oDraggedControl.getTitle(),
				         pivot:{quantity   : "1"}
				    };
				    aItems.push(oNewItem);
				    oModelListItem.setProperty("/", aItems); 
					
					
					
					});
						

  
			}
			
			
			
		},
		
		
		
		onDragStartSubprojectMaterial : function (oEvent) {
			var oTreeTable = this.byId("itemsTreeTable");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDraggedRow = oEvent.getParameter("target");
			var iDraggedRowIndex = oDraggedRow.getIndex();
			var aSelectedIndices = oTreeTable.getSelectedIndices();
			var aDraggedRowContexts = [];

			if (aSelectedIndices.length > 0) {
				// If rows are selected, do not allow to start dragging from a row which is not selected.
				if (aSelectedIndices.indexOf(iDraggedRowIndex) === -1) {
					oEvent.preventDefault();
				} else {
					for (var i = 0; i < aSelectedIndices.length; i++) {
						aDraggedRowContexts.push(oTreeTable.getContextByIndex(aSelectedIndices[i]));
					}
				}
			} else {
				aDraggedRowContexts.push(oTreeTable.getContextByIndex(iDraggedRowIndex));
			}

			oDragSession.setComplexData("hierarchymaintenance", {
				draggedRowContexts: aDraggedRowContexts
			});
		},
        onDragEnterSubprojectMaterial: function(oEvent) {

        	var oDraggedControl = oEvent.getParameter("target");
            var oType = oDraggedControl.getBindingContext("subprojectMaterial").getProperty("type");
        	

			if(oType == 0){
				//It is a Category
				console.log('Its a Cat');
				
			}else{
				//It is a Item
				console.log('Its a Item')
				//oEvent.preventDefault();
			}
			
			
			
		},
		onDropSubprojectMaterial: function (oEvent) {
			var oModel = this.getView().getModel("subprojectMaterial");
			
			//Draged
			var oDragSession = oEvent.getParameter("dragSession");
			var oDraggedControl = oDragSession.getDragControl();
			var oDraggedPath = oDraggedControl.getBindingContext("subprojectMaterial").getPath();
			
			//Droped
			var oDroppedRow = oEvent.getParameter("droppedControl");
			var sDropPosition = oEvent.getParameter("dropPosition");
			var oDroppedPos = oDroppedRow.getBindingContext("subprojectMaterial").getProperty("pos");
			var oDroppedPath = oDroppedRow.getBindingContext("subprojectMaterial").getPath();
				
				console.log(sDropPosition);
				console.log('-----------');
				console.log(oDroppedPos);
				console.log(oDraggedPath);
				
				console.log(oDroppedPath);
			
			// set the rank property and update the model to refresh the bindings
			//oModel.setProperty("pos", iNewRank, oDraggedRowContext);
				
				
			if(sDropPosition == 'Before'){
				var oDroppedPosParts = oDroppedPos.split('.');
				var oDroppedPosPartsNumber = oDroppedPosParts[1]-1;
				
				oModel.setProperty(oDraggedPath+"/pos", oDroppedPosParts[0]+"."+oDroppedPosPartsNumber+".9999");
				console.log('Before Pos: '+ oDroppedPosParts[0]+"."+oDroppedPosPartsNumber+".9999");
			}else if(sDropPosition == 'After'){
				oModel.setProperty(oDraggedPath+"/pos", oDroppedPos+".0");
			}else{
				console.log('What: '+sDropPosition)
				oModel.setProperty(oDraggedPath+"/pos", oDroppedPos+".0");
			}
				
			
			oModel.refresh(true);
			
			
			//Sort
			function sortByKey(array, key) {
			    return array.sort(function(a,b){
			    	var x = a[key];
			        var y = b[key];
			        
					var reA = /[^a-zA-Z]/g;
					var reN = /[^0-9]/g;
					
					x = x.toString();
					y = y.toString();
					  var aA = x.replace(/\d+/g, n => +n+100000 );
					  var bA = y.replace(/\d+/g, n => +n+100000 );
					  if (aA === bA) {
					    var aN = parseInt(x.replace(reN, ""), 10);
					var bN = parseInt(y.replace(reN, ""), 10);
					    return aN === bN ? 0 : aN > bN ? 1 : -1;
					  } else {
					    return aA > bA ? 1 : -1;
					  }
				});
			}
			
			
			
			//Renumber
			var oProperty = sortByKey(oModel.getProperty("/"),'pos');
			var count1 = 0;
			for(var i = 0; i < oProperty.length; i++) {
			    var obj = oProperty[i];
			    
			    count1++;
			    var count2 = 0;

			    //console.log(oProperty[i].id, oProperty[i].pos, oProperty[i].name);
			    
			    //oModel.setProperty('/'+i+'/pos', count1);
			    
			    //console.log(oProperty[i]['items']);
			    var oItems = sortByKey(oProperty[i]['items'],'pos');
			    
			    for(var j = 0; j < oItems.length; j++) {
			    	count2++;
			    	//console.log(oItems[j].name);
			    	
			    	oModel.setProperty('/'+i+'/items/'+j+'/pos', count1+'.'+count2);
			    }

			    
			}
			
			oModel.refresh(true);
			
			
			
			/*
			var oTreeTable = this.byId("itemsTreeTable");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDroppedRow = oEvent.getParameter("droppedControl");
			var aDraggedRowContexts = oDragSession.getComplexData("hierarchymaintenance").draggedRowContexts;
			var oNewParentContext = oTreeTable.getContextByIndex(oDroppedRow.getIndex());

			if (aDraggedRowContexts.length === 0 || !oNewParentContext) {
				return;
			}

			var oModel = oTreeTable.getBinding("rows").getModel();
			var oNewParent = oNewParentContext.getProperty();

			// In the JSON data of this example the children of a node are inside an array with the name "categories".
			if (!oNewParent.categories) {
				oNewParent.categories = []; // Initialize the children array.
			}

			for (var i = 0; i < aDraggedRowContexts.length; i++) {
				if (oNewParentContext.getPath().indexOf(aDraggedRowContexts[i].getPath()) === 0) {
					// Avoid moving a node into one of its child nodes.
					continue;
				}

				// Copy the data to the new parent.
				oNewParent.categories.push(aDraggedRowContexts[i].getProperty());

				// Remove the data. The property is simply set to undefined to preserve the tree state (expand/collapse states of nodes).
				oModel.setProperty(aDraggedRowContexts[i].getPath(), undefined, aDraggedRowContexts[i], true);
			}
			
			*/
		},
		onPressInventoryTree : function(oEvent){
			var oItem;
			var dbCatId = 0;
			oItem = oEvent.getSource();
		    //var selectedItem = oEvent.getParameter("listItem");
		    var selectedItem = oItem;
		    
		    //console.log('What is here: ',this.byId("projectNavCon").getCurrentPage().getId());
		    var navId = this.byId("projectNavCon").getCurrentPage().getId();
		    navId = navId.split("--");
		    navId = navId[1];
		    console.log('What is here: ',navId);
		    
		    //Only if Subproject is selected
		    if(navId  == 'subprojectPage') {
		    	
				//console.log('IconTabBarKey: ',this.byId("subprojectIconTabBar").getSelectedKey());
				//var SubprojectItemsIconTabFilter = this.byId("SubprojectItemsIconTabFilter").getKey();
				//console.log('IconTabBarKey1: ',SubprojectItemsIconTabFilter );

		    	//this.byId("subprojectIconTabBar").setSelectedKey('__filter11');	//TODO by name

			if(selectedItem.data("category_id") == null){
				console.log('Its a Category');
			}else{
				
				//Look up Category
           	 	var oModel = new sap.ui.model.json.JSONModel();
				var oModel = this.getView().getModel("inventoryTree");
				var oModel = oModel['oData'];
				
				
				var oValue = selectedItem.data("id");
				console.log(selectedItem);
				
				//Get top category
				var oTopCatName, oTopCatId;
				for (var key in oModel) {
					
					//nodes 1
					for(var key2 in oModel[key]['nodes']){
						//items of nodes 1
						for(var key3 in oModel[key]['nodes'][key2]['items']){
							if(oValue == oModel[key]['nodes'][key2]['items'][key3]['id']){
								//console.log(oModel[key]['name']);
								oTopCatId = oModel[key]['id'];
								oTopCatName = oModel[key]['name'];
							}
							
						}
					}
					
					
					//items of root nodes
					for(var key2 in oModel[key]['items']){
						if(oValue == oModel[key]['items'][key2]['id']){
							//console.log(oModel[key]['name']);
							oTopCatId = oModel[key]['id'];
							oTopCatName = oModel[key]['name'];
						}
						
					}
					
					
					
			
					}
					
				console.log(oTopCatId, oTopCatName);

				
				
				sap.m.MessageToast.show("From "+oTopCatName+" "+inputAmountParsed+" x "+selectedItem.data("name")+"("+selectedItem.data("id")+")");

           	 	
           	 	//Add to Model
           	 	var oModelListItem = new sap.ui.model.json.JSONModel();
				var oModelListItem = this.getView().getModel("subprojectMaterial");
				
				//Check for category and item
				var oModel = oModelListItem['oData'];
				var checkCat = 0;
				var checkItem = 0;
				var posCat = 1;
				var posItem = 1;
				for (var key in oModel) {
					if(oTopCatId == oModel[key]['inventory_id']){
						dbCatId = oModel[key]['id'];
						console.log('No Cat like:',oTopCatId);
						checkCat = 1;
						var catKey = key;
						var posCatExists = posCat;
						
						//Count Items for position
						for(var key2 in oModel[key]['items']){
							posItem= posItem +1;
						}
					}
					posCat = posCat +1;
					
					//items of root nodes
					for(var key2 in oModel[key]['items']){
						
						if(selectedItem.data("id") == oModel[key]['items'][key2]['inventory_id']){
							console.log('Item already exists');
							checkItem = 1;
							var itemKey = key2;
							var itemId = oModel[key]['items'][key2]['id'];
						}
					}
					
				}
				
				var aItems = oModelListItem.getProperty("/");
				
				if(checkCat == 0){
					posItem = posCat.toString()+"."+posItem.toString();
				}else{
					posItem = posCatExists.toString()+"."+posItem.toString();
				}
				
				//Init Cat and Item models
				var oNewCat ={
						"id" : 0,
						"ref_id" : 0,
						"subproject_id" : subprojectId,
						"inventory_id" : oTopCatId,
						"type" : 0,
						"pos" : posCat.toString(),
				    	"name" : oTopCatName,
				    	"description": "",
				        "quantity" : 0,
				        "price" : 0,
				        "unit_id" : 0,
				        "discount" : 0,
				        "tax_id" : 0,
				        "start_date_time" : this.getView().getModel("subproject").getProperty("/start_date_time"),
				        "end_date_time" : this.getView().getModel("subproject").getProperty("/end_date_time"),
				        "days" : this.getView().getModel("subproject").getProperty("/days"),
				        "days_used" : this.getView().getModel("subproject").getProperty("/days_used"),
				        "factor" : this.getView().getModel("subproject").getProperty("/factor"),
				        "status" : 0
				    };
				
				
				var oNewItem ={
						"id" : 0,
						"ref_id" : dbCatId,
						"subproject_id" : subprojectId,
						"inventory_id" : selectedItem.data("id"),
						"type" : 1,
						"pos" : posItem,
				    	"name" : selectedItem.data("name"),
				    	"description": "",
				        "quantity" : inputAmountParsed,
				        "price" : selectedItem.data("price"),
				        "unit_id" : selectedItem.data("unit_id"),
				        "discount" : this.getView().getModel("subproject").getProperty("/discount"),
				        "tax_id" : selectedItem.data("tax_id"),
				        "start_date_time" : this.getView().getModel("subproject").getProperty("/start_date_time"),
				        "end_date_time" : this.getView().getModel("subproject").getProperty("/end_date_time"),
				        "days" : this.getView().getModel("subproject").getProperty("/days"),
				        "days_used" : this.getView().getModel("subproject").getProperty("/days_used"),
				        "factor" : this.getView().getModel("subproject").getProperty("/factor"),
				        "status" : 0
				    };
/*
				//Cat and item in DB
				if(checkCat == 0){
					//Insert cat in DB
					var oModelCat = new sap.ui.model.json.JSONModel();
					
					oModelCat.loadData("/api/SubprojectMaterial", JSON.stringify(oNewCat), true, 'POST', null, false, null);
					
					var parent = this;
					oModelCat.attachRequestCompleted(function(){
						dbCatId = oModelCat.getProperty("/modelId");
						oNewItem['ref_id']=dbCatId;
						
						//Item in DB
						var oModelItem = new sap.ui.model.json.JSONModel();
						
						oModelItem.loadData("/api/SubprojectMaterial", JSON.stringify(oNewItem), true, 'POST', null, false, null);
						
						oModelItem.attachRequestCompleted(function(){
							var dbItemId = oModelItem.getProperty("/modelId");
							//Cat and item for model to push after cat and item requests complete
							
							oNewItem['id']=dbItemId;
							
							
							oNewCat['id']=dbCatId; 
							oNewCat['items']=[oNewItem]; 
							aItems.push(oNewCat);
							
						    oModelListItem.setProperty("/", aItems); 
						});
					});
				}else{
					//Items in DB if cat  already exists
					if(checkItem == 0){
						//Insert in DB
						var oModelItem = new sap.ui.model.json.JSONModel();
						oModelItem.loadData("/api/SubprojectMaterial", JSON.stringify(oNewItem), true, 'POST', null, false, null);
						
						oModelItem.attachRequestCompleted(function(){
							var dbItemId = oModelItem.getProperty("/modelId");
							//Cat and item for model to push after cat and item requests complete
							
							oNewItem['id']=dbItemId;
							aItems[catKey]['items'].push(oNewItem);
							
							
							
						    oModelListItem.setProperty("/", aItems); 
						});
						
						
					}else{
						//Update DB
						
						//Update existing
						var oQuantity = 
						(parseFloat( aItems[catKey]['items'][itemKey]['quantity']) + 
								parseFloat(inputAmountParsed)).toFixed(2);
						
						
						var oNewItem ={
								
								"quantity" : oQuantity,
						}
						
						
						var oModel = new sap.ui.model.json.JSONModel();
						
						oModel.loadData("/api/SubprojectMaterial/"+itemId, JSON.stringify(oNewItem), true, 'PUT', null, false, null);
						
						//Update existing
						aItems[catKey]['items'][itemKey]['quantity'] = 
						(parseFloat( aItems[catKey]['items'][itemKey]['quantity']) + 
								parseFloat(inputAmountParsed)).toFixed(2);
						
						oModelListItem.setProperty("/", aItems);
					}
  
				}
				
				*/

				//Cat and item in DB
				if(checkCat == 0){
					//Insert cat in DB
					//var oModelCat = new sap.ui.model.json.JSONModel();
					
					//oModelCat.loadData("/api/SubprojectMaterial", JSON.stringify(oNewCat), true, 'POST', null, false, null);
					
					//var parent = this;
					//oModelCat.attachRequestCompleted(function(){
						//dbCatId = oModelCat.getProperty("/modelId");
						//oNewItem['ref_id']=0;
						
						//Item in DB
						//var oModelItem = new sap.ui.model.json.JSONModel();
						
						//oModelItem.loadData("/api/SubprojectMaterial", JSON.stringify(oNewItem), true, 'POST', null, false, null);
						
						//oModelItem.attachRequestCompleted(function(){
							//var dbItemId = oModelItem.getProperty("/modelId");
							//Cat and item for model to push after cat and item requests complete
							
							//oNewItem['id']=dbItemId;
							
							
							//oNewCat['id']=dbCatId; 
							oNewCat['items']=[oNewItem]; 
							aItems.push(oNewCat);
							
						    oModelListItem.setProperty("/", aItems); 
						//});
					//});
				}else{
					//Items in DB if cat  already exists
					if(checkItem == 0){
						//Insert in DB
						//var oModelItem = new sap.ui.model.json.JSONModel();
						//oModelItem.loadData("/api/SubprojectMaterial", JSON.stringify(oNewItem), true, 'POST', null, false, null);
						
						//oModelItem.attachRequestCompleted(function(){
							//var dbItemId = oModelItem.getProperty("/modelId");
							
						//Cat and item for model to push after cat and item requests complete
							
							//oNewItem['id']=dbItemId;
							aItems[catKey]['items'].push(oNewItem);
							
							
							
						    oModelListItem.setProperty("/", aItems); 
						//});
						
						
					}else{
						//Update DB
						
						//Update existing
						var oQuantity = 
						(parseFloat( aItems[catKey]['items'][itemKey]['quantity']) + 
								parseFloat(inputAmountParsed)).toFixed(2);
						
						
						//var oNewItem ={
								
						//		"quantity" : oQuantity,
						//}
						
						
						//var oModel = new sap.ui.model.json.JSONModel();
						
						//oModel.loadData("/api/SubprojectMaterial/"+itemId, JSON.stringify(oNewItem), true, 'PUT', null, false, null);
						
						//Update existing
						aItems[catKey]['items'][itemKey]['quantity'] = 
						(parseFloat( aItems[catKey]['items'][itemKey]['quantity']) + 
								parseFloat(inputAmountParsed)).toFixed(2);
						
						oModelListItem.setProperty("/", aItems);
					}
  
				}
				
				
			    
			    
           	 	//Reset numeric keyboard input
				inputAmountParsed = '1.00';
           	 	inputAmount = '';
           	 	
			}
			
			 var oTreeTable = this.getView().byId("itemsTreeTable");
			   oTreeTable.expandToLevel(3); //number of the levels of the tree table.
			   oTreeTable.setFirstVisibleRow(9999); 
		    }else{ // If subproject
		    	sap.m.MessageToast.show('First select a subproject!');
		    } 
		},
		onPressEmployeeList : function(oEvent){
			var oItem;
			var dbCatId = 0;
			oItem = oEvent.getSource();
		    //var selectedItem = oEvent.getParameter("listItem");
		    var selectedItem = oItem;
		    var oTopCatName = 'Personal';
		    var oTopCatId = 1;
		    
		    var projectId = this.getView().getModel("project").getProperty("/id");
		    
		    
		    var oSelectedItemData = [];
		    
			var oModelEmployee = this.getView().getModel("employeeList");
			var oProperty = oModelEmployee.getProperty("/");
			for(var i = 0; i < oProperty.length; i++) {
			    var obj = oProperty[i];
			    if(selectedItem.data("id") == oProperty[i]['id']){
			    	oSelectedItemData = oProperty[i];
			    }
			    	
			}
		    
			console.log(oSelectedItemData);
		    
		    
				sap.m.MessageToast.show("From "+oTopCatName+" "+inputAmountParsed+" x "+"("+selectedItem.data("id")+")");

           	 	
					//Add to Model
				if(projectOrSubprojectSelected == false){
					//Project
					var oModelListItem = new sap.ui.model.json.JSONModel();
					var oModelListItem = this.getView().getModel("projectResource");	
				}else{
					//Subproject
					var oModelListItem = new sap.ui.model.json.JSONModel();
					var oModelListItem = this.getView().getModel("subprojectResource");
				}
           	 	
				
				//Check for category and item
				var oModel = oModelListItem['oData'];
				var checkCat = 0;
				var checkItem = 0;
				var posCat = 1;
				var posItem = 1;
				
				for (var key in oModel) {
					if(oTopCatId == oModel[key]['resource_type_id']){
						dbCatId = oModel[key]['id'];
						console.log('No Cat like:',oTopCatId);
						checkCat = 1;
						var catKey = key;
						var posCatExists = posCat;
						
						//Count Items for position
						for(var key2 in oModel[key]['items']){
							posItem= posItem +1;
						}
					}
					posCat = posCat +1;
					
					//items of root nodes
					for(var key2 in oModel[key]['items']){
						
						if(selectedItem.data("id") == oModel[key]['items'][key2]['resource_type_id']){
							console.log('Item already exists');
							checkItem = 1;
							var itemKey = key2;
							var itemId = oModel[key]['items'][key2]['id'];
						}
					}
					
				}
				
				var aItems = oModelListItem.getProperty("/");
				
				if(checkCat == 0){
					posItem = posCat.toString()+"."+posItem.toString();
				}else{
					posItem = posCatExists.toString()+"."+posItem.toString();
				}
				
				//Init Cat and Item models
				var oNewCat ={
						"id" : 0,
						"ref_id" : 0,
						
						"resource_type_id" : oTopCatId,
						"type" : 0,
						"pos" : posCat.toString(),
				    	"name" : 'Personal',
				    	"description": "",
				        "quantity" : 0,
				        "price" : 0,
				        "unit_id" : 0,
				        "discount" : 0.0,
				        "discount_id" : 0,
				        "tax_id" : 13,
				        "start_date_time" : this.getView().getModel("project").getProperty("/start_date_time"),
				        "end_date_time" : this.getView().getModel("project").getProperty("/end_date_time"),
				        "days" : this.getView().getModel("project").getProperty("/days"),
				        "days_off" : this.getView().getModel("project").getProperty("/days_off"),
				        "factor" : 0,
				        "status" : 0
				    };
				
				
				var oNewItem ={
						"id" : 0,
						"ref_id" : 0,
						
						"resource_type_id" : selectedItem.data("id"),
						"type" : 1,
						"pos" : posItem,
				    	"name" : oSelectedItemData['name'],
				    	"description": "",
				        "quantity" : inputAmountParsed,
				        "price" : oSelectedItemData['day_price'],
				        "unit_id" : 0,
				        "discount_id" : this.getView().getModel("project").getProperty("/discount_id"),
				        "discount" : this.getView().getModel("project").getProperty("/discount"),
				        "tax_id" : 13,
				        "start_date_time" : this.getView().getModel("project").getProperty("/start_date_time"),
				        "end_date_time" : this.getView().getModel("project").getProperty("/end_date_time"),
				        "days" : this.getView().getModel("project").getProperty("/days"),
				        "days_off" : this.getView().getModel("project").getProperty("/days_off"),
				        "factor" : 0,
				        "status" : 0
				    };
					if(projectOrSubprojectSelected == false){
						//Project
						oNewCat["project_id"] = projectId;
						oNewItem["project_id"] = projectId;
					}else{
						//Subproject
						oNewCat["subproject_id"] = subprojectId;
						oNewItem["subproject_id"] = subprojectId;
					}

				//Cat and item in model
				if(checkCat == 0){
					
							oNewCat['items']=[oNewItem]; 
							aItems.push(oNewCat);
							
						    oModelListItem.setProperty("/", aItems); 
						
				}else{
					//Items in Model if cat  already exists
					if(checkItem == 0){
						//Insert in Model
						
							aItems[catKey]['items'].push(oNewItem);
							
							
							
						    oModelListItem.setProperty("/", aItems); 
						
						
						
					}else{
						//Update Model
						
						//Update existing
						var oQuantity = 
						(parseFloat( aItems[catKey]['items'][itemKey]['quantity']) + 
								parseFloat(inputAmountParsed)).toFixed(2);
						
						
						//Update existing
						aItems[catKey]['items'][itemKey]['quantity'] = 
						(parseFloat( aItems[catKey]['items'][itemKey]['quantity']) + 
								parseFloat(inputAmountParsed)).toFixed(2);
						
						oModelListItem.setProperty("/", aItems);
					}
  
				}
				

           	 	//Reset numeric keyboard input
				inputAmountParsed = '1.00';
           	 	inputAmount = '';
           	 	
			
			
			 var oTreeTable = this.getView().byId("projectResourceTreeTable");
			   oTreeTable.expandToLevel(3); //number of the levels of the tree table.

		},
		onPressVehicleList : function(oEvent){
			var oItem;
			var dbCatId = 0;
			oItem = oEvent.getSource();
		    //var selectedItem = oEvent.getParameter("listItem");
		    var selectedItem = oItem;
		    var oTopCatName = 'Transport';
		    var oTopCatId = 2;
		    
		    var projectId = this.getView().getModel("project").getProperty("/id");
		    
		    
		    var oSelectedItemData = [];
		    
			var oModelEmployee = this.getView().getModel("vehicleList");
			var oProperty = oModelEmployee.getProperty("/");
			for(var i = 0; i < oProperty.length; i++) {
			    var obj = oProperty[i];
			    if(selectedItem.data("id") == oProperty[i]['id']){
			    	oSelectedItemData = oProperty[i];
			    }
			    	
			}
		    
			console.log(oSelectedItemData);
		    
		    
				sap.m.MessageToast.show("From "+oTopCatName+" "+inputAmountParsed+" x "+"("+selectedItem.data("id")+")");

           	 	
           	 	//Add to Model
				if(projectOrSubprojectSelected == false){
					//Project
					var oModelListItem = new sap.ui.model.json.JSONModel();
					var oModelListItem = this.getView().getModel("projectResource");	
				}else{
					var oModelListItem = new sap.ui.model.json.JSONModel();
					var oModelListItem = this.getView().getModel("subprojectResource");
				}
				
				//Check for category and item
				var oModel = oModelListItem['oData'];
				var checkCat = 0;
				var checkItem = 0;
				var posCat = 1;
				var posItem = 1;
				
				for (var key in oModel) {
					if(oTopCatId == oModel[key]['resource_type_id']){
						dbCatId = oModel[key]['id'];
						console.log('No Cat like:',oTopCatId);
						checkCat = 1;
						var catKey = key;
						var posCatExists = posCat;
						
						//Count Items for position
						for(var key2 in oModel[key]['items']){
							posItem= posItem +1;
						}
					}
					posCat = posCat +1;
					
					//items of root nodes
					for(var key2 in oModel[key]['items']){
						
						if(selectedItem.data("id") == oModel[key]['items'][key2]['resource_type_id']){
							console.log('Item already exists');
							checkItem = 1;
							var itemKey = key2;
							var itemId = oModel[key]['items'][key2]['id'];
						}
					}
					
				}
				
				var aItems = oModelListItem.getProperty("/");
				
				if(checkCat == 0){
					posItem = posCat.toString()+"."+posItem.toString();
				}else{
					posItem = posCatExists.toString()+"."+posItem.toString();
				}
				
				//Init Cat and Item models
				var oNewCat ={
						"id" : 0,
						"ref_id" : 0,
						
						"resource_type_id" : oTopCatId,
						"type" : 0,
						"pos" : posCat.toString(),
				    	"name" : 'Transport',
				    	"description": "",
				        "quantity" : 0,
				        "price" : 0,
				        "unit_id" : 0,
				        "discount" : 0.0,
				        "discount_id" : 0,
				        "tax_id" : 0,
				        "start_date_time" : this.getView().getModel("project").getProperty("/start_date_time"),
				        "end_date_time" : this.getView().getModel("project").getProperty("/end_date_time"),
				        "days" : this.getView().getModel("project").getProperty("/days_used"),
				        "days_off" : 0,
				        "factor" : this.getView().getModel("project").getProperty("/factor"),
				        "status" : 0
				    };
				
				
				var oNewItem ={
						"id" : 0,
						"ref_id" : dbCatId,
						
						"resource_type_id" : selectedItem.data("id"),
						"type" : 1,
						"pos" : posItem,
				    	"name" : oSelectedItemData['name'],
				    	"description": "",
				        "quantity" : inputAmountParsed,
				        "price" : oSelectedItemData['day_price'],
				        "unit_id" : 0,
				        "discount_id" : this.getView().getModel("project").getProperty("/discount_id"),
				        "discount" : this.getView().getModel("project").getProperty("/discount"),
				        "tax_id" : 13,
				        "start_date_time" : this.getView().getModel("project").getProperty("/start_date_time"),
				        "end_date_time" : this.getView().getModel("project").getProperty("/end_date_time"),
				        "days" : this.getView().getModel("project").getProperty("/days_used"),
				        "days_off" : 0,
				        "factor" : this.getView().getModel("project").getProperty("/factor"),
				        "status" : 0
					};
					
					if(projectOrSubprojectSelected == false){
						//Project
						oNewCat["project_id"] = projectId;
						oNewItem["project_id"] = projectId;
					}else{
						//Subproject
						oNewCat["subproject_id"] = subprojectId;
						oNewItem["subproject_id"] = subprojectId;
					}

				//Cat and item in model
				if(checkCat == 0){
					
							oNewCat['items']=[oNewItem]; 
							aItems.push(oNewCat);
							
						    oModelListItem.setProperty("/", aItems); 
						
				}else{
					//Items in Model if cat  already exists
					if(checkItem == 0){
						//Insert in Model
						
							aItems[catKey]['items'].push(oNewItem);
							
							
							
						    oModelListItem.setProperty("/", aItems); 
						
						
						
					}else{
						//Update Model
						
						//Update existing
						var oQuantity = 
						(parseFloat( aItems[catKey]['items'][itemKey]['quantity']) + 
								parseFloat(inputAmountParsed)).toFixed(2);
						
						
						//Update existing
						aItems[catKey]['items'][itemKey]['quantity'] = 
						(parseFloat( aItems[catKey]['items'][itemKey]['quantity']) + 
								parseFloat(inputAmountParsed)).toFixed(2);
						
						oModelListItem.setProperty("/", aItems);
					}
  
				}
				

           	 	//Reset numeric keyboard input
				inputAmountParsed = '1.00';
           	 	inputAmount = '';
           	 	
			
			
			 var oTreeTable = this.getView().byId("projectResourceTreeTable");
			   oTreeTable.expandToLevel(3); //number of the levels of the tree table.

		},
		
		onPressProjectTree : function(oEvent){
			var oItem;
			var oTree = this.byId("projectTree");
			oItem = oEvent.getSource();
			var parent = this;
			    
		    var selectedItem = oEvent.getParameter("listItem");
		    
		    if(subprojectDataChanged == true){
		    		
					var dialog = new Dialog({
						title: 'Save ?',
						type: 'Message',
						state: 'Warning',
						content: new Text({
							text: 'Save changes? \n All changes will be lost.'
						}),
						beginButton: new Button({
							text: 'Yes',
							press: function () {
								parent.onSaveSubproject();
								dialog.close();
								load();
							}
						}),
						endButton: new Button({
							text: 'No',
							press: function () {
								dialog.close();
								load();
							}
						}),
						afterClose: function() {
							dialog.destroy();
							
						}
					});

					dialog.open();
		    }else{
		    	load();
		    }
		    			
		    function load(){
		    	if(selectedItem.data("project_id") == null){
					//It is a Project
					projectOrSubprojectSelected = false;
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.loadData("/api/Project/"+selectedItem.data("id"), false);
					parent.getView().setModel(oModel,"project");
					
					//Load project resources and parse
					var oModel1 = new sap.ui.model.json.JSONModel();
					oModel1.loadData("/api/Project/"+selectedItem.data("id")+"/ProjectResource", false);
					
					var oModel2 = new sap.ui.model.json.JSONModel();
					
					oModel2.loadData("/api/Project/"+selectedItem.data("id")+"/ResourceDisposition/0/dispositions", false);
					
					
					
					oModel1.attachRequestCompleted(function(){	
						var oData = oModel1['oData'];
						var oDataNew = [];
						for (var key in oData) {
							if(oData[key]['ref_id']== 0){
								var oItemsNew = [];
								for (var key2 in oData) {
									if(oData[key2]['ref_id']== oData[key]['id']){
										oItemsNew.push(oData[key2]);
									}
								}
								oData[key]['items']=oItemsNew;
								oDataNew.push(oData[key]);	
							}
						}
						oModel1.setData(oDataNew);
						parent.getView().setModel(oModel1,"projectResource");
					});
					
					
					oModel2.attachRequestCompleted(function(){	
						var oData = oModel2['oData'];
						var oDataNew = [];
						for (var key in oData) {
							if(oData[key]['ref_id']== 0){
								var oItemsNew = [];
								for (var key2 in oData) {
									if(oData[key2]['ref_id']== oData[key]['id']){
										oItemsNew.push(oData[key2]);
									}
								}
								oData[key]['items']=oItemsNew;
								oDataNew.push(oData[key]);	
							}
						}
						oModel2.setData(oDataNew);
						parent.getView().setModel(oModel2,"projectResourceDisposition");
					});
					
					
					
					var projectPage = parent.byId("projectPage");
					projectPage.setBusy(true);
					
					oModel.attachRequestCompleted(function(){	
						projectPage.setBusy(false);
					});
					
					console.log('Pressed Project!');
					parent.byId("projectNavCon").to(parent.byId("projectPage"));
				
				}else{
					//It is a Subproject
					projectOrSubprojectSelected = true;
					console.log('Pressed Subproject!');
					subprojectDataChanged = false;
					
					var subprojectPage = parent.byId("subprojectPage");
					subprojectPage.setBusy(true);
					
					subprojectId = selectedItem.data("id");
					
					var oModel0 = new sap.ui.model.json.JSONModel();
					oModel0.loadData("/api/Subproject/"+selectedItem.data("id"), false);
					parent.getView().setModel(oModel0,"subproject");
					
					var oModel1 = new sap.ui.model.json.JSONModel();
					oModel1.loadData("/api/Subproject/"+selectedItem.data("id")+"/SubprojectMaterial", false);

					var oModel2 = new sap.ui.model.json.JSONModel();
					oModel2.loadData("/api/Subproject/"+selectedItem.data("id")+"/SubprojectResource", false);

					var oModel3 = new sap.ui.model.json.JSONModel();
					oModel3.loadData("/api/Subproject/"+selectedItem.data("id")+"/0/0/relatedDocuments", false);
					parent.getView().setModel(oModel3,"subproject_documents");
					
					
					oModel0.attachRequestCompleted(function(){
						var oBindingModel0 = new sap.ui.model.Binding(oModel0, "/", oModel0.getContext("/"));
						oBindingModel0.attachChange(function(){
							console.log('Subproject Material Model0 changed!');
							subprojectDataChanged = true;
						});
						
					});
					
					oModel1.attachRequestCompleted(function(){
						//oModel1.getData();
						var oData = oModel1['oData'];
						var oDataNew = [];
						for (var key in oData) {
							if(oData[key]['ref_id']== 0){
								var oItemsNew = [];
								for (var key2 in oData) {
									if(oData[key2]['ref_id']==oData[key]['id']){
										//console.log(oData[key2]);
										oItemsNew.push(oData[key2]);
									}
								
								}
								oData[key]['items']=oItemsNew;
								oDataNew.push(oData[key]);
							}
						}
						//console.log(oDataNew);
						oModel1.setData(oDataNew);
						parent.getView().setModel(oModel1,"subprojectMaterial");

						var oBindingModel1 = new sap.ui.model.Binding(oModel1, "/", oModel1.getContext("/"));
						oBindingModel1.attachChange(function(oEvent){
							console.log('Subproject Material Model1 changed!');
							subprojectDataChanged = true;
						});

					});


					oModel2.attachRequestCompleted(function(){
						var oData = oModel2['oData'];
						var oDataNew = [];
						//Reformat data
						for (var key in oData) {
							if(oData[key]['ref_id']== 0){
								var oItemsNew = [];
								for (var key2 in oData) {
									if(oData[key2]['ref_id']== oData[key]['id']){
										oItemsNew.push(oData[key2]);
									}
								}
								oData[key]['items']=oItemsNew;
								oDataNew.push(oData[key]);	
							}
						}
						oModel2.setData(oDataNew);
						//Set to model
						parent.getView().setModel(oModel2,"subprojectResource");
						
						//Bind for watching changes
						var oBindingModel2 = new sap.ui.model.Binding(oModel2, "/", oModel2.getContext("/"));
						oBindingModel2.attachChange(function(){
							console.log('Subproject Resource Model2 changed!');
							subprojectDataChanged = true;
						});

						//Set busy false after all is loaded
						subprojectPage.setBusy(false);
					});
					
					/*
					
					var oModel2 = new sap.ui.model.json.JSONModel();
					oModel2.loadData("/api/Subproject/"+selectedItem.data("id")+"/SubprojectPerson", false);
					parent.getView().setModel(oModel2,"subprojectPerson");
					
					var oModel3 = new sap.ui.model.json.JSONModel();
					oModel3.loadData("/api/Subproject/"+selectedItem.data("id")+"/SubprojectVehicle", false);
					parent.getView().setModel(oModel3,"subprojectVehicle");
					
					oModel3.attachRequestCompleted(function(){	
						subprojectPage.setBusy(false);
					});
					*/
					parent.byId("projectNavCon").to(parent.byId("subprojectPage"));
				}
		    }
			

		},
		onPressDelete : function(oEvent){
			var oView = this.getView();
			var oList = oEvent.getSource();
			var oItem = oEvent.getParameter("listItem");
			var Tree = this.byId("Tree");
			
			Tree.setBusy(true);
			
			console.log( oItem.data("id") +' ' + oItem.data("category_id"));
			
			//Set list mode to delete
			sap.m.MessageToast.show("Action onPressDelete triggered on item: ");
			this.byId("Tree").setMode('None');
			this.byId("deleteButton").setPressed(false);
			
			var oModel = new sap.ui.model.json.JSONModel();	
			//Check for Cat or Item
			if(oItem.data("category_id") == null){
				//It is a Category
				oModel.loadData("/api/InventoryCategory/"+oItem.data("id"), null, true, 'delete', null, false, null);

			}else{
				//It is a Item
				oModel.loadData("/api/Inventory/"+oItem.data("id"), null, true, 'delete', null, false, null);
			}
			
			
			
			
			oModel.attachRequestCompleted(function(){	
				var oModel1 = new sap.ui.model.json.JSONModel();	
				oModel1.loadData("/api/InventoryCategory/0/0/0/tree", false);
				oView.setModel(oModel1,"inventoryTree");
				
				oModel1.attachRequestCompleted(function(){
					Tree.setBusy(false);
				});
				
			});
			

			
		},
		onDeleteMode : function(oEvent){
			//Set list mode to delete
			sap.m.MessageToast.show("Action onDeleteMode triggered on item: "+oEvent.getSource().getPressed());
			if (oEvent.getSource().getPressed()) {

				this.byId("Tree").setMode('Delete');
			} else {
				//MessageToast.show(oEvent.getSource().getId() + " Unpressed");
				this.byId("Tree").setMode('None');
		
			}
		},onSaveProject: function (){
			//var oBundle = this.getView().getModel("i18n").getResourceBundle();
			//var oModel = new sap.ui.model.json.JSONModel();
			//var oModel2 = new sap.ui.model.json.JSONModel();
			
			/*
			if(this.getView().getModel("project").getProperty("/masterdata_id") == 0){
				this.getView().getModel("project").setProperty("/masterdata_id", masterdataId);
			}
			
			//Project
			var oParameter = this.getView().getModel("project").getJSON();
			oModel.loadData("/api/Project/"+Id, oParameter, true, post_put, null, false, null);
			
			var oParameter = this.getView().getModel("resources").getJSON();
			oModel.attachRequestCompleted(function(){
				if (Id == 0){
					Id = oModel.getProperty("/modelId");	
				}
			
			//Resource_types
				
			oModel2.loadData("/api/Project/"+Id+"/ResourceType/0/sync", oParameter, true, 'PUT', null, false, null);
			
			
			sap.m.MessageToast.show(oBundle.getText("saved"));
			});
			this.onNavBack();
			*/
			
			
			
			//Collect attendee emails
			var oAttendees = this.getView().getModel("project").getProperty("/attendees");
			var oAttendeesArr = oAttendees.split(',');
			var oModelPeople = this.getView().getModel("people").getData();
			var oAttendeeEmails = "";
			var count = 0;
			for (var i = 0; i < oModelPeople.length; i++) {
				for(var j = 0; j < oAttendeesArr.length; j++) {
					if(oModelPeople[i]['id'] == oAttendeesArr[j]){
						if (count != 0) {
							if(oModelPeople[i]['email'].length != 0){
								oAttendeeEmails += ",";
							}
						}
						count++;
						oAttendeeEmails += oModelPeople[i]['email'];
					}
				}
			}
			
			this.getView().getModel("project").setProperty("/attendee_emails", oAttendeeEmails);
			
			//Project
			var oParameter = this.getView().getModel("project").getJSON();
			api.callApi(this,'Project/'+Id,oParameter,'PUT');
			
			var oMaterial = this.getView().getModel("projectResource").getJSON();
			var oModel2 = api.callApi(this,"ProjectResource/"+Id+"/0/0/patch", oMaterial,'PUT');
			this.getView().setModel(oModel2,"projectResource");
			projectDataChanged = false;
		},onSaveSubproject: function (){
			
			//Project
			var oSubprojectId = this.getView().getModel("subproject").getProperty("/id");
			
			var oParameter = this.getView().getModel("subproject").getJSON();
			var oModel = api.callApi(this,'Subproject/'+oSubprojectId,oParameter,'PUT');
			
			//Material / Resources
			
			
			/*
			var oMaterial = JSON.parse(oMaterial);
			var oMaterialFlat = [];
			
			//Make material flat
			for (var key in oMaterial) {
				 
				//oMaterialFlat = oMaterial[key]['items'][key2]['id'];
				//items of root nodes
				for(var key2 in oMaterial[key]['items']){
					oMaterialFlat.push(oMaterial[key]['items'][key2]);
				}
				//Categories
				var oMaterialItem = [];
				oMaterialItem.push(oMaterial[key]);
				
				delete oMaterialItem[0]['items'];
				
				oMaterialFlat.push(oMaterialItem[0]);


				
;
				
			}
			
			
			
			var oParameter2 = JSON.stringify(oMaterialFlat);
			console.log(oParameter2);
			
			*/
			//var oModel2 = new sap.ui.model.json.JSONModel();
			var oMaterial = this.getView().getModel("subprojectMaterial").getJSON();
			var oModel2 = api.callApi(this,"SubprojectMaterial/"+oSubprojectId+"/0/0/patch", oMaterial,'PUT');
			
			//var oModel2.loadData("/api/SubprojectMaterial/"+oSubprojectId+"/0/0/patch", oMaterial, true, 'PUT', null, false, null);
			
			this.getView().setModel(oModel2,"subprojectMaterial");
			
			//var parent = this;
			//oModel2.attachRequestCompleted(function(){

			//parent.getView().setModel(oModel2,"subprojectMaterial");
			
			
			//});

			var oResource= this.getView().getModel("subprojectResource").getJSON();
			var oModel3 = api.callApi(this,"SubprojectResource/"+oSubprojectId+"/0/0/patch", oResource,'PUT');
			this.getView().setModel(oModel3,"subprojectResource");

			subprojectDataChanged = false;
		},handleSelectMasterdataDialogPress: function (oEvent) {
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
			
			this.getView().getModel("project").setProperty("/customer_id", masterdata_id);
			this.getView().getModel("customer").setProperty("/customer_name", company_name_1+" "+company_name_2+" "+first_name+" "+last_name);
			this.getView().getModel("project").setProperty("/customer_person_id", 0);
			this.getView().getModel("project").setProperty("/payment_method_id", payment_method_id);
			this.getView().getModel("project").setProperty("/payment_term_id", payment_term_id);
			
			var email = aContexts.map(function(oContext) { return oContext.getObject().email; }).join(", ");
			this.getView().getModel("email").setProperty("/customer_person_id", 0);
			this.getView().getModel("email").setProperty("/mailTo", email);
			
			
			//People
			var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+masterdata_id+"/Person", false);

			this.getView().setModel(oModel,"customer_people");
			var parent = this;
			oModel.attachRequestCompleted(function(){
				var newItem = {
					"id": "0",
					"first_name":"",
					"last_name": ""
					};
					var oModel = parent.getView().getModel("customer_people");
					var aData = oModel.getProperty("/");
					console.log("The Data:",aData);
	
					aData.unshift(newItem);
					oModel.setProperty("/", aData);
			
			});
			
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
		onNewSubproject : function(oEvent){
			var oModelSubproject = new JSONModel();
			//TODO subproject number count
			oModelSubproject.setData({
				"transaction_id":0,
				"project_id": this.getView().getModel("project").getProperty("/id"),
				"number": "",
				"name": "",
				"description":"",
				"reference_number":"",
				"company_site_id":0,
				"return_company_site_id":0,
				"manager_person_id":0,
				"status":1,
				"priority":0,
				"type":0,
				"delivery_type_id":0,
				"shipping_address_id":0,
				"shipping_address_note":0,
				"total":0,
				"discount":0,
				"discount_id":0,
				"lock_schedule":0,
				"available_later":0,
				"check_out":0,
				"check_in":0,
				"finalized":0,
				"invoiced":0,
				"no_invoice":0,
				"start_date_time":this.getView().getModel("project").getProperty("/start_date_time"),
				"end_date_time":this.getView().getModel("project").getProperty("/end_date_time"),
				"days": 0,
				"days_off": 0,
				"days_used": 0,
				"factor": 0
				});
			this.getView().setModel(oModelSubproject,"add_subproject");
			
			//Open subproject add dialog
			var oView = this.getView();
			var oDialog = oView.byId("subprojectAddDialog");
			
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bw.bozwo.fragment.SubprojectAddDialog", this);
				// connect dialog to view (models, lifecycle)
				oView.addDependent(oDialog);
			}
			oDialog.open();
		},
		onCloseSubprojectAddDialog: function(oEvent) {
			this.byId("subprojectAddDialog").close();
		},
		onAddSubproject : function(oEvent){
			this.byId("subprojectAddDialog").close();
			
			//Create busy Dialog
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

				text:oBundle.getText("savingData")

	  			});
			//Count subprojects
			//TODO take last number after point
			var oModelSubprojectTree = this.getView().getModel("projectTree").getData();
			var count = 1;
			for (var key in oModelSubprojectTree[0]['subprojects']) {
				count++;
			}
			
			var project_number = this.getView().getModel("project").getProperty("/number")
			this.getView().getModel("add_subproject").setProperty("/number",project_number+'.'+count)
			
			//Create Model
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			
			var oParameter = this.getView().getModel("add_subproject").getJSON();
			
			
			
			//Post to backend
			oModel.loadData("/api/Subproject/0", oParameter, true, 'POST', null, false, null);
			
			var parent = this;
			oModel.attachRequestCompleted(function(){
				busyDialog.close(); 
				
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.loadData("/api/Project/"+Id+"/0/0/project_tree", false);
				parent.getView().setModel(oModel,"projectTree");
				
			});	
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			
			
			
			
			
			
		},
		onCreateProjectDocument: function(oEvent) {
			//Preview
			var preview = this.getView().getModel("documents").getProperty("/preview");
			//Get selected document
			var documentKey = this.getView().byId('projectSelectedDocument').getSelectedKey();

			//Set busy
			var projectPage = this.byId("projectPage");
			projectPage.setBusy(true);
			
			//Create Model
			var oModel = new sap.ui.model.json.JSONModel();
			
			
			//Post to backend
			if(preview == 0){
				oModel.loadData("/api/Project/"+Id+"/"+documentKey+"/0/morph", '', true, 'POST', null, false, null);
			}else{
				oModel.loadData("/api/Project/"+Id+"/"+documentKey+"/0/morph_preview", '', true, 'POST', null, false, null);
				this.getView().setModel(oModel,"preview_document");
			}
			
			
			var parent = this;
			oModel.attachRequestCompleted(function(){
				projectPage.setBusy(false);
				
				if(preview == 0){
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.loadData("/api/Project/"+Id+"/0/0/relatedDocuments", false);
					parent.getView().setModel(oModel,"project_documents");
				}else{
					
					
					var oFilename = parent.getView().getModel("preview_document").getProperty("/filename");

					var oUrl = 'document/'+oFilename;

			
					parent._pdfViewer.setSource(oUrl);
					parent._pdfViewer.setTitle("Document");
					parent._pdfViewer.open();
				}
				
				projectPage.setBusy(false);

			});	
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			
		},
		onOverwriteProjectDocument: function(oEvent) {
			
			var documentKey = this.getView().byId('projectDocumentsList').getSelectedItem();
			console.log(documentKey);
			if(typeof documentKey === 'undefined' || documentKey === null || documentKey === ''){
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				sap.m.MessageToast.show(oBundle.getText("firstSelectDocument"));
				
			}else{
				var documentModel = documentKey.data("documentModel");
				var documentId = documentKey.data("documentId");
				var documentNumber = documentKey.data("documentNumber");

				var personId = this.getView().getModel("project").getProperty("/customer_person_id");

				var oUrl = 'document/'+documentModel+'-'+documentNumber+'.pdf'

				//Set busy
				var projectPage = this.byId("projectPage");
				projectPage.setBusy(true);
				
		
				//Post to backend
				var oModel = api.callApi(this,"Project/"+Id+"/"+documentModel+"/"+documentId+"/morph_overwrite",'','POST');
				this.getView().setModel(oModel,"overwrite_document");
				

				var parent = this;
				oModel.attachRequestCompleted(function(){
					projectPage.setBusy(false);
					parent._pdfViewer.setSource(oUrl);
					parent._pdfViewer.setTitle("Document");
					parent._pdfViewer.open();
				});
			}
		},
		onCreateSubprojectDocument: function(oEvent) {
			//Preview
			var preview = this.getView().getModel("documents").getProperty("/preview");
			//Get selected document
			var documentKey = this.getView().byId('subprojectSelectedDocument').getSelectedKey();

			//Set busy
			var subprojectPage = this.byId("subprojectPage");
			subprojectPage.setBusy(true);
			
			//Create Model
			var oModel = new sap.ui.model.json.JSONModel();
			
			
			//Post to backend
			if(preview == 0){
				oModel.loadData("/api/Subproject/"+subprojectId+"/"+documentKey+"/0/morph", '', true, 'POST', null, false, null);
			}else{
				oModel.loadData("/api/Subproject/"+subprojectId+"/"+documentKey+"/0/morph_preview", '', true, 'POST', null, false, null);
				this.getView().setModel(oModel,"preview_document");
			}
			
			
			var parent = this;
			oModel.attachRequestCompleted(function(){
				subprojectPage.setBusy(false);
				
				if(preview == 0){
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.loadData("/api/Subproject/"+subprojectId+"/0/0/relatedDocuments", false);
					parent.getView().setModel(oModel,"subproject_documents");
				}else{
					
					
					var oFilename = parent.getView().getModel("preview_document").getProperty("/filename");

					var oUrl = 'document/'+oFilename;

			
					parent._pdfViewer.setSource(oUrl);
					parent._pdfViewer.setTitle("Document");
					parent._pdfViewer.open();
				}
				
				subprojectPage.setBusy(false);

			});	
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			
		},
		onOverwriteSubprojectDocument: function(oEvent) {
			var documentKey = this.getView().byId('subprojectDocumentsList').getSelectedItem();
			console.log(documentKey);
			if(typeof documentKey === 'undefined' || documentKey === null || documentKey === ''){
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				sap.m.MessageToast.show(oBundle.getText("firstSelectDocument"));
				
			}else{
				var documentModel = documentKey.data("documentModel");
				var documentId = documentKey.data("documentId");
				var documentNumber = documentKey.data("documentNumber");
				
				var oUrl = 'document/'+documentModel+'-'+documentNumber+'.pdf'

				//Set busy
				var subprojectPage = this.byId("subprojectPage");
				subprojectPage.setBusy(true);
				
		
				//Post to backend
				var oModel = api.callApi(this,"Subproject/"+subprojectId+"/"+documentModel+"/"+documentId+"/morph_overwrite",'','POST');
				this.getView().setModel(oModel,"overwrite_document");
				

				var parent = this;
				oModel.attachRequestCompleted(function(){
					subprojectPage.setBusy(false);
					parent._pdfViewer.setSource(oUrl);
					parent._pdfViewer.setTitle("Document");
					parent._pdfViewer.open();
				});
			}
			
		},
		onViewDocument: function (oEvent) { 
			var selectedItem = oEvent.getSource();
		    
			var documentModel = selectedItem.data("documentModel");
			var documentId = selectedItem.data("documentId");
			var documentNumber = selectedItem.data("documentNumber");

			var oUrl = 'document/'+documentModel+'-'+documentNumber+'.pdf'

			
			this._pdfViewer.setSource(oUrl);
			this._pdfViewer.setTitle("Document");
			this._pdfViewer.open();
		},
		onEditDocument: function (oEvent) { 
			var selectedItem = oEvent.getSource();
		    
			var documentModel = selectedItem.data("documentModel");
			var documentId = selectedItem.data("documentId");
			var documentNumber = selectedItem.data("documentNumber");

			
			this.getOwnerComponent().getRouter().navTo("document",{
                Id: documentId,
                model: documentModel,
                origin: "project"
			});
		
		},onProjectEmailDocument: function (oEvent) { 

			var documentKey = this.getView().byId('projectDocumentsList').getSelectedItem();
			console.log(documentKey);
			if(typeof documentKey === 'undefined' || documentKey === null || documentKey === ''){
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				sap.m.MessageToast.show(oBundle.getText("firstSelectDocument"));
				
			}else{
				var documentModel = documentKey.data("documentModel");
				var documentId = documentKey.data("documentId");
				var documentNumber = documentKey.data("documentNumber");

				var personId = this.getView().getModel("project").getProperty("/customer_person_id");

				email.onEmailDocument(this,documentModel,documentId,documentNumber,personId);

			}

		},onSubprojectEmailDocument: function (oEvent) { 

			var documentKey = this.getView().byId('subprojectDocumentsList').getSelectedItem();
			console.log(documentKey);
			if(typeof documentKey === 'undefined' || documentKey === null || documentKey === ''){
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				sap.m.MessageToast.show(oBundle.getText("firstSelectDocument"));
				
			}else{
				var documentModel = documentKey.data("documentModel");
				var documentId = documentKey.data("documentId");
				var documentNumber = documentKey.data("documentNumber");

				var personId = this.getView().getModel("project").getProperty("/customer_person_id");

				email.onEmailDocument(this,documentModel,documentId,documentNumber,personId);

			}

		},onProjectLetterDocument: function (oEvent) { 

			var documentKey = this.getView().byId('projectDocumentsList').getSelectedItem();
			console.log(documentKey);
			if(typeof documentKey === 'undefined' || documentKey === null || documentKey === ''){
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				sap.m.MessageToast.show(oBundle.getText("firstSelectDocument"));
				
			}else{
				var documentModel = documentKey.data("documentModel");
				var documentId = documentKey.data("documentId");
				var documentNumber = documentKey.data("documentNumber");

				var personId = this.getView().getModel("project").getProperty("/customer_person_id");

				letter.onLetterDocument(this,documentModel,documentId,documentNumber,personId);

			}

		},onSubprojectLetterDocument: function (oEvent) { 

			var documentKey = this.getView().byId('subprojectDocumentsList').getSelectedItem();
			console.log(documentKey);
			if(typeof documentKey === 'undefined' || documentKey === null || documentKey === ''){
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				sap.m.MessageToast.show(oBundle.getText("firstSelectDocument"));
				
			}else{
				var documentModel = documentKey.data("documentModel");
				var documentId = documentKey.data("documentId");
				var documentNumber = documentKey.data("documentNumber");

				var personId = this.getView().getModel("project").getProperty("/customer_person_id");

				letter.onLetterDocument(this,documentModel,documentId,documentNumber,personId);

			}

		},onEmailSelectPerson: function (oEvent) { 
			email.onEmailSelectPerson(this,oEvent);

		},onEmailCloseDialog : function () {
			email.onEmailCloseDialog(this);
		
		},onEmailBeforeUploadStarts: function(oEvent) {
			email.onEmailBeforeUploadStarts(this,oEvent);
			
		},onEmailUploadCompleted: function(oEvent) {
			email.onEmailUploadCompleted(this,oEvent);
	
		},onEmailSend: function (oEvent) {
		

			//Send Email
			email.onEmailSend(this);

		},onLetterSelectPerson: function (oEvent) { 
			letter.onLetterSelectPerson(this,oEvent);

		},onLetterDocument: function (oEvent) { 
			var oDocumentNumber = this.getView().getModel("document").getProperty("/number");
			var oPersonId = this.getView().getModel("document").getProperty("/person_id");
			letter.onLetterDocument(this,oDocumentModel,Id,oDocumentNumber,oPersonId);

		},onLetterCloseDialog : function () {
			letter.onLetterCloseDialog(this);
		
		},onLetterSend: function (oEvent) {
			//Send Letter
			letter.onLetterSend(this);
		},onProjectResourcesDeletePress: function(oEvent) {
			var oRow = oEvent.getParameter("row");
			var oContext = oRow.getBindingContext("projectResource");
			var oModel = this.getView().getModel("projectResource");
			var sPath = oContext.getPath();
			
			var oTreeTable = this.byId("projectResourceTreeTable");
            var sParts = sPath.split('/');
            var oData = oModel.getData();
						
			//Sort
			function sortByKey(array, key) {
			    return array.sort(function(a,b){
			    	var x = a[key];
			        var y = b[key];
			        
					var reA = /[^a-zA-Z]/g;
					var reN = /[^0-9]/g;
					  var aA = x.replace(/\d+/g, n => +n+100000 );
					  var bA = y.replace(/\d+/g, n => +n+100000 );
					  if (aA === bA) {
					    var aN = parseInt(x.replace(reN, ""), 10);
					var bN = parseInt(y.replace(reN, ""), 10);
					    return aN === bN ? 0 : aN > bN ? 1 : -1;
					  } else {
					    return aA > bA ? 1 : -1;
					  }
				});
			}
			
			//Delete Cat only if empty
			if(oContext.getProperty("type") == 0){
	            //console.log(oData[sParts[1]]["items"].length);
	            if(oData[sParts[1]]["items"].length === 0){
		            	//Delete from DB
						if(oContext.getProperty("id") != 0){
							api.callApi(this,'ProjectResource/'+oContext.getProperty("id"),'','DELETE');
						}
						
		            	//Delete from MODEL
		            	oData.splice(sParts[1], 1);
		            	oModel.setData(oData);
	
						//Renumber categories and items
						var count1 = 0;
						var oData = oModel.getData();
						for(var i = 0; i < oData.length; i++) {
						    //Categories
						    count1++;
						    oData[i]['pos'] = count1;
						    
						    //Items
						    var count2 = 0;
						    var oItems = sortByKey(oData[i]['items'],'pos');
						    for(var j = 0; j < oItems.length; j++) {
						    	count2++;
						    	oModel.setProperty('/'+i+'/items/'+j+'/pos', count1+'.'+count2);
						    }  
						}
						oModel.setData(oData);
						oModel.refresh(true); 
	            	}
			//Delete Item
			}else if(oContext.getProperty("type") == 1){
				//Delete from DB
				if(oContext.getProperty("id") != 0){
					api.callApi(this,'ProjectResource/'+oContext.getProperty("id"),'','DELETE');
				}
				//Delete from MODEL
	            oData[sParts[1]]["items"].splice(sParts[3], 1);
	            oModel.setData(oData);
	            
				//Renumber Items
				var oProperty = sortByKey(oModel.getProperty("/"),'pos');
				
				var count1 = 0;
				for(var i = 0; i < oProperty.length; i++) {
				    var obj = oProperty[i];
				    count1++;
				    var count2 = 0;
				    var oItems = sortByKey(oProperty[i]['items'],'pos');
				    
				    for(var j = 0; j < oItems.length; j++) {
				    	count2++;
				    	oModel.setProperty('/'+i+'/items/'+j+'/pos', count1+'.'+count2);
				    }  
				}
				oModel.refresh(true); 
			}
			oModel.refresh(true);

				
			
			
			
		},onSubprojectMaterialsDeletePress: function(oEvent) {
			var oRow = oEvent.getParameter("row");
			var oContext = oRow.getBindingContext("subprojectMaterial");
			var oModel = this.getView().getModel("subprojectMaterial");
			var sPath = oContext.getPath();
			
			var oTreeTable = this.byId("itemsTreeTable");
            var sParts = sPath.split('/');
            var oData = oModel.getData();
            
            
			//Sort
			function sortByKey(array, key) {
			    return array.sort(function(a,b){
			    	var x = a[key];
			        var y = b[key];
			        
					var reA = /[^a-zA-Z]/g;
					var reN = /[^0-9]/g;
					  var aA = x.replace(/\d+/g, n => +n+100000 );
					  var bA = y.replace(/\d+/g, n => +n+100000 );
					  if (aA === bA) {
					    var aN = parseInt(x.replace(reN, ""), 10);
					var bN = parseInt(y.replace(reN, ""), 10);
					    return aN === bN ? 0 : aN > bN ? 1 : -1;
					  } else {
					    return aA > bA ? 1 : -1;
					  }
				});
			}

			//Delete Cat only if empty
			if(oContext.getProperty("type") == 0){
	            //console.log(oData[sParts[1]]["items"].length);
	            if(oData[sParts[1]]["items"].length === 0){
		            	//Delete from DB
						if(oContext.getProperty("id") != 0){
							api.callApi(this,'SubprojectMaterial/'+oContext.getProperty("id"),'','DELETE');
						}
						
		            	//Delete from MODEL
		            	oData.splice(sParts[1], 1);
		            	oModel.setData(oData);
	
						//Renumber categories and items
						var count1 = 0;
						var oData = oModel.getData();
						for(var i = 0; i < oData.length; i++) {
						    //Categories
						    count1++;
						    oData[i]['pos'] = count1;
						    
						    //Items
						    var count2 = 0;
						    var oItems = sortByKey(oData[i]['items'],'pos');
						    for(var j = 0; j < oItems.length; j++) {
						    	count2++;
						    	oModel.setProperty('/'+i+'/items/'+j+'/pos', count1+'.'+count2);
						    }  
						}
						oModel.setData(oData);
						oModel.refresh(true); 
	            	}
			//Delete Item
			}else if(oContext.getProperty("type") == 1){
				//Delete from DB
				if(oContext.getProperty("id") != 0){
					api.callApi(this,'SubprojectMaterial/'+oContext.getProperty("id"),'','DELETE');
				}
				//Delete from MODEL
	            oData[sParts[1]]["items"].splice(sParts[3], 1);
	            oModel.setData(oData);
	            
				//Renumber Items
				var oProperty = sortByKey(oModel.getProperty("/"),'pos');
				
				var count1 = 0;
				for(var i = 0; i < oProperty.length; i++) {
				    var obj = oProperty[i];
				    count1++;
				    var count2 = 0;
				    var oItems = sortByKey(oProperty[i]['items'],'pos');
				    
				    for(var j = 0; j < oItems.length; j++) {
				    	count2++;
				    	oModel.setProperty('/'+i+'/items/'+j+'/pos', count1+'.'+count2);
				    }  
				}
				oModel.refresh(true); 
			}

			
		},onChangeItemTax: function(oEvent){
			const sModelName = oEvent.getSource().getSelectedItem().aAPIParentInfos[0].parent.mBindingInfos.selectedKey.parts[0].model;
			const sPath = oEvent.getSource().getSelectedItem().getBindingContext(sModelName).getPath();
			const oKey = oEvent.oSource.getSelectedItem().getKey()
			const oModel = this.getView().getModel(sModelName);
			const oProperty = oModel.getProperty(sPath);
			
			//Only if it is a group
			if(oProperty.type === 0){
				//Iterate over group and set items tax_id
				for(let i = 0; i < oProperty['items'].length; i++) {
					oModel.setProperty(sPath+'/items/'+i+'/tax_id', oKey);
				}


				//Deselect choise on group select
				oEvent.getSource().setSelectedItem(null);
				oModel.setProperty(sPath+'/tax_id', 0);

				//Refresh the changed model
				oModel.refresh(true); 
			}
			

		},handleSelectionFinish: function(oEvent) {
			//Attendees
			var selectedItems = oEvent.getParameter("selectedItems");
			
			var messageText = "Event 'selectionFinished': [";

			for (var i = 0; i < selectedItems.length; i++) {
				messageText += "'" + selectedItems[i].getText() + selectedItems[i].getKey() +selectedItems[i].data("email") +"'";
				if (i != selectedItems.length - 1) {
					messageText += ",";
				}
			}
			messageText += "]";
			var oAttendees = "";
			var oAttendeeEmails = "";
			for (var i = 0; i < selectedItems.length; i++) {
				if (i != 0) {
					oAttendees += ",";
					if(selectedItems[i].data("email").length != 0){
						oAttendeeEmails += ",";
					}
				}
				
				oAttendees += selectedItems[i].getKey();	
				oAttendeeEmails += selectedItems[i].data("email");
			}

			
			//this.getView().getModel("pc").setProperty("/attendees", oAttendees);
			//this.getView().getModel("pc").setProperty("/attendee_emails", oAttendeeEmails);
			
			if(this.getView().getModel("project") != undefined){
				this.getView().getModel("project").setProperty("/attendees", oAttendees);
				this.getView().getModel("project").setProperty("/attendee_emails", oAttendeeEmails);
			}
			
			console.log(oAttendees);
			console.log(oAttendeeEmails);
			//console.log(messageText);
		},alphanumericSorter: function(a, b){
			var reA = /[^a-zA-Z]/g;
			var reN = /[^0-9]/g;
			  var aA = a.replace(reA, "");
			  var bA = b.replace(reA, "");
			  if (aA === bA) {
			    var aN = parseInt(a.replace(reN, ""), 10);
			var bN = parseInt(b.replace(reN, ""), 10);
			    return aN === bN ? 0 : aN > bN ? 1 : -1;
			  } else {
			    return aA > bA ? 1 : -1;
			  }

		},notationSorter: function(a,b){
			
			var reA = /[^a-zA-Z]/g;
			var reN = /[^0-9]/g;
			
			a = a.toString();
			b = b.toString();
			//console.log('A/B:',a,'/',b)
			var aA = a.replace(/\d+/g, n => +n+100000 );
			var bA = b.replace(/\d+/g, n => +n+100000 );
			
			
			  
			if (aA === bA) {
			    var aN = parseInt(a.replace(reN, ""), 10);
			    var bN = parseInt(b.replace(reN, ""), 10);
			    return aN === bN ? 0 : aN > bN ? 1 : -1;
			} else {
			    return aA > bA ? 1 : -1;
			}
		}
	});
 
 
	return PageController;
 
});