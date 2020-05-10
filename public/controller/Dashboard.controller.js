sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
	"use strict";
		
 	return Controller.extend("sap.ui.bw.bozwo.controller.Dashboard", {
	
 
		onInit : function (evt) {
			

			this.loadDashboard();
		},
		loadDashboard : function (oEvent){
			var oToday = new Date();
 			
 			var oStartDate = oToday;
			var oEndDate = new Date(oStartDate);
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
			oModel.loadData("/api/Dashboard/1/0/0/dashboard/start="+oStartDateFormat+"&end="+oEndDateFormat, false);
			//sap.ui.getCore().setModel(oModel,"dashboard");
			//this.getView().setModel(oModel,"dashboard");
			this.getOwnerComponent().setModel(oModel, "dashboard");
			/*
			var parent = this;
			setInterval(function() {
				var oModel = new JSONModel();
				oModel.loadData("/api/Dashboard/1/0/0/dashboard/start="+oStartDateFormat+"&end="+oEndDateFormat, false);
				parent.getView().setModel(oModel);
			}, 30000);
			*/
		},
 
		handleEditPress : function (evt) {
			var oTileContainer = this.getView().byId("container");
			var newValue = ! oTileContainer.getEditable();
			oTileContainer.setEditable(newValue);
			evt.getSource().setText(newValue ? "Done" : "Edit");
		},
 
		handleBusyPress : function (evt) {
			var oTileContainer = this.getView().byId("container");
			var newValue = ! oTileContainer.getBusy();
			oTileContainer.setBusy(newValue);
			evt.getSource().setText(newValue ? "Done" : "Busy state");
		},
 
		handleTileDelete : function (evt) {
			var tile = evt.getParameter("tile");
			evt.getSource().removeTile(tile);
		},
 
		handleTilePress : function (oEvent) {
		    var selectedItem = oEvent.getSource();
			var target = selectedItem.data("target");
			var model = selectedItem.data("model");
			
			console.log('called', target, model);
			this.getOwnerComponent().getRouter().navTo(target,{
				origin: 'overview',
				model:model
			});
		}
	});
 

 
});