/*
sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/m/Popover',
		'sap/m/Button',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, Popover, Button) {
	"use strict";
 
	var Controller = Controller.extend("sap.ui.bw.bozwo.controller.Sidebar", {
 
		onInit: function () {
		
		},
 
		onCollapseExapandPress: function (event) {
			var sideNavigation = this.getView().byId('sideNavigation');
			var expanded = !sideNavigation.getExpanded();
 
			sideNavigation.setExpanded(expanded);
		}
	});
 
 
	return Controller;
 
});

*/
sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
		"use strict";
 
		var MBController = Controller.extend("sap.ui.bw.bozwo.controller.Menu", {
			onInit: function () {
			
			this.myName = sap.ui.bw.bozwo.User.name;
            var oViewModel = new JSONModel({myName: this.myName});
            this.getView().setModel(oViewModel,"view");
            
            
 
		},
			onButtonLogout: function(){
				document.getElementById('logout-form').submit();
			},
			onButtonEmail: function(){
				document.getElementById('email-form').submit();
			},
			onButtonHelp: function(){
				var oView = this.getView();
				var oDialog = oView.byId("helpDialog");
				// create dialog lazily
				if (!oDialog) {
					// create dialog via fragment factory
					oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bw.bozwo.fragment.Help", this);
					// connect dialog to view (models, lifecycle)
					oView.addDependent(oDialog);
				}
				oDialog.open();
		
    			$('.game').blockrain();


			},
			onHelpExit : function () {
				this.byId("helpDialog").close();
			},
			onDefaultAction: function() {
				sap.m.MessageToast.show("Default action triggered");
				this.getOwnerComponent().getRouter().navTo('overview');
			},
			onDefaultActionAccept: function() {
				sap.m.MessageToast.show("Accepted");
			},
			onMenuAction: function(oEvent) {
				
				var oItem = oEvent.getParameter("item"),
				sItemPath = "";
				var model = oItem.data("model");
				
				while (oItem instanceof sap.m.MenuItem) {
					sItemPath = oItem.getText() + " > " + sItemPath;
					
					oItem = oItem.getParent();
				}

	
				

				sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));
				 
				//this.getView().getModel("view").setProperty("dTitle", sItemPath);
				//sap.ui.getCore().byId("header_title").setText(sItemPath);
				//this.getView().byId("header_title").setText(sItemPath);
				//this.getView().byId("header_title").setText(sItemPath);
				//sap.ui.bw.bozwo.User.dtitle = sItemPath;
				//this.dTitle = sItemPath;
				//this.getView().setTitle(sItemPath);
				sap.m.MessageToast.show("Action triggered on item: " + sItemPath);
				this.getOwnerComponent().getRouter().navTo(oEvent.getParameter("item").getKey(),{
					Id: 0,
					model: model,
					origin: 'overview'
				});

				

			}
		});
 
		return MBController;
 
	});