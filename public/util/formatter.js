sap.ui.define([], function () {
	"use strict";
	return {
		test: function(s){
			
			
			console.log('TEST: '+s);
			
		    return s;
		},
		dateFormatter: function(s){
			var date = new Date(s);
			//var date = new Date("2019", "01", "09", "10", "0");
			//console.log('test s: '+s);
			//console.log('test date: '+date);
			
		    return date;
		},
		getNameById: function (oValue,oModel) {		
			for (var key in oModel) {
				if(oValue == oModel[key]['id']){
					var oName = oModel[key]['name'];
				}
			}
			
	        return oName
		},addDeselectOption: function() {
			console.log("addDeselectOption triggered");
			var that = this;
			this.getBinding("items").attachDataReceived(function(){
				that.insertItem(new sap.ui.core.ListItem({text: '', key: undefined}), 0);
			});
		},
		getAttendeesByIds: function (oValue,oModel) {
			var oNames = ''
			var oPeople = oValue.split(',');
			for (var i in oModel) {
				
				for (var j in oPeople ){
					if(oPeople[j] == oModel[i]['id']){
						oNames += oModel[i]['first_name'];
						oNames += ' ';
						oNames += oModel[i]['last_name'].slice(0, 1);
						oNames += '.  ';	
					}
					
				}

			}
			
	        return oNames
		},
		getPriorityByDate: function (oStartDateTime, oEndDateTime) {
			var oPriority = 'Low';
			var oToday = new Date();
			
			if(oToday > new Date(oStartDateTime)){
				oPriority = 'Medium';
			}
			
			if(oToday > new Date(oEndDateTime)){
				oPriority = 'High';
			}
			
	        return oPriority
		},
		getTreeNameById: function (oValue,oModel) {
			for (var key in oModel) {
				if(oValue == oModel[key]['id']){
					var oName = oModel[key]['name'];
				}
				for(var key2 in oModel[key]['nodes']){
					if(oValue == oModel[key]['nodes'][key2]['id']){
						var oName = oModel[key]['nodes'][key2]['name'];
					}
					
					for(var key3 in oModel[key]['nodes'][key2]['items']){
						
						if(oValue == oModel[key]['nodes'][key2]['items'][key3]['id']){
							var oName = oModel[key]['nodes'][key2]['items'][key3]['name'];
						}
					
						
					}
					
				}
				
				
			}
			
	        return oName
		},
		checkSelected: function (findId, arrayOfObject){
			try{ 
				return arrayOfObject.some(obj => obj.id === findId);
			}catch (e) {
			    return false
			}
			
		},
		checkPeopleGroup: function (findId, arrayOfObject){
			try{ 
				if (arrayOfObject[findId-1]['role'] == 'customer'){
					return false;	
				}else{
					return true;
				}
				
			}catch (e) {
			    return false
			}
			
		},
		checkReplaceDayPrice: function (findId, arrayOfObject, replace){
			var result;
			try{ 
				
				for (var key in arrayOfObject) {
					if(findId == arrayOfObject[key]['id']){
						result = arrayOfObject[key]['pivot']['day_price'];
					}

				}
				if (result === undefined){
					result = replace;
				}
				
				return result
			}catch (e) {
			    return 'err'
			}

		},
		checkReplaceHourPrice: function (findId, arrayOfObject, replace){
			var result;
			try{ 
				
				for (var key in arrayOfObject) {
					if(findId == arrayOfObject[key]['id']){
						result = arrayOfObject[key]['pivot']['hour_price'];
					}

				}
				if (result === undefined){
					result = replace;
				}
				
				return result
			}catch (e) {
			    return 'err'
			}

		},
		checkReplaceKmPrice: function (findId, arrayOfObject, replace){
			//"{ parts : [ {path: 'resource_types>id'}, {path:'resources>/'}, {path:'resource_types>day_price'} ], formatter: '.formatter.checkReplaceDayPrice' }" >
			
			var result;
			try{ 
				
				for (var key in arrayOfObject) {
					if(findId == arrayOfObject[key]['id']){
						result = arrayOfObject[key]['pivot']['km_price'];
					}

				}
				if (result === undefined){
					result = replace;
				}
				
				return result
			}catch (e) {
			    return 'err'
			}

		}
	};
});