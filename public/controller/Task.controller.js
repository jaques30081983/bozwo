sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/Filter',
		'sap/ui/core/routing/History',
		'sap/ui/bw/bozwo/util/formatter',
		"sap/ui/bw/bozwo/util/api"
	], function(jQuery, Controller, JSONModel, Filter, History, formatter,api) {
	"use strict";

	var PageController = Controller.extend("sap.ui.bw.bozwo.controller.Task", {	
		formatter: formatter,
		onInit: function () {
		
 			//TODO i18n
 			var oModel0 = new JSONModel([
				{id:"1", name: "Offen"},
				{id:"2", name: "Erledigt"}
				
			]);
			this.getView().setModel(oModel0,"statuses");

		    this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		    this._oRouter.attachRouteMatched(this.onMatch, this);
	
		    this.setInitialFocus(this.byId("taskSearchField"));
		    
		    var codeField = this.getView().byId("filterSelect");
		    setTimeout(function() {
		    	codeField.insertItem(new sap.ui.core.ListItem({text: 'All', key: undefined}), 0);
			}, 3000);	

		},		
		onMatch: function() {
			var sQuery = this.byId("taskSearchField").getValue();
	
			if(sQuery == ""){
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				var busyDialog = new sap.m.BusyDialog({

		  			text:oBundle.getText("loadingData")

		  			});
				
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.attachRequestSent(function(){busyDialog.open();});
				oModel.loadData("/api/Task/0/0/0/search/name=/status=1", false);
				oModel.attachRequestCompleted(function(){busyDialog.close();});
				oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
				
				this.getView().setModel(oModel);
			}else{
				this.onSearchNumbers();
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
		onSearchTask : function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

	  			text:oBundle.getText("searchingData")

	  			});
			
			var sQuery = this.byId("taskSearchField").getValue();
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.attachRequestSent(function(){busyDialog.open();});
			oModel.loadData("/api/Task/0/0/0/search/name="+sQuery+"&description="+sQuery+"/status=1", false);
			oModel.attachRequestCompleted(function(){busyDialog.close();});
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			this.getView().setModel(oModel); 
			this.onSetFilter();
		}, 
		onPress : function(oEvent){
			var oItem = oEvent.getSource();
			var oId = oItem.data("id");
			var oPath = oItem.getBindingContext();
			

			//Get data from model by item id
			var oModel = new JSONModel();
			
			var oTasksModel = this.getView().getModel();
			var oTasks = oTasksModel.getData();
			for (var key in oTasks){
				if(oTasks[key]['id'] == oId){
					oModel.setData(oTasks[key]);
					
				}
			}
			
			
			//Set Model
			this.getView().setModel(oModel,"pc"); 
			this.getView().getModel("pc").setProperty("/path", oPath);
			
			//Create fragment dialog
			var oView = this.getView();
			var oDialog = oView.byId("planningCalendarEditDialog");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bw.bozwo.fragment.PlanningCalendarEditDialog", this);
				// connect dialog to view (models, lifecycle)
				oView.addDependent(oDialog);
				
			}
			oDialog.open();
			this.getView().byId("pcEditMultiComboBox").setSelectedKeys(oModel.getProperty("/attendees").split(','));
			
		},
		onCloseEditDialog : function () {
			this.byId("planningCalendarEditDialog").close();
		
		},
		onPressDone : function(oEvent){
			var oItem = oEvent.getSource();
			var oId = oItem.data("id");
			var oPath = oItem.getBindingContext();
			
			//Get data from model by item id
			var oModel = new JSONModel();
			
			var oTasksModel = this.getView().getModel();
			var oTasks = oTasksModel.getData();
			for (var key in oTasks){
				if(oTasks[key]['id'] == oId){
					oModel.setData(oTasks[key]);
					oModel.setProperty("/status", 2);
				}
			}

			
			
			//Collect attendee emails
			var oAttendees = oModel.getProperty("/attendees");
			var oAttendeesArr = oAttendees.split(",");
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
			oModel.setProperty("/attendee_emails", oAttendeeEmails);
			
			console.log(oModel.getData());
			
			//Create busy Dialog
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

				text:oBundle.getText("savingData")

	  			});
			
			//Put to backend
			oModel.attachRequestSent(function(){busyDialog.open();});
			var oParameter = oModel.getJSON();
			
			oModel.loadData("/api/Task/"+oId, oParameter, true, 'PUT', null, false, null);	
			
			var parent = this;
			oModel.attachRequestCompleted(function(){
				busyDialog.close();
				sap.m.MessageToast.show("Done");
				
				//Remove from model / UI
	            var path = oPath.getPath();
	            var idx = parseInt(path.substring(path.lastIndexOf('/') +1));
	   
	            oTasks.splice(idx, 1);
	            oTasksModel.setData(oTasks);
				
				
				
				
			});	
			//oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			
		},
		onAddTask: function (oEvent){
				
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("overview", true);
				
		},onSave: function (oEvent) {
			this.byId("planningCalendarEditDialog").close();
			

			//Get vars
			var oId = this.getView().getModel("pc").getProperty("/id");
			var oName = this.getView().getModel("pc").getProperty("/name");
			var oDescription = this.getView().getModel("pc").getProperty("/description");
			var oLocation = this.getView().getModel("pc").getProperty("/location");
			var oStartDate = this.getView().getModel("pc").getProperty("/start_date_time");
			var oEndDate = this.getView().getModel("pc").getProperty("/end_date_time");
			var oType = this.getView().getModel("pc").getProperty("/type");
			var oStatus = this.getView().getModel("pc").getProperty("/status");
			var oAttendees = this.getView().getModel("pc").getProperty("/attendees");
			var oGoogleEventId = this.getView().getModel("pc").getProperty("/google_event_id");
			var oReminderTime = this.getView().getModel("pc").getProperty("/reminder_time");
			var oPath = this.getView().getModel("pc").getProperty("/path");
			
			//Collect attendee emails
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
			
			console.log(oAttendees,oAttendeeEmails);
			
			//Set new model
			var oModelName = '';
			var oModelNameBig = '';
			var oModel = new JSONModel();
			
			//Set model to update
			oModelName = 'task'
				oModelNameBig = 'Task';
				oModel.setData({
					"transaction_id":0,
					"project_id":0,
					"id": oId,
					"name": oName,
					"description":oDescription,
					"location":oLocation,
					"status":oStatus,
					"start_date_time":oStartDate,
					"end_date_time":oEndDate,
					"google_event_id":oGoogleEventId,
					"reminder_time":oReminderTime,
					"attendees":oAttendees,
					"attendee_emails":oAttendeeEmails
					});
			
			
			
			this.getView().getModel().setProperty(oPath + "/name", oName);
			this.getView().getModel().setProperty(oPath + "/start_date_time", oStartDate);
			this.getView().getModel().setProperty(oPath + "/end_date_time", oEndDate);
			this.getView().getModel().setProperty(oPath + "/description", oDescription);
			this.getView().getModel().setProperty(oPath + "/location", oLocation);
			this.getView().getModel().setProperty(oPath + "/status", oStatus);
			this.getView().getModel().setProperty(oPath + "/google_event_id", oGoogleEventId);
			this.getView().getModel().setProperty(oPath + "/reminder_time", oReminderTime);
			
			this.getView().setModel(oModel,oModelName);
			
			//oModel.attachRequestSent(function(){busyDialog.open();});
			var oParameter = this.getView().getModel(oModelName).getJSON();
			
			//Put to backend
			//oModel.loadData("/api/"+oModelNameBig+"/"+oId, oParameter, true, 'PUT', null, false, null);	
			oModel = api.callApi(this,"Task/"+oId, oParameter,'PUT');

			//var parent = this;
			//oModel.attachRequestCompleted(function(){
				//busyDialog.close(); 	
				//parent.reloadDashboard();
			//});	
			//oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			
			
			
		},
		handleSelectionFinish: function(oEvent) {
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

			
			this.getView().getModel("pc").setProperty("/attendees", oAttendees);
			this.getView().getModel("pc").setProperty("/attendee_emails", oAttendeeEmails);
			
			if(this.getView().getModel("project") != undefined){
				this.getView().getModel("project").setProperty("/attendees", oAttendees);
				this.getView().getModel("project").setProperty("/attendee_emails", oAttendeeEmails);
			}
			
			console.log(oAttendees);
			console.log(oAttendeeEmails);
			//console.log(messageText);
		},
		onSetFilter: function(oEvent) {
	        //var groupId=oEvent.getParameter("selectedItem").getKey();
			var groupId = this.byId("filterSelect").getSelectedItem().getKey();
	        console.log('ID:', groupId);
	        this.byId("taskResultList").getBinding("items").filter(groupId ? new Filter({
	          path: "attendees",
	          operator: "Contains",
	          value1: groupId,
	        }) : null);
	        

	        
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