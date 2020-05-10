sap.ui.define(['sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/Filter',
	'sap/ui/bw/bozwo/util/api',
	'sap/ui/bw/bozwo/util/formatter'],
	function(Controller, JSONModel, Filter, api, formatter) {
	"use strict";
 

 	return Controller.extend("sap.ui.bw.bozwo.controller.PlanningCalendar", {
 		formatter: formatter,
 		onInit: function () {
			
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
			var dashboardPlanningCalendar = this.byId("dashboardPlanningCalendar");
			dashboardPlanningCalendar.setBusy(true);
			oModel.loadData("/api/Calendar/1/0/0/calendar/start="+oStartDateFormat+"&end="+oEndDateFormat, false);
			this.getView().setModel(oModel);


			
 			//TODO i18n
 			var oModel0 = new JSONModel([
				{id:"1", name: "Offen"},
				{id:"2", name: "Bestätigt"},
				{id:"3", name: "Abgesagt"}
			]);
			this.getView().setModel(oModel0,"statuses");

			//TODO i18n
			var oModel0 = new JSONModel([
				{id:"1", name: "Vermietung - Selbstabholer"},
				{id:"2", name: "Vermietung - Mit Lieferung"},
				{id:"3", name: "Nur Resourcen"},
				{id:"4", name: "Full-Service"},
				{id:"5", name: "Verkauf"}
			]);
			this.getView().setModel(oModel0,"types");
			
			var oModelLegends = new JSONModel();
			oModelLegends.setData({
				legendItems: [
					{
						text: "Feiertag",
						type: "Type06"
					}
				],
				legendAppointmentItems: [
					{
						text: "Projekt",
						type: "Type03"
					},
					{
						text: "Termin",
						type: "Type05"
					},
					{
						text: "Hinweis",
						type: "Type08"
					},
					{
						text: "Aufgabe",
						type: "Type07"
					},
					{
						text: "Geburtstag",
						type: "Type01"
					}
					]
				});
			this.getView().setModel(oModelLegends,"legends");
			
			//Load People
			//var oModel = new sap.ui.model.json.JSONModel();
			//oModel.loadData("/api/PeopleGroup/0/Person/0/role/employee", false);
			//this.getView().setModel(oModel,"people");
			
			//Load Holidays
			
			var oModelHolidays = new JSONModel();
			oModelHolidays.loadData("https://feiertage-api.de/api/?jahr="+oToday.getFullYear(), false);
			
			var oModelNewHolidays = new JSONModel([]);
			var aItems = oModelNewHolidays.getProperty("/");

			var parent = this;
			oModelHolidays.attachRequestCompleted(function(){	
				var oData = oModelHolidays.getData();
				//Iterate over holidays api data
				for(var key1 in oData){
					for(var key2 in oData[key1]){
						var oNewItem =
					    {
					    	 name : key2+' ('+key1+')',
					    	 description : oData[key1][key2]['hinweis'],
					    	 start_date_time : oData[key1][key2]['datum']+' 10:00',
					         end_date_time : oData[key1][key2]['datum']+' 22:00',
					         type	: 'Type06'
					    };
						//Add to new model
						aItems.push(oNewItem);
						
						
					}
				}
				oModelNewHolidays.setProperty("/", aItems);

				parent.getView().setModel(oModelNewHolidays,"holidays");
			});
			oModelHolidays.attachRequestCompleted(function(){	
				dashboardPlanningCalendar.setBusy(false);
			});
			var oStateModel = new JSONModel();
			oStateModel.setData({
				legendShown: false
			});
			this.getView().setModel(oStateModel, "stateModel");
			
			
		},
		handleStartDateChange: function (oEvent) {
			var daysOfViews = {"Hour":2, "Day":30, "Month":370, "Week":8, "One Month": 40};
			
			var oPC = oEvent.oSource;
			var oStartDate = oPC.getStartDate();
			var oViews = oPC.getViewKey();
			
			var oEndDate = new Date(oStartDate);
			oEndDate.setDate(oEndDate.getDate() + daysOfViews[oViews]); // Set now + 30 days as the new date
				
			var oStartDateFormat =
				oStartDate.getFullYear() + "-" +
			    ("0" + (oStartDate.getMonth()+1)).slice(-2) + "-" +
			    ("0" + oStartDate.getDate()).slice(-2);

			var oEndDateFormat =
				oEndDate.getFullYear() + "-" +
			    ("0" + (oEndDate.getMonth()+1)).slice(-2) + "-" +
			    ("0" + oEndDate.getDate()).slice(-2);

			
			
			console.log('StartDateChange:', daysOfViews[oViews], oStartDateFormat,oEndDateFormat, oViews);

			// create model
			//var oModel = new JSONModel();
			var dashboardPlanningCalendar = this.byId("dashboardPlanningCalendar");
			dashboardPlanningCalendar.setBusy(true);
			
			//oModel.loadData("/api/Calendar/1/0/0/calendar/start="+oStartDateFormat+"&end="+oEndDateFormat, false);
			
			var oModel = api.callApi(this,"Calendar/1/0/0/calendar/start="+oStartDateFormat+"&end="+oEndDateFormat);
			this.getView().setModel(oModel);
			
			
			oModel.attachRequestCompleted(function(){	
				dashboardPlanningCalendar.setBusy(false);
			});
			
			//Reload Dashboard
			this.reloadDashboard();
			//sap.ui.controller("sap.ui.bw.bozwo.controller.Dashboard").loadDashboard();
		},
 
 
		handleAppointmentSelect: function (oEvent) {
			var oAppointment = oEvent.getParameter("appointment");
			
			var deleteActive = this.getView().getModel("stateModel").getProperty("/deleteActive");
			
			var oId = oAppointment.getKey();
			var oName = oAppointment.getTitle();
			var oDescription = oAppointment.getText();
			var oStartDate = oAppointment.getStartDate();
			var oEndDate = oAppointment.getEndDate();
			var oType = oAppointment.getType();
			var oStatus = oAppointment.data("status");
			var oLocation = oAppointment.data("location");
			var oAttendees = oAppointment.data("attendees");
			var oGoogleEventId = oAppointment.data("google_event_id");
			var oReminderTime = oAppointment.data("reminder_time");
			var oPath = oAppointment.getBindingContext();
			
			
			
			//Format js date object to string
			var oStartDateFormat =
				oStartDate.getFullYear() + "-" +
			    ("0" + (oStartDate.getMonth()+1)).slice(-2) + "-" +
			    ("0" + oStartDate.getDate()).slice(-2)+ " " +
			    ("0" + oStartDate.getHours()).slice(-2) + ":" + ("0" + oStartDate.getMinutes()).slice(-2);

			var oEndDateFormat =
				oEndDate.getFullYear() + "-" +
			    ("0" + (oEndDate.getMonth()+1)).slice(-2) + "-" +
			    ("0" + oEndDate.getDate()).slice(-2)+ " " +
			    ("0" + oEndDate.getHours()).slice(-2) + ":" + ("0" + oEndDate.getMinutes()).slice(-2);

			
			//Set Model
			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel,"pc"); 
			this.getView().getModel("pc").setProperty("/id", oId);
			this.getView().getModel("pc").setProperty("/name", oName);
			this.getView().getModel("pc").setProperty("/description", oDescription);
			this.getView().getModel("pc").setProperty("/location", oLocation);
			this.getView().getModel("pc").setProperty("/start_date_time", oStartDateFormat);
			this.getView().getModel("pc").setProperty("/end_date_time", oEndDateFormat);
			this.getView().getModel("pc").setProperty("/status", oStatus);
			this.getView().getModel("pc").setProperty("/attendees", oAttendees);
			this.getView().getModel("pc").setProperty("/google_event_id", oGoogleEventId);
			this.getView().getModel("pc").setProperty("/reminder_time", oReminderTime);
			this.getView().getModel("pc").setProperty("/type", oType);
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
			
			this.getView().byId("pcEditMultiComboBox").setSelectedKeys(oAttendees.split(','));
			
			
			
			
			//Check selection
			if (oAppointment) {
				sap.m.MessageToast.show("Appointment selected: " + oAppointment.getTitle() +" "+ oAppointment.getType());
				//var oModel = new sap.ui.model.json.JSONModel();
				//Check for Type
				if(oAppointment.getType() == 'Type03'){	
					//Project
					if(deleteActive == true){
						//Delete on backend by id of selected object
						api.callApi(this,"Project/"+oId+"/google_event_id/"+oGoogleEventId,'','DELETE');
					}else{
						this.getOwnerComponent().getRouter().navTo("project-edit",{
							Id: oAppointment.getKey(),
							masterdataId: '0',
							origin: 'overview',
							model: 'overview'
							
						});
					}
				}else if(oAppointment.getType() == 'Type05'){
					//Appointment					
					if(deleteActive == true){
						//Delete on backend by id of selected object
						//oModel.loadData("/api/Appointment/"+oId+"/google_event_id/"+oGoogleEventId, '', true, 'DELETE', null, false, null);
						api.callApi(this,"Appointment/"+oId+"/google_event_id/"+oGoogleEventId,'','DELETE');
					}else{
						oDialog.open();
					}

				}else if(oAppointment.getType() == 'Type08'){
					//Hint
					if(deleteActive == true){
						//Delete on backend by id of selected object
						//oModel.loadData("/api/Hint/"+oId+"/google_event_id/"+oGoogleEventId, '', true, 'DELETE', null, false, null);
						api.callApi(this,"Hint/"+oId+"/google_event_id/"+oGoogleEventId,'','DELETE');
					}else{
						oDialog.open();
					}
				}else if(oAppointment.getType() == 'Type01'){
					//Birthday
					if(deleteActive == true){
						//Delete on backend by id of selected object
						//oModel.loadData("/api/Birthday/"+oId+"/google_event_id/"+oGoogleEventId, '', true, 'DELETE', null, false, null);
						api.callApi(this,"Birthday/"+oId+"/google_event_id/"+oGoogleEventId,'','DELETE');
					}else{
						oDialog.open();
					}
				}else if(oAppointment.getType() == 'Type07'){
					//Task
					if(deleteActive == true){
						//Delete on backend by id of selected object
						//oModel.loadData("/api/Task/"+oId+"/google_event_id/"+oGoogleEventId, '', true, 'DELETE', null, false, null);
						api.callApi(this,"Task/"+oId+"/google_event_id/"+oGoogleEventId,'','DELETE');
					}else{
						oDialog.open();
					}
				}
				if(deleteActive == true){
					//Delete from model / UI
		            var path = oPath.getPath();
		            var idx = parseInt(path.substring(path.lastIndexOf('/') +1));
		            var m = this.getView().getModel();
		            var d = m.getData();
		            d[0]["appointments"].splice(idx, 1);
		            m.setData(d);
					
					this.getView().getModel("stateModel").setProperty("/deleteActive",false);

					//Delete on backend
					//oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
				}
				
			}else {
				var aAppointments = oEvent.getParameter("appointments");
				var sValue = aAppointments.length + " Appointments selected";
				alert(sValue);
			}
		},
 
		handleIntervalSelect: function (oEvent) {
			
			var oPC = oEvent.oSource;
			var oStartDate = oEvent.getParameter("startDate");
			var oEndDate = oEvent.getParameter("endDate");
			var oModel = this.getView().getModel();
			var oData = oModel.getData();
			var oWidth = this.getView().byId("dashboardPlanningCalendar").$().width();
			var oViewkey = this.getView().byId("dashboardPlanningCalendar").getViewKey();
			
			if(oWidth < 1050 && oViewkey == "One Month"){
				console.log('Nothing', oWidth, )
			}else{
				console.log('Size', oWidth)
			//Format js date object to string
			var oStartDateHours = 10;
			if(("0" + oStartDate.getHours()).slice(-2) != 0){
				oStartDateHours = ("0" + oStartDate.getHours()).slice(-2);
			}

			var oStartDateFormat =
				oStartDate.getFullYear() + "-" +
			    ("0" + (oStartDate.getMonth()+1)).slice(-2) + "-" +
			    ("0" + oStartDate.getDate()).slice(-2)+ " " +
			     oStartDateHours + ":" + ("0" + oStartDate.getMinutes()).slice(-2);

			var oEndDateFormat =
				oEndDate.getFullYear() + "-" +
			    ("0" + (oEndDate.getMonth()+1)).slice(-2) + "-" +
			    ("0" + oEndDate.getDate()).slice(-2)+ " " +
			    ("0" + oEndDate.getHours()).slice(-2) + ":" + ("0" + oEndDate.getMinutes()).slice(-2);

			
			//Set Model
			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel,"pc"); 
			
			//this.getView().getModel("pc").setProperty("/id", '');
			this.getView().getModel("pc").setProperty("/name", '');
			this.getView().getModel("pc").setProperty("/description", '');
			this.getView().getModel("pc").setProperty("/location", '');
			this.getView().getModel("pc").setProperty("/start_date_time", oStartDateFormat);
			this.getView().getModel("pc").setProperty("/end_date_time", oEndDateFormat);
			this.getView().getModel("pc").setProperty("/status", 1);
			this.getView().getModel("pc").setProperty("/attendees", sap.ui.bw.bozwo.User.people_id);
			//this.getView().getModel("pc").setProperty("/google_event_id", oGoogleEventId);
			this.getView().getModel("pc").setProperty("/reminder_time", '01:00');
			//this.getView().getModel("pc").setProperty("/type", oType);
			//this.getView().getModel("pc").setProperty("/path", oPath);
			
			
			
			console.log(sap.ui.bw.bozwo.User.people_id, 'test handleIntervalSelect', oStartDateFormat, oEndDateFormat);
			
			var oView = this.getView();
			var oDialog = oView.byId("planningCalendarDialog");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bw.bozwo.fragment.PlanningCalendarDialog", this);
				// connect dialog to view (models, lifecycle)
				oView.addDependent(oDialog);
			}
			oDialog.open();
			this.getView().byId("pcAddMultiComboBox").setSelectedKeys(sap.ui.bw.bozwo.User.people_id);
			}
		},onCloseDialog : function () {
			this.byId("planningCalendarDialog").close();
		
		},onCloseEditDialog : function () {
			this.byId("planningCalendarEditDialog").close();
		
		},onAddProjectDialog: function (oEvent) {
			this.byId("planningCalendarDialog").close();
			
			var oName = this.getView().getModel("pc").getProperty("/name");
			var oDescription = this.getView().getModel("pc").getProperty("/description");
			var oLocation = this.getView().getModel("pc").getProperty("/location");
			var oStartDate = this.getView().getModel("pc").getProperty("/start_date_time");
			var oEndDate = this.getView().getModel("pc").getProperty("/end_date_time");
			var oStatus = this.getView().getModel("pc").getProperty("/status");
			var oReminderTime = this.getView().getModel("pc").getProperty("/reminder_time");
			var oAttendees = this.getView().getModel("pc").getProperty("/attendees");
			var oAttendeeEmails = this.getView().getModel("pc").getProperty("/attendee_emails");
			
			var oModel = new JSONModel();
			oModel.setData({
				"transaction_id":0,
				"number":"",
				"name":oName,
				"description":oDescription,
				"location":oLocation,
				"reference_number":"",
				"company_site_id":0,
				"return_company_site_id":0,
				"manager_person_id":0,
				"status":oStatus,
				"priority":0,
				"type":0,
				"event_id":0,
				"payment_term_id":0,
				"payment_method_id":0,
				"customer_id":0,
				"customer_person_id":0,
				"total":0.00,
				"discount":0.00,
				"discount_id":0,
				"start_date_time":oStartDate,
				"end_date_time":oEndDate,
				"days":1,
				"days_off":0,
				"days_used":1,
				"factor":1.0,
				"number_object_id":8,
				"reminder_time":oReminderTime,
				"attendees":oAttendees,
				"attendee_emails":oAttendeeEmails
				});
				
			this.getView().setModel(oModel,"project");
			
			//TODO days
			
			var oModelSubproject = new JSONModel();
			oModelSubproject.setData({
				"transaction_id":0,
				"project_id":0,
				"number":"",
				"name": "Job",
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
				"start_date_time":oStartDate,
				"end_date_time":oEndDate,
				"days": 1,
				"days_used": 0,
				"days_off": 0,
				"factor": 1.0
				});
				
			this.getView().setModel(oModelSubproject,"subproject");

			var oModelCustomer = new JSONModel();
			oModelCustomer.setData({
				
				"customer_name":"select"
				});
				
			this.getView().setModel(oModelCustomer,"customer");
			
			
			
			//Open Dialog
			var oView = this.getView();
			var oDialog = oView.byId("projectAddDialog");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bw.bozwo.fragment.ProjectAddDialog", this);
				// connect dialog to view (models, lifecycle)
				oView.addDependent(oDialog);
			}
			oDialog.open();
		
			this.getView().byId("projectEditMultiComboBox").setSelectedKeys(oAttendees.split(','));
			
		},onCloseProjectAddDialog : function () {
			this.byId("projectAddDialog").close();
		
		},onAddProject: function (oEvent) {
			this.byId("projectAddDialog").close();
			
			//Create busy Dialog
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

				text:oBundle.getText("savingData")

	  			});
			//Create Model
			//var oModel = new sap.ui.model.json.JSONModel();
			
			
			
			
			var oParameter = this.getView().getModel("project").getJSON();
			
			//Post to backend
			//oModel.loadData("/api/Project/0", oParameter, true, 'POST', null, false, null);	
			
			var oModel = api.callApi(this,"Project/0",oParameter,'POST');
			//oModel.attachRequestSent(function(){busyDialog.open();});
			
			var parent = this;
			oModel.attachRequestCompleted(function(){
				//busyDialog.close(); 	
				var newProjectId = oModel.getProperty("/modelId");
				var newNumber = oModel.getProperty("/number");
				var newGoogleEventId = oModel.getProperty("/google_event_id");
				var newProjectType = parent.getView().getModel("project").getProperty("/type");

				parent.getView().getModel("subproject").setProperty("/project_id",newProjectId);
				parent.getView().getModel("subproject").setProperty("/number",newNumber+".1");
				parent.getView().getModel("subproject").setProperty("/type",newProjectType);

				if(newProjectType == 1 || newProjectType == 2 || newProjectType == 4){
					parent.getView().getModel("subproject").setProperty("/name","Vermietung");

				}else if(newProjectType == 3){
					parent.getView().getModel("subproject").setProperty("/name","Job");
				}else if(newProjectType == 5){
					parent.getView().getModel("subproject").setProperty("/name","Verkauf");
				}
				parent.getView().getModel("subproject").setProperty("/type",newProjectType);

				//Create Subproject
				var oParameter = parent.getView().getModel("subproject").getJSON();
				
				//Post to backend
				var oModel2 = new sap.ui.model.json.JSONModel();
				oModel2.loadData("/api/Subproject/0", oParameter, true, 'POST', null, false, null);
		
				//Get data from model
				var oName = parent.getView().getModel("project").getProperty("/name");
				var oDescription = parent.getView().getModel("project").getProperty("/description");
				var oLocation = parent.getView().getModel("project").getProperty("/location");
				var oStartDate = parent.getView().getModel("project").getProperty("/start_date_time");
				var oEndDate = parent.getView().getModel("project").getProperty("/end_date_time");
				var oReminderTime = parent.getView().getModel("project").getProperty("/reminder_time");
				var oAttendees = parent.getView().getModel("project").getProperty("/attendees");
				
				
				//Insert in planning calendar ui
				var oModel3 = parent.getView().getModel();
				var oData = oModel3.getData();
				var oAppointment = {
					id: newProjectId,
					name: oName,
					description: oDescription,
					location: oLocation,
					start_date_time: oStartDate,
					end_date_time: oEndDate,
					type: 'Type03',
					google_event_id:newGoogleEventId,
					status:1,
					reminder_time:oReminderTime,
					attendees:oAttendees
				};
	
				oData[0].appointments.push(oAppointment);
				console.log(oData);
				oModel3.setData(oData);
				
				//Reload Dashboard
				parent.reloadDashboard();
			});	
			//oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			
		},onAddProjectGoTo: function (oEvent) {
			this.byId("projectAddDialog").close();
			
			
		},onAddAppointment: function (oEvent) {
			this.byId("planningCalendarDialog").close();
			
			//Create busy Dialog
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

				text:oBundle.getText("savingData")

	  			});
			
			var oName = this.getView().getModel("pc").getProperty("/name");
			var oDescription = this.getView().getModel("pc").getProperty("/description");
			var oLocation = this.getView().getModel("pc").getProperty("/location");
			var oStartDate = this.getView().getModel("pc").getProperty("/start_date_time");
			var oEndDate = this.getView().getModel("pc").getProperty("/end_date_time");
			var oStatus = this.getView().getModel("pc").getProperty("/status");
			var oReminderTime = this.getView().getModel("pc").getProperty("/reminder_time");
			var oAttendees = this.getView().getModel("pc").getProperty("/attendees");
			var oAttendeeEmails = this.getView().getModel("pc").getProperty("/attendee_emails");
			
			var oModel = new JSONModel();
			oModel.setData({
				"transaction_id":0,
				"project_id":0,
				"name": oName,
				"description":oDescription,
				"location":oLocation,
				"status":oStatus,
				"start_date_time":oStartDate,
				"end_date_time":oEndDate,
				"reminder_time":oReminderTime,
				"attendees":oAttendees,
				"attendee_emails":oAttendeeEmails
				});
				
			this.getView().setModel(oModel,"appointment");
			
			oModel.attachRequestSent(function(){busyDialog.open();});
			var oParameter = this.getView().getModel("appointment").getJSON();
			
			//Post to backend
			oModel.loadData("/api/Appointment/0", oParameter, true, 'POST', null, false, null);	
			
			var parent = this;
			oModel.attachRequestCompleted(function(){
				busyDialog.close(); 	
				var newAppointmentId = oModel.getProperty("/modelId");
				var newGoogleEventId = oModel.getProperty("/google_event_id");

				//Insert in planning calendar ui
				var oModel3 = parent.getView().getModel();
				var oData = oModel3.getData();
				var oAppointment = {
					id: newAppointmentId,
					name: oName,
					description: oDescription,
					location: oLocation,
					start_date_time: oStartDate,
					end_date_time: oEndDate,
					type:'Type05',
					status:1,
					google_event_id:newGoogleEventId,
					reminder_time:oReminderTime,
					attendees:oAttendees
				};
	
				oData[0].appointments.push(oAppointment);
				console.log(oData);
				oModel3.setData(oData);
				
				//Reload Dashboard
				parent.reloadDashboard();
			});	
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			
			
		},onAddHint: function (oEvent) {
			this.byId("planningCalendarDialog").close();
			
			//Create busy Dialog
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

				text:oBundle.getText("savingData")

	  			});
			
			var oName = this.getView().getModel("pc").getProperty("/name");
			var oDescription = this.getView().getModel("pc").getProperty("/description");
			var oLocation = this.getView().getModel("pc").getProperty("/location");
			var oStartDate = this.getView().getModel("pc").getProperty("/start_date_time");
			var oEndDate = this.getView().getModel("pc").getProperty("/end_date_time");
			var oStatus = this.getView().getModel("pc").getProperty("/status");
			var oReminderTime = this.getView().getModel("pc").getProperty("/reminder_time");
			var oAttendees = this.getView().getModel("pc").getProperty("/attendees");
			var oAttendeeEmails = this.getView().getModel("pc").getProperty("/attendee_emails");
			
			var oModel = new JSONModel();
			oModel.setData({
				"transaction_id":0,
				"project_id":0,
				"name": oName,
				"description":oDescription,
				"location":oLocation,
				"status":oStatus,
				"start_date_time":oStartDate,
				"end_date_time":oEndDate,
				"reminder_time":oReminderTime,
				"attendees":oAttendees,
				"attendee_emails":oAttendeeEmails
				});
				
			this.getView().setModel(oModel,"hint");
			
			oModel.attachRequestSent(function(){busyDialog.open();});
			var oParameter = this.getView().getModel("hint").getJSON();
			
			//Post to backend
			oModel.loadData("/api/Hint/0", oParameter, true, 'POST', null, false, null);	
			
			var parent = this;
			oModel.attachRequestCompleted(function(){
				busyDialog.close(); 	
				var newHintId = oModel.getProperty("/modelId");
				var newGoogleEventId = oModel.getProperty("/google_event_id");

				//Insert in planning calendar ui
				var oModel3 = parent.getView().getModel();
				var oData = oModel3.getData();
				var oAppointment = {
					id: newHintId,
					name: oName,
					description: oDescription,
					location: oLocation,
					start_date_time: oStartDate,
					end_date_time: oEndDate,
					type:'Type08',
					status:1,
					google_event_id:newGoogleEventId,
					reminder_time:oReminderTime,
					attendees:oAttendees
				};
	
				oData[0].appointments.push(oAppointment);
				console.log(oData);
				oModel3.setData(oData);
				
				//Reload Dashboard
				parent.reloadDashboard();
			});	
			//oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			
			
			
		},onAddBirthday: function (oEvent) {
			this.byId("planningCalendarDialog").close();
			
			//Create busy Dialog
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

				text:oBundle.getText("savingData")

	  			});
			
			var oName = this.getView().getModel("pc").getProperty("/name");
			var oDescription = this.getView().getModel("pc").getProperty("/description");
			var oLocation = this.getView().getModel("pc").getProperty("/location");
			var oStartDate = this.getView().getModel("pc").getProperty("/start_date_time");
			var oEndDate = this.getView().getModel("pc").getProperty("/end_date_time");
			var oStatus = this.getView().getModel("pc").getProperty("/status");
			var oReminderTime = this.getView().getModel("pc").getProperty("/reminder_time");
			var oAttendees = this.getView().getModel("pc").getProperty("/attendees");
			var oAttendeeEmails = this.getView().getModel("pc").getProperty("/attendee_emails");
			
			var oModel = new JSONModel();
			oModel.setData({
				"name": oName,
				"description":oDescription,
				"location":oLocation,
				"status":oStatus,
				"start_date_time":oStartDate,
				"end_date_time":oEndDate,
				"reminder_time":oReminderTime,
				"attendees":oAttendees,
				"attendee_emails":oAttendeeEmails
				});
				
			this.getView().setModel(oModel,"birthday");
			
			oModel.attachRequestSent(function(){busyDialog.open();});
			var oParameter = this.getView().getModel("birthday").getJSON();
			
			//Post to backend
			oModel.loadData("/api/Birthday/0", oParameter, true, 'POST', null, false, null);	
			
			var parent = this;
			oModel.attachRequestCompleted(function(){
				busyDialog.close(); 	
				var newProjectId = oModel.getProperty("/modelId");
				var newGoogleEventId = oModel.getProperty("/google_event_id");

				//Insert in planning calendar ui
				var oModel3 = parent.getView().getModel();
				var oData = oModel3.getData();
				var oAppointment = {
					id: newProjectId,
					name: oName,
					description: oDescription,
					location: oLocation,
					start_date_time: oStartDate,
					end_date_time: oEndDate,
					type:'Type01',
					status:1,
					google_event_id:newGoogleEventId,
					reminder_time:oReminderTime,
					attendees:oAttendees
				};
	
				oData[0].appointments.push(oAppointment);
				console.log(oData);
				oModel3.setData(oData);
				
				//Reload Dashboard
				parent.reloadDashboard();
			});	
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			
			
			
		},onAddTask: function (oEvent) {
			this.byId("planningCalendarDialog").close();
			
			//Create busy Dialog
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

				text:oBundle.getText("savingData")

	  			});
			
			var oName = this.getView().getModel("pc").getProperty("/name");
			var oDescription = this.getView().getModel("pc").getProperty("/description");
			var oLocation = this.getView().getModel("pc").getProperty("/location");
			var oStartDate = this.getView().getModel("pc").getProperty("/start_date_time");
			var oEndDate = this.getView().getModel("pc").getProperty("/end_date_time");
			var oStatus = this.getView().getModel("pc").getProperty("/status");
			var oReminderTime = this.getView().getModel("pc").getProperty("/reminder_time");
			var oAttendees = this.getView().getModel("pc").getProperty("/attendees");
			var oAttendeeEmails = this.getView().getModel("pc").getProperty("/attendee_emails");
			
			var oModel = new JSONModel();
			oModel.setData({
				"transaction_id":0,
				"project_id":0,
				"name": oName,
				"description":oDescription,
				"location":oLocation,
				"status":oStatus,
				"start_date_time":oStartDate,
				"end_date_time":oEndDate,
				"reminder_time":oReminderTime,
				"attendees":oAttendees,
				"attendee_emails":oAttendeeEmails
				});
				
			this.getView().setModel(oModel,"task");
			
			oModel.attachRequestSent(function(){busyDialog.open();});
			var oParameter = this.getView().getModel("task").getJSON();
			
			//Post to backend
			oModel.loadData("/api/Task/0", oParameter, true, 'POST', null, false, null);	
			
			var parent = this;
			oModel.attachRequestCompleted(function(){
				busyDialog.close(); 	
				var newTaskId = oModel.getProperty("/modelId");
				var newGoogleEventId = oModel.getProperty("/google_event_id");

				//Insert in planning calendar ui
				var oModel3 = parent.getView().getModel();
				var oData = oModel3.getData();
				var oTask = {
					id: newTaskId,
					name: oName,
					description: oDescription,
					location: oLocation,
					start_date_time: oStartDate,
					end_date_time: oEndDate,
					type:'Type07',
					status:1,
					google_event_id:newGoogleEventId,
					reminder_time:oReminderTime,
					attendees:oAttendees
				};
	
				oData[0].appointments.push(oTask);
				console.log(oData);
				oModel3.setData(oData);
				
				//Reload Dashboard
				parent.reloadDashboard();
			});	
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			
			
		},onSave: function (oEvent) {
			this.byId("planningCalendarEditDialog").close();
			
			
			
			//Create busy Dialog
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var busyDialog = new sap.m.BusyDialog({

				text:oBundle.getText("savingData")

	  			});
			
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
			

			
			//Set new model
			var oModelName = '';
			var oModelNameBig = '';
			var oModel = new JSONModel();
			
			//Set model to update
			if(oType == 'Type01'){
				oModelName = 'birthday';
				oModelNameBig = 'Birthday';
				oModel.setData({
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
			}else if (oType == 'Type05'){
				oModelName = 'appointment'
				oModelNameBig = 'Appointment';
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
			}else if (oType == 'Type08'){
				oModelName = 'hint'
				oModelNameBig = 'Hint';
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
			}else if (oType == 'Type07'){
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
			}
			
			
			this.getView().getModel().setProperty(oPath + "/name", oName);
			this.getView().getModel().setProperty(oPath + "/start_date_time", oStartDate);
			this.getView().getModel().setProperty(oPath + "/end_date_time", oEndDate);
			this.getView().getModel().setProperty(oPath + "/description", oDescription);
			this.getView().getModel().setProperty(oPath + "/location", oLocation);
			this.getView().getModel().setProperty(oPath + "/status", oStatus);
			this.getView().getModel().setProperty(oPath + "/google_event_id", oGoogleEventId);
			this.getView().getModel().setProperty(oPath + "/reminder_time", oReminderTime);
			
			this.getView().setModel(oModel,oModelName);
			
			oModel.attachRequestSent(function(){busyDialog.open();});
			var oParameter = this.getView().getModel(oModelName).getJSON();
			
			//Put to backend
			oModel.loadData("/api/"+oModelNameBig+"/"+oId, oParameter, true, 'PUT', null, false, null);	
			
			var parent = this;
			oModel.attachRequestCompleted(function(){
				busyDialog.close(); 	
				parent.reloadDashboard();
			});	
			oModel.attachRequestFailed(function(){sap.m.MessageToast.show(oBundle.getText("sessionEnded"));sap.m.URLHelper.redirect("/login");});
			
			
			
			
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
			
			console.log('payterm '+payment_term_id);
			console.log('paymeth '+payment_method_id);
			
			this.getView().getModel("project").setProperty("/customer_id", masterdata_id);
			
			this.getView().getModel("project").setProperty("/payment_term_id", payment_term_id);
			this.getView().getModel("project").setProperty("/customer_id", masterdata_id);
			
			this.getView().getModel("customer").setProperty("/customer_name", company_name_1+" "+company_name_2+" "+first_name+" "+last_name);
			this.getView().getModel("project").setProperty("/customer_person_id", 0);
			
			
			var oModel = new sap.ui.model.json.JSONModel("/api/Masterdata/"+masterdata_id+"/Person", false);
			this.getView().setModel(oModel,"customer_people"); 
			
			if (aContexts && aContexts.length) {
				sap.m.MessageToast.show("You have chosen " + company_name_1+" "+company_name_2+" "+first_name+" "+last_name);
			} else {
				sap.m.MessageToast.show("No new item was selected.");
			}
			oEvent.getSource().getBinding("items").filter([]);
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
		reloadDashboard : function(oEvent){
			
			//Reload dashboard after change
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
			
			var oModel = new sap.ui.model.json.JSONModel();
			
			oModel.loadData("/api/Dashboard/1/0/0/dashboard/start="+oStartDateFormat+"&end="+oEndDateFormat, false);
			this.getOwnerComponent().setModel(oModel, "dashboard");
			
		}
 
	});
 

 
});