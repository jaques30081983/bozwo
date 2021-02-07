sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		"sap/ui/core/routing/History",
		"sap/ui/bw/bozwo/util/formatter",
		"sap/ui/bw/bozwo/util/api",
		"sap/ui/bw/bozwo/util/email",
		"sap/ui/bw/bozwo/util/morph",
		"sap/ui/bw/bozwo/util/letter",
		"sap/m/PDFViewer",
		'sap/m/Dialog',
		'sap/m/Button',
		'sap/m/Text',
		"sap/ui/model/Filter"
	], function(jQuery, Controller, JSONModel, History, formatter, api, email, morph, letter, PDFViewer, Dialog, Button, Text, Filter) {
	"use strict";
	

	//Vars
	var Id = 0;
	var subdocumentId = 0;
	var masterdataId = 0;
    var origin = '';
    var documentModelId = 0;
    var oDocumentsModel;
	var oDocumentModel = '';
	var oDocumentName = '';
	var post_put = '';
	var inputAmount = '';
	var inputAmountParsed = '1.00';
	var documentDataChanged = false;
	var subdocumentDataChanged = false;

	//Boolean
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

	var PageController = Controller.extend("sap.ui.bw.bozwo.controller.Document", {
		formatter: formatter,
		
		onInit: function () {
            //Init pdf viewer
			this._pdfViewer = new PDFViewer();
			this.getView().addDependent(this._pdfViewer);
			
			//Init Route
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("document").attachMatched(this._onRouteMatchedEdit, this);
			
			//Init user
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
			oDocumentModel = oArgs.model;
			//oDocumentName = oDocumentModel.replace("Document", "").toLowerCase();
			oDocumentName = oDocumentModel.replace("Document", "");
			oDocumentName = oDocumentName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
			origin = oArgs.origin;
			
            console.log(origin);
            
            


			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("loadingData")

	  			});
			
			//Nav to Document
			this.byId("documentNavCon").to(this.byId("documentPage"));
			

			
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
			
			var oModel2 = new JSONModel([
				{id:"1", name: "Kategorie", type:1},
				{id:"2", name: "Freier Artikel", type:2},
				{id:"3", name: "Text", type:3}
			]);
			this.getView().setModel(oModel2,"miscellaneousList");
			


	
			
			//var oModel = new sap.ui.model.json.JSONModel();
			//oModel.attachRequestSent(function(){busyDialog.open();});
			//oModel.loadData("/api/Document/"+oArgs.Id, false);
			var oModel = api.callApi(this,oDocumentModel+"/"+oArgs.Id);
			oModel.attachRequestSent(function(){busyDialog.open();});
			this.getView().setModel(oModel,"document");
			
			var oBindingModel = new sap.ui.model.Binding(oModel, "/", oModel.getContext("/"));
			oBindingModel.attachChange(function(){
				console.log('Document Model changed');
			});
			
			var oModel1 = new sap.ui.model.json.JSONModel();
			oModel1.loadData("/api/"+oDocumentModel+"/"+oArgs.Id+"/Items", false);
			
			
			var parent = this;
			oModel1.attachRequestCompleted(function(){	
				var oData = oModel1['oData'];
                var oDataNew = [];
                
				for (var key in oData) {
					if(oData[key]['ref_id']== 0){
						var oItemsNew = [];
						for (var key2 in oData) {
							if(oData[key2]['ref_id']== oData[key]['id']){
                                var oItemsNew2 = [];
                                for (var key3 in oData) {
                                    if(oData[key3]['ref_id']== oData[key2]['id']){

                                        
                                        oItemsNew2.push(oData[key3]);
                                    }
                                }

                                oData[key2]['items']=oItemsNew2;
								oItemsNew.push(oData[key2]);
							}
						}
						oData[key]['items']=oItemsNew;
						oDataNew.push(oData[key]);	
					}
                }
                
           
				oModel1.setData(oDataNew);
				parent.getView().setModel(oModel1,"documentItems");
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
			

			
			//var oModel = new sap.ui.model.json.JSONModel();
			//oModel.loadData("/api/Document/"+Id+"/0/0/document_tree", false);
			//this.getView().setModel(oModel,"documentTree");
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/InventoryCategory/0/0/0/tree", false);
			this.getView().setModel(oModel,"inventoryTree");
			
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/PeopleGroup/0/Person/0/role/employee", false);
			this.getView().setModel(oModel,"people");
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/ResourceType/0/0/0/role/person", false);
			this.getView().setModel(oModel,"employeeList");
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/ResourceType/0/0/0/role/vehicle", false);
			this.getView().setModel(oModel,"vehicleList");
			
			
			
			
			var parent = this;
			
			oModel.attachRequestCompleted(function(){
				var masterdataId = parent.getView().getModel("document").getProperty("/masterdata_id");
				var documentStartDate = parent.getView().getModel("document").getProperty("/start_date_time");
				
				//Expand document tree
				//parent.byId("documentTree").expandToLevel(1);
				
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
						var oAttendees = parent.getView().getModel("document").getProperty("/attendees");
						//this.getView().getModel("document").setProperty("/customer_id", masterdata_id);
						parent.getView().getModel("customer").setProperty("/customer_name", company_name_1+" "+company_name_2+" "+first_name+" "+last_name);
						
						if(parent.getView().getModel("document").getProperty("/payment_method_id") <= 1){
							parent.getView().getModel("document").setProperty("/payment_method_id", payment_method_id);
						}
						if(parent.getView().getModel("document").getProperty("/payment_term_id") <= 1){
							parent.getView().getModel("document").setProperty("/payment_term_id", payment_term_id);
						}
						//this.getView().getModel("document").setProperty("/customer_person_id", 0);


						//Attendees
						//parent.getView().byId("documentAddMultiComboBox").setSelectedKeys(oAttendees.split(','));
						
			 			
						
						
					});
				

				//People
				var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+masterdataId+"/Person", false);
				parent.getView().setModel(oModel,"customer_people"); 
				
				//Shipping Addresses
				var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+masterdataId+"/ShippingAddress", false);
				parent.getView().setModel(oModel,"masterdata_shipping_addresses"); 
				
				
                //Project
                var project_id = parent.getView().getModel("document").getProperty("/project_id");
                var subproject_id = parent.getView().getModel("document").getProperty("/subproject_id");
                
                //Check for subproject
                
					//Check for project if its not a subproject
					var oToday = new Date();
					var oTodayStart =
						oToday.getFullYear() + "-" +
						("0" + (oToday.getMonth()+1)).slice(-2) + "-" +
						("0" + oToday.getDate()).slice(-2) + " 00:00:00";
					var oTodayEnd =
						oToday.getFullYear() + "-" +
						("0" + (oToday.getMonth()+1)).slice(-2) + "-" +
						("0" + oToday.getDate()).slice(-2) + " 23:59:00";
                    if(project_id == 0){
                        var oModel = new JSONModel(
                            {
                            "start_date_time":oTodayStart,
                            "end_date_time":oTodayEnd,
                            "days":1,
                            "days_off":0,
                            "days_used":1,
                            "factor":"1.0"
                            }
                          );
                          //Set default data  
                          parent.getView().setModel(oModel,"project"); 
                          
                    }else{
                        //Set data from project
                        var oModel = new sap.ui.model.json.JSONModel("/api/Project/"+project_id, false);
                        parent.getView().setModel(oModel,"project"); 
                    }

				if(subproject_id !== 0 && project_id == 0){
                    //Set data from project
                    var oModel = new sap.ui.model.json.JSONModel("/api/Subproject/"+subproject_id, false);
                    parent.getView().setModel(oModel,"project"); 

                }

				
				busyDialog.close();
			});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});

			oView.bindElement({
				path : "/masterdata-document-edit(" + oArgs.Id + ")",
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
			
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("overview", true);
			}
			
			/*
			var masterdataIdNew = this.getView().getModel("document").getProperty("/masterdata_id");
			
			if (typeof masterdataIdNew === 'undefined' || masterdataIdNew === null || masterdataIdNew === '') {
    			// variable is undefined or null		
			}else{
				masterdataId = masterdataIdNew;		
			}
			
			
			this.getOwnerComponent().getRouter().navTo(origin,{
				masterdataId: masterdataId
			});
			*/
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
			
			
			
		},onDragStartMisc : function (oEvent) {
			var oTree = this.byId("miscellaneousTree");
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
        onDragEnterMisc: function(oEvent) {
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
		
		
		
		onDragStartSubdocumentMaterial : function (oEvent) {
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
        onDragEnterSubdocumentMaterial: function(oEvent) {

        	var oDraggedControl = oEvent.getParameter("target");
            var oType = oDraggedControl.getBindingContext("subdocumentMaterial").getProperty("type");
        	

			if(oType == 0){
				//It is a Category
				console.log('Its a Cat');
				
			}else{
				//It is a Item
				console.log('Its a Item')
				//oEvent.preventDefault();
			}
			
			
			
		},
		onDropSubdocumentMaterial: function (oEvent) {
			var oModel = this.getView().getModel("subdocumentMaterial");
			
			//Draged
			var oDragSession = oEvent.getParameter("dragSession");
			var oDraggedControl = oDragSession.getDragControl();
			var oDraggedPath = oDraggedControl.getBindingContext("subdocumentMaterial").getPath();
			
			//Droped
			var oDroppedRow = oEvent.getParameter("droppedControl");
			var sDropPosition = oEvent.getParameter("dropPosition");
			var oDroppedPos = oDroppedRow.getBindingContext("subdocumentMaterial").getProperty("pos");
			var oDroppedPath = oDroppedRow.getBindingContext("subdocumentMaterial").getPath();
				
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
		    
		    var selectedItem = oItem;
		    
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
				var oModelListItem = this.getView().getModel("documentItems");
				
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
				var document_table_id = "document_"+oDocumentName+"_id";
				//Init Cat and Item models
				var oNewCat ={
                        "id" : 0,
                        [document_table_id] : this.getView().getModel("document").getProperty("/id"),
                        "ref_id" : 0,
                        "transaction_id" : 0,
						"project_id" : this.getView().getModel("document").getProperty("/project_id"),
                        "subproject_id" : this.getView().getModel("document").getProperty("/subproject_id"),
                        "inventory_id" : oTopCatId,
                        "resource_type_id" : 0,
						"type" : 0,
						"pos" : posCat.toString(),
				    	"name" : oTopCatName,
				    	"description": "",
				        "quantity" : 0,
				        "price" : 0,
                        "unit_id" : 0,
                        "discount_id" : this.getView().getModel("document").getProperty("/discount_id"),
				        "discount" : this.getView().getModel("document").getProperty("/discount"),
				        "tax_id" : 0,
				        "start_date_time" : this.getView().getModel("project").getProperty("/start_date_time"),
				        "end_date_time" : this.getView().getModel("project").getProperty("/end_date_time"),
				        "days" : this.getView().getModel("project").getProperty("/days"),
                        "days_off" : 0,
                        "days_used" : this.getView().getModel("project").getProperty("/days_used"),
				        "factor" : this.getView().getModel("project").getProperty("/factor"),
				        "status" : 0
				    };
				
				
				var oNewItem ={
                        "id" : 0,
                        [document_table_id] : this.getView().getModel("document").getProperty("/id"),
                        "ref_id" : dbCatId,
                        "transaction_id" : 0,
						"project_id" : this.getView().getModel("document").getProperty("/project_id"),
                        "subproject_id" : this.getView().getModel("document").getProperty("/subproject_id"),
                        "inventory_id" : selectedItem.data("id"),
                        "resource_type_id" : 0,
						"type" : 2,
						"pos" : posItem,
				    	"name" : selectedItem.data("name"),
				    	"description": "",
				        "quantity" : inputAmountParsed,
				        "price" : selectedItem.data("price"),
                        "unit_id" : selectedItem.data("unit_id"),
                        "discount_id" : this.getView().getModel("document").getProperty("/discount_id"),
				        "discount" : this.getView().getModel("document").getProperty("/discount"),
				        "tax_id" : selectedItem.data("tax_id"),
				        "start_date_time" : this.getView().getModel("project").getProperty("/start_date_time"),
				        "end_date_time" : this.getView().getModel("project").getProperty("/end_date_time"),
                        "days" : this.getView().getModel("project").getProperty("/days"),
                        "days_off" : 0,
				        "days_used" : this.getView().getModel("project").getProperty("/days_used"),
				        "factor" : this.getView().getModel("project").getProperty("/factor"),
				        "status" : 0
				    };

				//Cat and item in DB
				if(checkCat == 0){
					
							oNewCat['items']=[oNewItem]; 
							aItems.push(oNewCat);
							
						    oModelListItem.setProperty("/", aItems); 
		
				}else{
					//Items in DB if cat  already exists
					if(checkItem == 0){
						//Insert in DB
						
							aItems[catKey]['items'].push(oNewItem);
							
							
							
						    oModelListItem.setProperty("/", aItems); 
				
						
						
					}else{
						//Update DB
						
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
           	 	
			}
			
			 var oTreeTable = this.getView().byId("itemsTreeTable");
			   oTreeTable.expandToLevel(3); //number of the levels of the tree table.
			   oTreeTable.setFirstVisibleRow(9999); 

		},
		onPressEmployeeList : function(oEvent){
			var oItem;
			var dbCatId = 0;
			oItem = oEvent.getSource();
		    //var selectedItem = oEvent.getParameter("listItem");
		    var selectedItem = oItem;
		    var oTopCatName = 'Personal';
		    var oTopCatId = 1;
		    
		    var documentId = this.getView().getModel("document").getProperty("/id");
		    
		    
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
           	 	var oModelListItem = new sap.ui.model.json.JSONModel();
				var oModelListItem = this.getView().getModel("documentResource");
				
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
						"document_id" : documentId,
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
				        "start_date_time" : this.getView().getModel("document").getProperty("/start_date_time"),
				        "end_date_time" : this.getView().getModel("document").getProperty("/end_date_time"),
				        "days" : this.getView().getModel("document").getProperty("/days"),
				        "days_off" : this.getView().getModel("document").getProperty("/days_off"),
				        "factor" : 0,
				        "status" : 0
				    };
				
				
				var oNewItem ={
						"id" : 0,
						"ref_id" : 0,
						"document_id" : documentId,
						"resource_type_id" : selectedItem.data("id"),
						"type" : 1,
						"pos" : posItem,
				    	"name" : oSelectedItemData['name'],
				    	"description": "",
				        "quantity" : inputAmountParsed,
				        "price" : oSelectedItemData['day_price'],
				        "unit_id" : 0,
				        "discount_id" : this.getView().getModel("document").getProperty("/discount_id"),
				        "discount" : this.getView().getModel("document").getProperty("/discount"),
				        "tax_id" : 13,
				        "start_date_time" : this.getView().getModel("document").getProperty("/start_date_time"),
				        "end_date_time" : this.getView().getModel("document").getProperty("/end_date_time"),
				        "days" : this.getView().getModel("document").getProperty("/days"),
				        "days_off" : this.getView().getModel("document").getProperty("/days_off"),
				        "factor" : 0,
				        "status" : 0
				    };


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
           	 	
			
			
			 var oTreeTable = this.getView().byId("documentResourceTreeTable");
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
		    
		    var documentId = this.getView().getModel("document").getProperty("/id");
		    
		    
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
           	 	var oModelListItem = new sap.ui.model.json.JSONModel();
				var oModelListItem = this.getView().getModel("documentResource");
				
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
						"document_id" : documentId,
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
				        "start_date_time" : this.getView().getModel("document").getProperty("/start_date_time"),
				        "end_date_time" : this.getView().getModel("document").getProperty("/end_date_time"),
				        "days" : this.getView().getModel("document").getProperty("/days"),
				        "days_off" : this.getView().getModel("document").getProperty("/days_used"),
				        "factor" : this.getView().getModel("document").getProperty("/factor"),
				        "status" : 0
				    };
				
				
				var oNewItem ={
						"id" : 0,
						"ref_id" : dbCatId,
						"document_id" : documentId,
						"resource_type_id" : selectedItem.data("id"),
						"type" : 1,
						"pos" : posItem,
				    	"name" : oSelectedItemData['name'],
				    	"description": "",
				        "quantity" : inputAmountParsed,
				        "price" : oSelectedItemData['day_price'],
				        "unit_id" : 0,
				        "discount_id" : this.getView().getModel("document").getProperty("/discount_id"),
				        "discount" : this.getView().getModel("document").getProperty("/discount"),
				        "tax_id" : 13,
				        "start_date_time" : this.getView().getModel("document").getProperty("/start_date_time"),
				        "end_date_time" : this.getView().getModel("document").getProperty("/end_date_time"),
				        "days" : this.getView().getModel("document").getProperty("/days"),
				        "days_off" : this.getView().getModel("document").getProperty("/days_used"),
				        "factor" : this.getView().getModel("document").getProperty("/factor"),
				        "status" : 0
				    };


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
           	 	
			
			
			 var oTreeTable = this.getView().byId("documentResourceTreeTable");
			   oTreeTable.expandToLevel(3); //number of the levels of the tree table.

		},
		onPressMiscList : function(oEvent){
			var oItem;
			var dbCatId = 0;
			oItem = oEvent.getSource();
		    //var selectedItem = oEvent.getParameter("listItem");
		    var selectedItem = oItem;
		    var oTopCatName = 'Verkauf';
            var oTopCatId = 999999999;
            var oCatName = 'Sonstiges';
		    var oCatId = 999999999;
		    
		    var documentId = this.getView().getModel("document").getProperty("/id");
		    
		    //Get data by selected item
		    var oSelectedItemData = [];
			var oModelMisc = this.getView().getModel("miscellaneousList");
			var oProperty = oModelMisc.getProperty("/");
			for(var i = 0; i < oProperty.length; i++) {
			    var obj = oProperty[i];
			    if(selectedItem.data("id") == oProperty[i]['id']){
			    	oSelectedItemData = oProperty[i];
			    }
			    	
			}
		    
			//console.log(oSelectedItemData);
		    
		    
				//sap.m.MessageToast.show("From "+oTopCatName+" "+inputAmountParsed+" x "+"("+selectedItem.data("id")+")");

           	 	
           	 	//Add to Model
           	 	var oModelListItem = new sap.ui.model.json.JSONModel();
				var oModelListItem = this.getView().getModel("documentItems");
				
				//Check for top category, category and item
				var oModel = oModelListItem['oData'];
				var checkCat = 0;
                var checkItem = 0;
                var posTopCat = 1;
				var posCat = 1;
				var posItem = 1;

				var oToday = new Date();
				var last_item_start_date_time =
					oToday.getFullYear() + "-" +
					("0" + (oToday.getMonth()+1)).slice(-2) + "-" +
					("0" + oToday.getDate()).slice(-2) + " 00:00:00";
				var last_item_end_date_time =
					oToday.getFullYear() + "-" +
					("0" + (oToday.getMonth()+1)).slice(-2) + "-" +
					("0" + oToday.getDate()).slice(-2) + " 23:59:00";

				
				
				for (var key in oModel) {
                    //Check for cat by name
                    if(oCatName == oModel[key]['name']){
						dbCatId = oModel[key]['id'];
						console.log('Found same category:',oCatName);
						checkCat = 1;
						var catKey = key;
						var posCatExists = posCat;
						
						//Count Items for position
						for(var key2 in oModel[key]['items']){
							posItem= posItem +1;
						}
					}
					posCat = posCat +1;
					
					//check for items of cat
					for(var key2 in oModel[key]['items']){
						
						if(selectedItem.data("name") == oModel[key]['items'][key2]['name']){
							console.log('Item already exists',selectedItem.data("name"));
							checkItem = 1;
							var itemKey = key2;
							var itemId = oModel[key]['items'][key2]['id'];
						}
						last_item_start_date_time = oModel[key]['items'][key2]['start_date_time'];
						last_item_end_date_time = oModel[key]['items'][key2]['end_date_time'];
					}
					
				}
				
				var aItems = oModelListItem.getProperty("/");
				
				if(checkCat == 0){
					posItem = posCat.toString()+"."+posItem.toString();
				}else{
					posItem = posCatExists.toString()+"."+posItem.toString();
                }
                var document_table_id = "document_"+oDocumentName+"_id";
                //console.log(document_table_id);
                
				//Init top cat and item models
				var oNewTopCat ={
                    "id" : 0,
                    [document_table_id] : this.getView().getModel("document").getProperty("/id"),
                    "ref_id" : 0,
                    "transaction_id" : 0,
                    "project_id" : this.getView().getModel("document").getProperty("/project_id"),
                    "subproject_id" : this.getView().getModel("document").getProperty("/subproject_id"),
                    "inventory_id" : oTopCatId,
                    "resource_type_id" : selectedItem.data("id"),
                    "type" : 0,
                    "pos" : posCat.toString(),
                    "name" : 'Verkauf',
                    "description": "",
                    "quantity" : 0,
                    "price" : 0,
                    "unit_id" : 0,
                    "discount_id" : this.getView().getModel("document").getProperty("/discount_id"),
				    "discount" : this.getView().getModel("document").getProperty("/discount"),
                    "tax_id" : 13,
                    "start_date_time" : this.getView().getModel("project").getProperty("/start_date_time"),
                    "end_date_time" : this.getView().getModel("project").getProperty("/end_date_time"),
                    "days" : this.getView().getModel("project").getProperty("/days"),
                    "days_off" : this.getView().getModel("project").getProperty("/days_off"),
                    "days_used" : this.getView().getModel("project").getProperty("/days_used"),
                    "factor" : this.getView().getModel("project").getProperty("/factor"),
                    "status" : 0
                };
				//Init cat
				var oNewCat ={
                        "id" : 0,
                        [document_table_id] : this.getView().getModel("document").getProperty("/id"),
                        "ref_id" : 0,
                        "transaction_id" : 0,
                        "project_id" : this.getView().getModel("document").getProperty("/project_id"),
                        "subproject_id" : this.getView().getModel("document").getProperty("/subproject_id"),
                        "inventory_id" : oTopCatId,
                        "resource_type_id" : 0,
						"type" : 0,
						"pos" : posCat.toString(),
				    	"name" : 'Sonstiges',
				    	"description": "",
				        "quantity" : 0,
				        "price" : 0,
				        "unit_id" : 0,
				        "discount_id" : this.getView().getModel("document").getProperty("/discount_id"),
				        "discount" : this.getView().getModel("document").getProperty("/discount"),
				        "tax_id" : 13,
                        "start_date_time" : last_item_start_date_time,
				        "end_date_time" : last_item_end_date_time,
				        "days" : this.getView().getModel("project").getProperty("/days"),
                        "days_off" : this.getView().getModel("project").getProperty("/days_off"),
                        "days_used" : this.getView().getModel("project").getProperty("/days_used"),
				        "factor" : this.getView().getModel("project").getProperty("/factor"),
				        "status" : 0
				    };
				
                //Init item
                var oNewItem ={
                        "id" : 0,
                        [document_table_id] : this.getView().getModel("document").getProperty("/id"),
						"ref_id" : 0,
						"transaction_id" : 0,
						"project_id" : this.getView().getModel("document").getProperty("/project_id"),
						"subproject_id" : this.getView().getModel("document").getProperty("/subproject_id"),
						"inventory_id" : selectedItem.data("id"),
						"resource_type_id" : 0,
						"type" : oSelectedItemData['type'],
						"pos" : posItem.toString(),
				    	"name" : oSelectedItemData['name'],
				    	"description": "",
				        "quantity" : inputAmountParsed,
				        "price" : 0,
				        "unit_id" : 0,
				        "discount_id" : this.getView().getModel("document").getProperty("/discount_id"),
				        "discount" : this.getView().getModel("document").getProperty("/discount"),
				        "tax_id" : 13,
				        "start_date_time" : last_item_start_date_time,
				        "end_date_time" : last_item_end_date_time,
				        "days" : this.getView().getModel("project").getProperty("/days"),
                        "days_off" : this.getView().getModel("project").getProperty("/days_off"),
                        "days_used" : this.getView().getModel("project").getProperty("/days_used"),
				        "factor" : this.getView().getModel("project").getProperty("/factor"),
				        "status" : 0,
						"items":[]
				    };


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
           	 	
			
			
			 var oTreeTable = this.getView().byId("documentItemsTreeTable");
			   oTreeTable.expandToLevel(3); //number of the levels of the tree table.

		},
		
		onPressDocumentTree : function(oEvent){
			var oItem;
			var oTree = this.byId("documentTree");
			oItem = oEvent.getSource();
			var parent = this;
			    
		    var selectedItem = oEvent.getParameter("listItem");
		    
		    if(subdocumentDataChanged == true){
		    		
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
								parent.onSaveSubdocument();
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
		    	if(selectedItem.data("document_id") == null){
					//It is a Document
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.loadData("/api/Document/"+selectedItem.data("id"), false);
					parent.getView().setModel(oModel,"document");
					
					//Load document resources and parse
					var oModel1 = new sap.ui.model.json.JSONModel();
					oModel1.loadData("/api/Document/"+selectedItem.data("id")+"/DocumentResource", false);
					
					
					
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
						parent.getView().setModel(oModel1,"documentResource");
					});
					
					
					
					
					
					var documentPage = parent.byId("documentPage");
					documentPage.setBusy(true);
					
					oModel.attachRequestCompleted(function(){	
						documentPage.setBusy(false);
					});
					
					console.log('Pressed Document!');
					parent.byId("documentNavCon").to(parent.byId("documentPage"));
				
				}else{
					//It is a Subdocument
					console.log('Pressed Subdocument!');
					subdocumentDataChanged = false;
					
					var subdocumentPage = parent.byId("subdocumentPage");
					subdocumentPage.setBusy(true);
					
					subdocumentId = selectedItem.data("id");
					
					var oModel0 = new sap.ui.model.json.JSONModel();
					oModel0.loadData("/api/Subdocument/"+selectedItem.data("id"), false);
					parent.getView().setModel(oModel0,"subdocument");
					
					var oModel1 = new sap.ui.model.json.JSONModel();
					oModel1.loadData("/api/Subdocument/"+selectedItem.data("id")+"/SubdocumentMaterial", false);
					
					
					oModel1.attachRequestCompleted(function(){	
						//oModel1.getData();
						var oData = oModel1['oData'];
						var oDataNew = [];
						for (var key in oData) {
							if(oData[key]['ref_id']== 0){
								var oItemsNew = [];
								for (var key2 in oData) {
									if(oData[key2]['ref_id']== oData[key]['id']){
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
						parent.getView().setModel(oModel1,"subdocumentMaterial");
						
						var oBindingModel0 = new sap.ui.model.Binding(oModel0, "/", oModel0.getContext("/"));
						oBindingModel0.attachChange(function(){
							console.log('Subdocument Material Model0 changed!');
							subdocumentDataChanged = true;
						});
						
						var oBindingModel1 = new sap.ui.model.Binding(oModel1, "/", oModel1.getContext("/"));
						oBindingModel1.attachChange(function(){
							console.log('Subdocument Material Model1 changed!');
							subdocumentDataChanged = true;
						});
						
					});
					
					
					
					var oModel2 = new sap.ui.model.json.JSONModel();
					oModel2.loadData("/api/Subdocument/"+selectedItem.data("id")+"/SubdocumentPerson", false);
					parent.getView().setModel(oModel2,"subdocumentPerson");
					
					var oModel3 = new sap.ui.model.json.JSONModel();
					oModel3.loadData("/api/Subdocument/"+selectedItem.data("id")+"/SubdocumentVehicle", false);
					parent.getView().setModel(oModel3,"subdocumentVehicle");
					
					oModel3.attachRequestCompleted(function(){	
						subdocumentPage.setBusy(false);
					});
					
					parent.byId("documentNavCon").to(parent.byId("subdocumentPage"));
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
		},onSaveDocument: function (){
			//Document
			var oParameter = this.getView().getModel("document").getJSON();
			api.callApi(this,oDocumentModel+'/'+Id,oParameter,'PUT');
			//DocumentItems
			var oItems = this.getView().getModel("documentItems").getJSON();
			var oModel2 = api.callApi(this,oDocumentModel+"Item/"+Id+"/0/0/patch", oItems,'PUT');
			this.getView().setModel(oModel2,"documentItems");
			documentDataChanged = false;
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
			
			
			this.getView().getModel("document").setProperty("/masterdata_id", masterdata_id);
			this.getView().getModel("customer").setProperty("/customer_name", company_name_1+" "+company_name_2+" "+first_name+" "+last_name);
			this.getView().getModel("document").setProperty("/person_id", 0);
			this.getView().getModel("document").setProperty("/payment_method_id", payment_method_id);
			this.getView().getModel("document").setProperty("/payment_term_id", payment_term_id);

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
		onNewSubdocument : function(oEvent){
			var oModelSubdocument = new JSONModel();
			//TODO subdocument number count
			oModelSubdocument.setData({
				"transaction_id":0,
				"document_id": this.getView().getModel("document").getProperty("/id"),
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
				"start_date_time":this.getView().getModel("document").getProperty("/start_date_time"),
				"end_date_time":this.getView().getModel("document").getProperty("/end_date_time"),
				"days": 0,
				"days_off": 0,
				"days_used": 0,
				"factor": 0
				});
			this.getView().setModel(oModelSubdocument,"add_subdocument");
			
			//Open subdocument add dialog
			var oView = this.getView();
			var oDialog = oView.byId("subdocumentAddDialog");
			
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bw.bozwo.fragment.SubdocumentAddDialog", this);
				// connect dialog to view (models, lifecycle)
				oView.addDependent(oDialog);
			}
			oDialog.open();
		},
		onCloseSubdocumentAddDialog: function(oEvent) {
			this.byId("subdocumentAddDialog").close();
		},
		onAddSubdocument : function(oEvent){
			this.byId("subdocumentAddDialog").close();
			
			//Create busy Dialog
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

				text:oBundle.getText("savingData")

	  			});
			//Count subdocuments
			//TODO take last number after point
			var oModelSubdocumentTree = this.getView().getModel("documentTree").getData();
			var count = 1;
			for (var key in oModelSubdocumentTree[0]['subdocuments']) {
				count++;
			}
			
			var document_number = this.getView().getModel("document").getProperty("/number")
			this.getView().getModel("add_subdocument").setProperty("/number",document_number+'.'+count)
			
			//Create Model
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			
			var oParameter = this.getView().getModel("add_subdocument").getJSON();
			
			
			
			//Post to backend
			oModel.loadData("/api/Subdocument/0", oParameter, true, 'POST', null, false, null);
			
			var parent = this;
			oModel.attachRequestCompleted(function(){
				busyDialog.close(); 
				
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.loadData("/api/Document/"+Id+"/0/0/document_tree", false);
				parent.getView().setModel(oModel,"documentTree");
				
			});	
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			
			
			
			
			
			
		},
		onPreviewDocument: function(oEvent) {
			//Get selected document
			//var documentKey = this.getView().byId('documentSelectedDocument').getSelectedKey();
			
			//Set busy
			var documentPage = this.byId("documentPage");
			documentPage.setBusy(true);
			
			//Create Model
			var oModel = new sap.ui.model.json.JSONModel();
			
			
			//Post to backend
			//oModel.loadData("/api/Document/"+Id+"/"+documentKey+"/0/morph", '', true, 'POST', null, false, null);
			oModel.loadData("/api/"+oDocumentModel+"/"+Id+"/0/0/documentPreview", '', true, 'GET', null, false, null);
			this.getView().setModel(oModel,"documentFilename");

			var parent = this;
			oModel.attachRequestCompleted(function(){
				
				var oFilename= parent.getView().getModel("documentFilename").getProperty("/");
				
				console.log(oFilename);
				documentPage.setBusy(false);

				//Show in viewer
				var oUrl = 'document/'+oFilename;	
				console.log(oUrl);	
				parent._pdfViewer.setSource(oUrl);
				parent._pdfViewer.setTitle("Document");
				parent._pdfViewer.open();

				
			});	
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			
		},
		onCreateDocument: function(oEvent) {
			//Get selected document
			//var documentKey = this.getView().byId('documentSelectedDocument').getSelectedKey();
			
			//Set busy
			var documentPage = this.byId("documentPage");
			documentPage.setBusy(true);
			
			//Create Model
			var oModel = new sap.ui.model.json.JSONModel();
			
			
			//Post to backend
			//oModel.loadData("/api/Document/"+Id+"/"+documentKey+"/0/morph", '', true, 'POST', null, false, null);
			oModel.loadData("/api/"+oDocumentModel+"/"+Id+"/0/0/documentCreate", '', true, 'GET', null, false, null);
			this.getView().setModel(oModel,"documentFilename");

			var parent = this;
			oModel.attachRequestCompleted(function(){
				
				var oFilename= parent.getView().getModel("documentFilename").getProperty("/");
				
				console.log(oFilename);
				documentPage.setBusy(false);

				//Show in viewer
				var oUrl = 'document/'+oFilename;	
				console.log(oUrl);	
				parent._pdfViewer.setSource(oUrl);
				parent._pdfViewer.setTitle("Document");
				parent._pdfViewer.open();

                var oModel2 = api.callApi(parent,oDocumentModel+"/"+Id);
                parent.getView().setModel(oModel2,"document");
				
			});	
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			
		},onViewDocument: function (oEvent) { 
			var selectedItem = oEvent.getSource();
		    
			var documentModel = selectedItem.data("documentModel");
			var documentId = selectedItem.data("documentId");
			var documentNumber = selectedItem.data("documentNumber");

			var oUrl = 'document/'+documentModel+'-'+documentNumber+'.pdf'

			
			this._pdfViewer.setSource(oUrl);
			this._pdfViewer.setTitle("Document");
			this._pdfViewer.open();

		},onEmailSelectPerson: function (oEvent) { 
			email.onEmailSelectPerson(this,oEvent);

		},onEmailDocument: function (oEvent) { 
			var oDocumentNumber = this.getView().getModel("document").getProperty("/number");
			var oPersonId = this.getView().getModel("document").getProperty("/person_id");
			email.onEmailDocument(this,oDocumentModel,Id,oDocumentNumber,oPersonId);

		},onEmailCloseDialog : function () {
			email.onEmailCloseDialog(this);
		
		},onEmailBeforeUploadStarts: function(oEvent) {
			email.onEmailBeforeUploadStarts(this,oEvent);
			
		},onEmailUploadCompleted: function(oEvent) {
			email.onEmailUploadCompleted(this,oEvent);
	
		},onEmailSend: function (oEvent) {
			//Send Email
			email.onEmailSend(this);

		},onMorphDocument: function (oEvent) { 
			var oDocumentNumber = this.getView().getModel("document").getProperty("/number");
			morph.onMorphDocument(this,oDocumentModel,Id,oDocumentNumber);

		},onMorphCloseDialog : function () {
			morph.onMorphCloseDialog(this);
		
		},onMorphRequest : function () {
			morph.onMorphRequest(this);
		
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

		},onDocumentItemsDeletePress: function(oEvent) {
			var oRow = oEvent.getParameter("row");
			var oContext = oRow.getBindingContext("documentItems");
			var oModel = this.getView().getModel("documentItems");
			var sPath = oContext.getPath();
			
			var oTreeTable = this.byId("documentItemsTreeTable");
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
			
			//Delete Top category only if empty
			if(oContext.getProperty("type") == 0){
	            //console.log(oData[sParts[1]]["items"].length);
	            if(!oData[sParts[1]].hasOwnProperty('items')){
		            	//Delete from DB
						if(oContext.getProperty("id") != 0){
							api.callApi(this, oDocumentModel+'Item/'+oContext.getProperty("id"),'','DELETE');
							console.log('Deleted Subproject Cat from DB, id:', oContext.getProperty("id"), oDocumentModel)
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
	            	}else{
						sap.m.MessageToast.show('Top Category not empty.');
					}
			//Delete Category if empty
			}else if(oContext.getProperty("type") == 1){
	            //console.log(oData[sParts[1]]["items"].length);
	            if(oData[sParts[1]]["items"][sParts[3]]["items"].length === 0){
		            	//Delete from DB
						if(oContext.getProperty("id") != 0){
							api.callApi(this, oDocumentModel+'Item/'+oContext.getProperty("id"),'','DELETE');
							console.log('Deleted Cat from DB, id:', oContext.getProperty("id"), oDocumentModel)
						}
						
		            	//Delete from MODEL
						oData[sParts[1]]["items"].splice(sParts[3], 1);
						if(oData[sParts[1]]["items"].length === 0){
							delete oData[sParts[1]]["items"];
						}
						oModel.setData(oData);
	

						//Renumber categories and items
						if(oData[sParts[1]].length === 0){
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

	            	}else{
						sap.m.MessageToast.show('Category not empty.');
					}
			//Delete Item
			}else if(oContext.getProperty("type") == 2){
				//Delete from DB
				if(oContext.getProperty("id") != 0){
					api.callApi(this,oDocumentModel+'Item/'+oContext.getProperty("id"),'','DELETE');
					console.log('Deleted Item from DB, id:', oContext.getProperty("id"),oDocumentModel+'Item/')
						
				}
				//Delete from MODEL
				if(sParts.length === 4){
					oData[sParts[1]]["items"].splice(sParts[3], 1);
				}else if(sParts.length === 6){
					oData[sParts[1]]["items"][sParts[3]]["items"].splice(sParts[5], 1);
				}
				
				
	            oModel.setData(oData);
				
				console.log('sParts:',sParts)
				
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

				
			
			
			
		},onSubdocumentMaterialsDeletePress: function(oEvent) {
			var oRow = oEvent.getParameter("row");
			var oContext = oRow.getBindingContext("subdocumentMaterial");
			var oModel = this.getView().getModel("subdocumentMaterial");
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
							api.callApi(this,'SubdocumentMaterial/'+oContext.getProperty("id"),'','DELETE');
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
					api.callApi(this,'SubdocumentMaterial/'+oContext.getProperty("id"),'','DELETE');
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
			
			if(this.getView().getModel("document") != undefined){
				this.getView().getModel("document").setProperty("/attendees", oAttendees);
				this.getView().getModel("document").setProperty("/attendee_emails", oAttendeeEmails);
			}
			
			console.log(oAttendees);
			console.log(oAttendeeEmails);
			//console.log(messageText);
		},onChangeItemTax: function(oEvent){
			const sModelName = oEvent.getSource().getSelectedItem().aAPIParentInfos[0].parent.mBindingInfos.selectedKey.parts[0].model;
			const sPath = oEvent.getSource().getSelectedItem().getBindingContext(sModelName).getPath();
			const oKey = oEvent.oSource.getSelectedItem().getKey()
			const oModel = this.getView().getModel(sModelName);
			const oProperty = oModel.getProperty(sPath);
			console.log(oProperty.type);
			//Only if it is a group
			if(oProperty.type === 1){
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