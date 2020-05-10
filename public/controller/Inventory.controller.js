sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/Filter',
		'sap/m/Dialog',
		'sap/m/Button',
		'sap/m/Input',
		'sap/m/Label'
	], function(jQuery, Controller, JSONModel, Filter, Dialog, Button, Input, Label) {
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

	var PageController = Controller.extend("sap.ui.bw.bozwo.controller.Inventory", {	
		onInit: function () {
		


		    this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		    this._oRouter.attachRouteMatched(this.onMatch, this);
	
	
				
		},	
		pressDialog: null,
		onMatch: function() {
			

			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/InventoryCategory/0/0/0/tree", false);
			this.getView().setModel(oModel,"inventoryTree");
			
			var oModel2 = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel2,"search");
			
			var oModel3 = new sap.ui.model.json.JSONModel();
			oModel3.loadData("/api/MasterdataGroup/0/Masterdata/0/role/company", false);
			this.getView().setModel(oModel3,"masterdata");
			
			var oModel4 = new sap.ui.model.json.JSONModel();
			oModel4.loadData("/api/MasterdataGroup/0/Masterdata/0/role/supplier", false);
			this.getView().setModel(oModel4,"masterdata_supplier");
			
			
			var Tree = this.byId("Tree");
			Tree.setBusy(true);
			
			oModel.attachRequestCompleted(function(){	
				Tree.setBusy(false);
			});
			

		},
	    onLiveChange: function(event) {
	        const query = event.getParameter("newValue").trim();
	        this.byId("Tree").getBinding("items").filter(query ? new Filter({
	          path: "name",
	          operator: "Contains",
	          value1: query,
	        }) : null);
	      },

	    onTreeChange: function(event) {
	        if (event.getParameter("reason") == "filter") {
	          const model = this.getView().getModel("search");
	          const query = model.getProperty("/query");
	          this.byId("Tree").expandToLevel(query ? 99 : 0);
	        }
	      },
		
		onDragStart : function (oEvent) {
			var oTree = this.byId("Tree");
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
		onDrop: function (oEvent) {
			var oTree = this.byId("Tree");
			var oBinding = oTree.getBinding("items");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDroppedItem = oEvent.getParameter("droppedControl");
			var aDraggedItemContexts = oDragSession.getComplexData("hierarchymaintenance").draggedItemContexts;
			var iDroppedIndex = oTree.indexOfItem(oDroppedItem);
			var oNewParentContext = oBinding.getContextByIndex(iDroppedIndex);
			
			var sDropPosition = oEvent.getParameter("dropPosition");
			var oDraggedControl = oEvent.getParameter("draggedControl");
			var oDroppedControl = oEvent.getParameter("droppedControl");

			if (aDraggedItemContexts.length === 0 || !oNewParentContext) {
				return;
			}

			var oModel = oTree.getBinding("items").getModel();
			var oNewParent = oNewParentContext.getProperty();

			// In the JSON data of this example the children of a node are inside an array with the name "categories".
			if (!oNewParent.categories) {
				oNewParent.categories = []; // Initialize the children array.
			}

			for (var i = 0; i < aDraggedItemContexts.length; i++) {
				if (oNewParentContext.getPath().indexOf(aDraggedItemContexts[i].getPath()) === 0) {
					// Avoid moving a node into one of its child nodes.
					continue;
				}

				// Copy the data to the new parent.
				oNewParent.categories.push(aDraggedItemContexts[i].getProperty());

				// Remove the data. The property is simply set to undefined to preserve the tree state (expand/collapse states of nodes).
				oModel.setProperty(aDraggedItemContexts[i].getPath(), undefined, aDraggedItemContexts[i], true);
			}
			
			sap.m.MessageToast.show(
					oDraggedControl.getTitle() +" Id"+ oDraggedControl.data("id") +" Cat"+ oDraggedControl.data("category_id") +
					" is dropped " + 
					sDropPosition + 
					" the " + 
					oDroppedControl.getTitle() +" Id"+ oDroppedControl.data("id") +" Cat"+ oDroppedControl.data("category_id")
					,{duration: 5000});
			
			if(oDraggedControl.data("category_id") == null){
				if(oDraggedControl.data("id") == oDroppedControl.data("id")){
					//pass
				}else{
					
				//It is a Category, put it
				var oModelCat = new sap.ui.model.json.JSONModel();
				oModelCat.loadData("/api/InventoryCategory/"+oDraggedControl.data("id"), '{"parent_id":'+oDroppedControl.data("id")+'}', true, 'put', null, false, null);
				}
			}else{
				//It is a Item, put it
				
				var oModelItem = new sap.ui.model.json.JSONModel();
				oModelItem.loadData("/api/Inventory/"+oDraggedControl.data("id"), '{"category_id":'+oDroppedControl.data("id")+'}', true, 'put', null, false, null);
				
			}
			
			
			
		},
		onTreeToRefListDrop: function (oEvent) {
			var oTree = this.byId("ref_items");
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
		onTreeToLinkedListDrop: function (oEvent) {
			var oTree = this.byId("linked_items");
			var oDraggedControl = oEvent.getParameter("draggedControl");
			
			if(oDraggedControl.data("category_id") == null){
				console.log('Category not to put')
			}else{
				//It is a Item, put it
				console.log('Item to put')
				
				var oModelItem = new sap.ui.model.json.JSONModel();
				var Id = this.getView().getModel("inventory").getProperty("/id");
				oModelItem.loadData("/api/InventoryLinkedAssociatedItems/0", '{"ref_id":'+Id+',"inventory_id":'+oDraggedControl.data("id")+',"quantity":1}', true, 'post', null, false, null);
				
	
			    var oModelItem = this.getView().getModel("linked_associated_items");
			    var aItems = oModelItem.getProperty("/");
			    var oNewItem =
			    {
			    	 id     : oDraggedControl.data("id"),
			         name     : oDraggedControl.getTitle(),
			         pivot:{quantity   : "1"}
			    }
			    aItems.push(oNewItem);
			    oModelItem.setProperty("/", aItems);   
			}
			
			
			
		},
		onTreeToAlternativesListDrop: function (oEvent) {
			var oTree = this.byId("alternatives_items");
			var oDraggedControl = oEvent.getParameter("draggedControl");
			
			if(oDraggedControl.data("category_id") == null){
				console.log('Category not to put')
			}else{
				//It is a Item, put it
				console.log('Item to put')
				
				var oModelItem = new sap.ui.model.json.JSONModel();
				var Id = this.getView().getModel("inventory").getProperty("/id");
				oModelItem.loadData("/api/InventoryAlternativesItems/0", '{"ref_id":'+Id+',"inventory_id":'+oDraggedControl.data("id")+'}', true, 'post', null, false, null);
				
	
			    var oModelItem = this.getView().getModel("alternatives_items");
			    var aItems = oModelItem.getProperty("/");
			    var oNewItem =
			    {
			    	 id     : oDraggedControl.data("id"),
			         name     : oDraggedControl.getTitle()
			    }
			    aItems.push(oNewItem);
			    oModelItem.setProperty("/", aItems);   
			}
			
			
			
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
		 
		onPressTree : function(oEvent){
			var oItem;
			var oTree = this.byId("Tree");
			oItem = oEvent.getSource();
		
			sap.m.MessageToast.show("Action triggered on item: " + oItem.data("id") +' Cat: '+ oItem.data("category_id"));
			
			if(oItem.data("category_id") == null){
				//It is a Category
				var oModelCategory = new sap.ui.model.json.JSONModel();
				oModelCategory.loadData("/api/InventoryCategory/"+oItem.data("id"), false);
				this.getView().setModel(oModelCategory,"category");
				
				
				var categoryPage = this.byId("categoryPage");
				categoryPage.setBusy(true);
				
				oModelCategory.attachRequestCompleted(function(){	
					categoryPage.setBusy(false);
				});
				
				
				this.byId("inventoryNavCon").to(this.byId("categoryPage"));
			
			}else{
				//It is a Item
				var ItemPage = this.byId("itemPage");
				ItemPage.setBusy(true);
				
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.loadData("/api/Inventory/"+oItem.data("id"), false);
				this.getView().setModel(oModel,"inventory");
				
				var oModel1 = new sap.ui.model.json.JSONModel();
				oModel1.loadData("/api/Inventory/"+oItem.data("id")+"/StandardAssociatedItems", false);
				this.getView().setModel(oModel1,"standard_associated_items");
				
				var oModel2 = new sap.ui.model.json.JSONModel();
				oModel2.loadData("/api/Inventory/"+oItem.data("id")+"/LinkedAssociatedItems", false);
				this.getView().setModel(oModel2,"linked_associated_items");
				
				var oModel3 = new sap.ui.model.json.JSONModel();
				oModel3.loadData("/api/Inventory/"+oItem.data("id")+"/AlternativesItems", false);
				this.getView().setModel(oModel3,"alternatives_items");
				
				var oModel4 = new sap.ui.model.json.JSONModel();
				oModel4.loadData("/api/Inventory/"+oItem.data("id")+"/Devices", false);
				this.getView().setModel(oModel4,"devices");
				
				var oModel5 = new sap.ui.model.json.JSONModel();
				oModel5.loadData("/api/Inventory/"+oItem.data("id")+"/History", false);
				this.getView().setModel(oModel5,"histories");
				

				
				oModel5.attachRequestCompleted(function(){	
					ItemPage.setBusy(false);
				});
				
				this.byId("inventoryNavCon").to(this.byId("itemPage"));
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
		},
		onPressRefListDelete : function(oEvent){
			
		    var oData=this.getView().getModel("standard_associated_items");
		    var currentItem=oEvent.getParameter("listItem");     
	    	var currentItemId=currentItem.data("refListItemId");
		
            var path=currentItem.getBindingContext('standard_associated_items').sPath; 
            var spltarr=path.split("/");
            var idx=spltarr[spltarr.length-1];
            oData.getData().splice(idx,1);
            oData.updateBindings();

            console.log('ID '+currentItemId,'idX '+idx+' Path '+ path);
            
            
			var oModel = new sap.ui.model.json.JSONModel();	
			oModel.loadData("/api/InventoryStandardAssociatedItems/"+currentItemId, null, true, 'delete', null, false, null);
			
		},
		onPressLinkedListDelete : function(oEvent){
			
		    var oData=this.getView().getModel("linked_associated_items");
		    var currentItem=oEvent.getParameter("listItem");     
	    	var currentItemId=currentItem.data("linkedListItemId");
		
            var path=currentItem.getBindingContext('linked_associated_items').sPath; 
            var spltarr=path.split("/");
            var idx=spltarr[spltarr.length-1];
            oData.getData().splice(idx,1);
            oData.updateBindings();

            console.log('ID '+currentItemId,'idX '+idx+' Path '+ path);
            
            
			var oModel = new sap.ui.model.json.JSONModel();	
			oModel.loadData("/api/InventoryLinkedAssociatedItems/"+currentItemId, null, true, 'delete', null, false, null);
			
		},
		onPressAlternativesListDelete : function(oEvent){
			
		    var oData=this.getView().getModel("alternatives_items");
		    var currentItem=oEvent.getParameter("listItem");     
	    	var currentItemId=currentItem.data("alternativesListItemId");
		
            var path=currentItem.getBindingContext('alternatives_items').sPath; 
            var spltarr=path.split("/");
            var idx=spltarr[spltarr.length-1];
            oData.getData().splice(idx,1);
            oData.updateBindings();

            console.log('ID '+currentItemId,'idX '+idx+' Path '+ path);
            
            
			var oModel = new sap.ui.model.json.JSONModel();	
			oModel.loadData("/api/InventoryAlternativesItems/"+currentItemId, null, true, 'delete', null, false, null);
			
		},
		onLiveChangeRefListItem : function(oEvent){
		  	var currentItemId=oEvent.getSource().data("refListItemId");
			var currentItemQuantity=oEvent.getParameter("value");
			
			console.log('Id: '+currentItemId+' Quantity:'+currentItemQuantity);
			
	    	var oModelItem = new sap.ui.model.json.JSONModel();
			
			oModelItem.loadData("/api/InventoryStandardAssociatedItems/"+currentItemId, '{"quantity":'+currentItemQuantity+'}', true, 'put', null, false, null);
			
			
			
		},
		onLiveChangeLinkedListItem : function(oEvent){
		  	var currentItemId=oEvent.getSource().data("linkedListItemId");
			var currentItemQuantity=oEvent.getParameter("value");
			
			console.log('Id: '+currentItemId+' Quantity:'+currentItemQuantity);
			
	    	var oModelItem = new sap.ui.model.json.JSONModel();
			
			oModelItem.loadData("/api/InventoryLinkedAssociatedItems/"+currentItemId, '{"quantity":'+currentItemQuantity+'}', true, 'put', null, false, null);
			
			
			
		},
		onNewItem: function (oEvent){
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/Inventory/0", false);
			
			this.getView().setModel(oModel,"inventory");
			
			
			this.byId("inventoryNavCon").to(this.byId("itemPage"));
			
		},
		onNewCategory: function (oEvent){
			var oModelCategory = new sap.ui.model.json.JSONModel();
			oModelCategory.loadData("/api/InventoryCategory/0", false);
			
			this.getView().setModel(oModelCategory,"category");
			
			
			this.byId("inventoryNavCon").to(this.byId("categoryPage"));
			
			
			
		
		},
		onNewDevice: function (oEvent){
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/InventoryDevices/0", false);
			
			this.getView().setModel(oModel,"device");
			
			
			this.byId("inventoryNavCon").to(this.byId("devicePage"));
			
		},
		onEditDevice: function (oEvent){
			var currentItemId=oEvent.getSource().data("deviceListItemId");
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("/api/InventoryDevices/"+currentItemId, false);
			
			this.getView().setModel(oModel,"device");
			
			
			this.byId("inventoryNavCon").to(this.byId("devicePage"));
			
		},
		onSaveCategory: function (){
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oModel = new sap.ui.model.json.JSONModel();
			var oModel1 = new sap.ui.model.json.JSONModel();
			var oView = this.getView();
			var requestMethod =  'put';
			var Tree = this.byId("Tree");			
			Tree.setBusy(true);
			
			var Id = this.getView().getModel("category").getProperty("/id");
					console.log(Id);
			if(Id == ""){
				Id=0;
				requestMethod =  'post';
				this.getView().getModel("category").setProperty("/parent_id", 0);
				this.getView().getModel("category").setProperty("/depth", 0);
			}
			
			var oParameter = this.getView().getModel("category").getJSON();
			oModel.loadData("/api/InventoryCategory/"+Id, oParameter, true, requestMethod, null, false, null);
			
			sap.m.MessageToast.show(oBundle.getText("Category saved"));
	

			oModel.attachRequestCompleted(function(){
				oModel1.loadData("/api/InventoryCategory/0/0/0/tree", false);
				oView.setModel(oModel1,"inventoryTree");
				oModel1.attachRequestCompleted(function(){	
					Tree.setBusy(false);
				});
			});
			
			
		},
		onDuplicateCategory: function (){
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oModel = new sap.ui.model.json.JSONModel();
			var oModel1 = new sap.ui.model.json.JSONModel();
			var oView = this.getView();
			var Tree = this.byId("Tree");
			Tree.setBusy(true);
	
			var Id = 0;
					console.log(Id);
			
			var oParameter = this.getView().getModel("category").getJSON();
			oModel.loadData("/api/InventoryCategory/"+Id, oParameter, true, 'post', null, false, null);
			
			sap.m.MessageToast.show(oBundle.getText("saved"));
	
			oModel.attachRequestCompleted(function(){
				oModel1.loadData("/api/InventoryCategory/0/0/0/tree", false);
				oView.setModel(oModel1,"inventoryTree");
				oModel1.attachRequestCompleted(function(){	
					Tree.setBusy(false);
				});
			});
			
		},
		onSaveItem: function (){
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oModel = new sap.ui.model.json.JSONModel();
			var oModel1 = new sap.ui.model.json.JSONModel();
			var oView = this.getView();
			var requestMethod = 'put';
			var Tree = this.byId("Tree");
			Tree.setBusy(true);
	
			var Id = this.getView().getModel("inventory").getProperty("/id");
					console.log(Id);
			if(Id == ""){
				Id=0;
				requestMethod =  'post';
				this.getView().getModel("inventory").setProperty("/category_id", 0);
				this.getView().getModel("inventory").setProperty("/status", 0);
				this.getView().getModel("inventory").setProperty("/number_object_id", 11);
			}
			
			
			
			var oParameter = this.getView().getModel("inventory").getJSON();
			oModel.loadData("/api/Inventory/"+Id, oParameter, true, requestMethod, null, false, null);
			
			sap.m.MessageToast.show(oBundle.getText("saved"));
	
			oModel.attachRequestCompleted(function(){
				oModel1.loadData("/api/InventoryCategory/0/0/0/tree", false);
				oView.setModel(oModel1,"inventoryTree");
				oModel1.attachRequestCompleted(function(){	
					Tree.setBusy(false);
				});
			});
			
			
		},
		onDuplicateItem: function (){
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oModel = new sap.ui.model.json.JSONModel();
			var oModel1 = new sap.ui.model.json.JSONModel();
			var oView = this.getView();
			var Tree = this.byId("Tree");
			Tree.setBusy(true);
			
	
			var Id = 0;
			this.getView().getModel("inventory").setProperty("/number_object_id", 11);
					
			
			var oParameter = this.getView().getModel("inventory").getJSON();
			oModel.loadData("/api/Inventory/"+Id, oParameter, true, 'post', null, false, null);
			
			sap.m.MessageToast.show(oBundle.getText("saved"));
	
			oModel.attachRequestCompleted(function(){
				oModel1.loadData("/api/InventoryCategory/0/0/0/tree", false);
				oView.setModel(oModel1,"inventoryTree");
				oModel1.attachRequestCompleted(function(){	
					Tree.setBusy(false);
				});
			});
			
		}
	
		});
 
 
	return PageController;
 
});