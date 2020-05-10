<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Customer as Customer;
use App\CustomerShippingAddress as CustomerShippingAddress;
use App\CustomerContactPerson as CustomerContactPerson;
use App\CustomerBankAccount as CustomerBankAccount;
use App\Mail\SendDocument;

use Fpdf;

use Carbon\Carbon;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Collection;

use Google_Client;
use Google_Service_Calendar;
use Google_Service_Calendar_Event;
use Google_Service_Calendar_EventDateTime;
use Google_Service_Calendar_EventReminder;
use Google_Service_Calendar_EventReminders;
define('GOOGLE_CALENDAR_ID', 'gggg015sq72qfncn4v5stii07s@group.calendar.google.com');
//define('GOOGLE_CALENDAR_ID', 'primary');

class ApiController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    use ValidatesRequests;
    public function __construct()
    {
        $this->middleware('auth');
    }
    
    
    /**
     * Returns an authorized API client.
     * @return Google_Client the authorized client object
     */
    function getClient()
    {
    	$client = new Google_Client();
    	$client->setApplicationName('Google Calendar API PHP Quickstart');
    	$client->setScopes(Google_Service_Calendar::CALENDAR);
    	$client->setAuthConfig(storage_path('app/google_calendar/credentials.json'));
    	$client->setAccessType('offline');
    	$client->setPrompt('select_account consent');
    	
    	// Load previously authorized token from a file, if it exists.
    	// The file token.json stores the user's access and refresh tokens, and is
    	// created automatically when the authorization flow completes for the first
    	// time.
    	$tokenPath = storage_path('app/google_calendar/token.json');
    	if (file_exists($tokenPath)) {
    		$accessToken = json_decode(file_get_contents($tokenPath), true);
    		$client->setAccessToken($accessToken);
    	}
    	
    	// If there is no previous token or it's expired.
    	if ($client->isAccessTokenExpired()) {
    		// Refresh the token if possible, else fetch a new one.
    		if ($client->getRefreshToken()) {
    			$client->fetchAccessTokenWithRefreshToken($client->getRefreshToken());
    		} else {
    			// Request authorization from the user.
    			$authUrl = $client->createAuthUrl();
    			//printf("Open the following link in your browser:\n%s\n", $authUrl);
    			//print 'Enter verification code: ';
    			$authCode = '';
    			
    			// Exchange authorization code for an access token.
    			$accessToken = $client->fetchAccessTokenWithAuthCode($authCode);
    			$client->setAccessToken($accessToken);
    			
    			// Check to see if there was an error.
    			if (array_key_exists('error', $accessToken)) {
    				throw new Exception(join(', ', $accessToken));
    			}
    		}
    		// Save the token to a file.
    		if (!file_exists(dirname($tokenPath))) {
    			mkdir(dirname($tokenPath), 0700, true);
    		}
    		file_put_contents($tokenPath, json_encode($client->getAccessToken()));
    	}
    	return $client;
    }
    
    
	
    //GET Requests
    public function getApi(Request $request, $model = null, $id = null, $relation = null, $rid = null, $action = null, $string = null, $filter = null)
    {
        //Create model name
        $modelName='App\\' . $model;
        
        //Action
        if(is_null($action)){
        
            //Request model or relation of model
            if (is_null($relation )){
                
                //Request all of model
                if (is_null($id)){
                    $data_response = $modelName::all(); 
                    //Request empty model or a specific model   
                }else{
                    //Request empty model
                    if($id == 0){                   
                        $data = Schema::getColumnListing(app($modelName)->getTable()); 
                        $data_response = array_fill_keys($data, '');
                        
                        //Special Data
                        if (array_key_exists('default', $data_response)) {
                            $data_response['default'] = 0;
                        }
                        
                        if (array_key_exists('rental_vehicle', $data_response)) {
                            $data_response['rental_vehicle'] = 0;
                        }
                        
                        if (array_key_exists('group', $data_response)) {
                            $data_response['group'] = 1;
                        }
                        
                        if (array_key_exists('role', $data_response)) {
                            $data_response['role'] = 'customer';
                        }
                        
                        if (array_key_exists('birthday', $data_response)) {
                            $data_response['birthday'] = '1970-01-01';
                        }
                        
                        if (array_key_exists('country_id', $data_response)) {
                            $data_response['country_id'] = '1';
                        }
                        
                        if (array_key_exists('discount_id', $data_response)) {
                            $data_response['discount_id'] = '1';
                        }
                        
                        if (array_key_exists('payment_term_id', $data_response)) {
                            $data_response['payment_term_id'] = '1';
                        }
                        
                        if (array_key_exists('payment_method_id', $data_response)) {
                            $data_response['payment_method_id'] = '1';
                        }

                        if (array_key_exists('payment_method_id', $data_response)) {
                            $data_response['payment_method_id'] = '1';
                        }
                    //Request specific model of model    
                    }else{
                        $data_response = $modelName::find($id);
                    }
     
                }
                
            //Return json
            return response()->json($data_response);
            
            //Return relation data    
            }else{
                if($id == 0){ 
                    //$data_response = $modelName::find($rid)->$relation; 
                    //$data_response = $modelName::has($relation)->get();
                    
                    
                    //Return json
                    return response()->json();
                }else{
                $data_response = $modelName::find($id)->$relation;
                
                //Return json
                return response()->json($data_response);
                }
            }
            
        //Action    
        }elseif($action == "search"){
            /*
            $data = $modelName::where('first_name', 'LIKE', "%$string%")
            ->orWhere('last_name', 'LIKE', "%$string%")
            ->orWhere('company_name_1', 'LIKE', "%$string%")
            ->orWhere('company_name_2', 'LIKE', "%$string%")
            ->orWhere('zip', 'LIKE', "%$string%")
            ->get();
           
            */
            
            parse_str($string, $search_array);
            parse_str($filter, $filter_array);
            
            $query = $modelName::query();
            
            
            $i = 0;
            foreach ($search_array as $key => $value){
                    if(strpos($model, 'Document') !== false){
                        $tableName = (new $modelName)->getTable();

                        $query->orWhere("$tableName.$key", 'LIKE', "%$value%");
                    
                        foreach ($filter_array as $f_key => $f_value){
                            $query->where($f_key, '=', "$f_value");
                            
                        }
                        $query->join("masterdata", "$tableName.masterdata_id", "=", "masterdata.id")
                        ->select("$tableName.*", "masterdata.company_name_1", "masterdata.company_name_2", "masterdata.first_name", "masterdata.last_name");
    
                    }else{
                        $query->orWhere($key, 'LIKE', "%$value%");
                    
                        foreach ($filter_array as $f_key => $f_value){
                            $query->where($f_key, '=', "$f_value");
                            
                        }
                    }

            }
                
            
      
            //$query->whereRaw('BAZDMEG ' );
            /*
                if(isset($search_term))
                {
                    $search_terms = explode(' ', $search_term);
                    
                    $fields = array('id', 'title', 'case');
                    
                    $cases = $cases->where(function($q) use ($search_terms, $fields){
                        foreach ($search_terms as $term)
                        {
                            foreach ($fields as $field)
                            {
                                $q->orWhere($field, 'LIKE', '%'. $term .'%');
                            }
                            
                        }
                    });
                        
                }
                
                if (isset($categoryID))
                {
                    $cases = $cases->where('category_ID','=', $categoryID);
                    
                }
                
                if (isset($cityID))
                {
                    $cases = $cases->where('city_ID','=', $cityID);
                    
                }
                
                */
                

            
            $data_response = $query->get();
            //$data_response = $query->toSql();
            //$data_response = $query->getBindings();
           
            
            return response()->json($data_response);
        }elseif($action == "upcomingProjects"){
            // get the current time
            $current = Carbon::now();

            $projects = 'App\\Project'::where([["start_date_time", '>=', $current]])->orderBy('start_date_time', 'asc')->get();
            return response()->json($projects);


            
   
        
        }elseif($action == "notInvoicedProjects"){
            // get the current time
            $current = Carbon::now();

            $project_not_invoiced = 'App\\Project'::where([["start_date_time", '<=', $current], ["status", '=', 2]])->doesntHave('document_invoices')->orderBy('start_date_time', 'desc')->get();

            return response()->json($project_not_invoiced);
   
        }elseif($action == "latest"){
            // get the current time
            $current = Carbon::now();
            
            // sub days to the current time
            $current_sub_days = $current->subDays($string);
            
            if(strpos($model, 'Document') !== false){
                $tableName = (new $modelName)->getTable();

                $query = $modelName::where("$tableName.updated_at", ">", "$current_sub_days");

                $query->join("masterdata", "$tableName.masterdata_id", "=", "masterdata.id")
                ->select("$tableName.*", "masterdata.company_name_1", "masterdata.company_name_2", "masterdata.first_name", "masterdata.last_name");
            }else{
                $query = $modelName::where('updated_at', '>', "$current_sub_days");
            }

            $data = $query->orderBy('updated_at', 'desc')->get();
            
            return response()->json($data);

           
            
        }elseif($action == "merged"){
            //Create relation model name
            $relationModelName='App\\' . $relation;
            
            //$first = $relationModelName::all();
            parse_str($filter, $filter_array);
            $query = $relationModelName::query();
            foreach ($filter_array as $f_key => $f_value){
                $query->where($f_key, '=', "$f_value");
                
            }
            $first = $query->get();
            
            if ($id == 0){
                $data_response = $first;
                foreach ($data_response as $key => $row)
                {
                    $data_response[$key]['selected'] = false;
                }
                    
                
            }else{
                $second  = $modelName::find($id)->$relation;
                            
                $data_response = $first->merge($second);
                
                foreach ($data_response as $key => $row)
                    {
                        
                        if(isset($data_response[$key]['pivot'])) {
                            $data_response[$key]['day_price']  = $data_response[$key]['pivot']['day_price'];
                            $data_response[$key]['hour_price']  = $data_response[$key]['pivot']['hour_price'];
                            $data_response[$key]['km_price']  = $data_response[$key]['pivot']['km_price'];
                            $data_response[$key]['selected'] = true;
                        }else{
                            $data_response[$key]['selected'] = false;
                        }
                    }
            }
            //Return json
            return response()->json($data_response);
        }elseif($action == "dispositions"){
            $first  = $modelName::find($id)->ProjectResource;
            $second  = $modelName::find($id)->ProjectResourceDisposition;
                            
            $data_response = $first->merge($second);


            foreach ($data_response as $key => $row)
            {
                if($data_response[$key]['quantity'] > 1 && $data_response[$key]['type'] == 1){
                    foreach(range(2,$data_response[$key]['quantity']) as $number){
                        $new_data = array();
                        $new_data = $data_response[$key];
                        //$new_data['name'].=" $number";
                        $data_response[] = $new_data;
                    }
                    
                }
                
                if(isset($data_response[$key]['pivot'])) {
                    $data_response[$key]['person_id']  = $data_response[$key]['pivot']['person_id'];
                    $data_response[$key]['vehicle_id']  = $data_response[$key]['pivot']['vehicle_id'];
                    $data_response[$key]['status']  = $data_response[$key]['pivot']['status'];
                }else{
                    $data_response[$key]['selected'] = false; 
                }
                $data_response[$key]['vehicle_id']  = $data_response[$key]['pivot']['vehicle_id'];
                unset($data_response[$key]['pivot']);


            }


            
            //Return json
            return response()->json($data_response);
        }elseif($action == "tree"){
            
            //$data_response = $modelName::where("parent_id", '=', "0")->with('sub_category')->get();
            

            $data_response = $modelName::where("parent_id", '=', "0")->select('id','depth', 'name','description','icon')->with([
                'nodes' => function($query) {
                //Second level    
            $query->select('id', 'parent_id','depth', 'name','description','icon')->with([
                    'nodes' => function($query) {
                    //Third level    
                    $query->select('id', 'parent_id','name','description');
                    }
                    ])->with([
                        'items' => function($query) {
                        //Items third level
                    $query->select('id','category_id','name','description','rental_price', 'unit_id', 'tax_id');
                        }
                        ]);
                }
                ])->with([
                    'items' => function($query) {
                    //Items second level
                $query->select('id','category_id','name','description','rental_price', 'unit_id', 'tax_id');
                    }
                    ])->get();
            
            
            
            //Return json
            return response()->json($data_response);
        }elseif($action == "project_tree"){

        	$data_response = $modelName::where("id", '=', $id)->select('id','name','description','status')->with([
        			'subprojects' => function($query) {
        			//Subprojects
        			$query->select('id','project_id','name','description','status');
        					}
        					])->get();
				
			//Return json
        	return response()->json($data_response);
        	
        }elseif($action == "role"){
            
        /*
            $data_response = $modelName::where("role", '=', $string)->distinct()->with([
                'Masterdata' => function($query) {
                //Relation
            $query->select();
                }])->get();
                
                
             $data_response = $modelName::where("role", '=', $string)
            ->orWhere("role", '=', $string)
            ->join('masterdata', 'masterdata.group', '=', 'masterdata_groups.id')
            ->get();
            
            
            
            parse_str($string, $search_array);
            parse_str($filter, $filter_array);
            
            $query = $modelName::query();

            foreach ($search_array as $key => $value){
                //$query->join('masterdata', 'masterdata.group', '=', 'masterdata_groups.id');
                $query->orWhere($key, '=', $value);
            }
            
            */
            
        	
            if ($relation == "0"){
            	$tableName = (new $modelName)->getTable();
            	
            	$arr = explode(",", $string);
            	
            	$data_response = $modelName::whereIn("$tableName.role", $arr)
            	->get(["$tableName.*"]);

            }else{
            	
            	$relationModelName='App\\' . $relation;
	            $relationTableName = (new $relationModelName)->getTable();
	            $tableName = (new $modelName)->getTable();
	            
	            $arr = explode(",", $string);
	            
	            $data_response = $modelName::whereIn("$tableName.role", $arr)
	            ->join("$relationTableName", "$relationTableName.group", "=", "$tableName.id")
	            ->get(["$relationTableName.*"]);
            	
            	
            }
            

            
            return response()->json($data_response);
        }elseif($action == "number"){    
            parse_str($string, $action_array);
            
            //Get the current time
            $current = Carbon::now();
            
            //Check for test mode
            if(!isset($action_array['test'])){
                //Get model
                $Q1 = $modelName::find($id);
                
                //Reset sequential number on the end of the year
                if($Q1->current_year == $current->year){
                    //pass
                }else{
                    if($Q1->reset == 1){
                        $Q1->current_year = $current->year;
                        $Q1->sequential_number = 0;
                    }
                }
                //Encrease sequential number 
                $Q1->sequential_number = $Q1->sequential_number+1;
                
                $Q1->save();
                
                $pattern = $Q1->pattern;
                $sequential_number= $Q1->sequential_number;
                $length = $Q1->length;
            }else{
                $pattern = $action_array['pattern'];
                if($action_array['sequential_number'] == 0){
                    $action_array['sequential_number'] = $action_array['sequential_number']+1;
                }
                $sequential_number= $action_array['sequential_number'];
                $length = $action_array['length'];
                $relation = 'test';
            }
            
            //Sequential number add zeros
            $sequential_number = str_pad($sequential_number, $length ,'0', STR_PAD_LEFT);
            
            
            //Pattern '/\[+(parent)+\]/'
            preg_match_all("/\{([^\}]+)\}/", $pattern, $matches);
            
            foreach ($matches[0] as $key => $match) {
                
                if($matches[1][$key] == "number"){
                    //Add sequential number
                    $pattern =  preg_replace("/$match/",  $sequential_number, $pattern);
                }elseif($matches[1][$key] == "parent"){
                    //Add Vars
                    $pattern =  preg_replace("/$match/",  "$relation", $pattern);
                    
                }else{
                    $pattern =  preg_replace("/$match/",  $current->format($matches[1][$key]), $pattern);
                }
            }
           
            


            //Assemble
            $data_response['number'] = $pattern;
            
            //Return
            return response()->json($data_response);
        }elseif($action == "number1"){
            $response = $modelName::getNumber($id,$string,$relation);
            return $response;
        }elseif($action == "calendar"){
        	parse_str($string, $date_array);
        	
        	$data_response = array();
        	
        	//Projects
        	$data_response['name'] = 'Projekte';
        	$data_response['text'] = 'active';
        	$data_response['icon'] = 'sap-icon://business-one'; 
        	$data_response['headers'] = [];
        	$data_response['headers'][0]['start_date_time'] = "2019-01-09 00:00:00";
        	$data_response['headers'][0]['end_date_time'] = "2019-01-13 23:59:00";
        	$data_response['headers'][0]['name'] = "Fusball WM";
        	$data_response['headers'][0]['description'] = "ein test...";
        	$data_response['headers'][0]['type'] = "Type03";
        	$data_response['headers'][0]['tentation'] = "false";
        	
        	// "SELECT * FROM bo_planer WHERE 
        	//datum_von <= '$akt_monat_bis' AND datum_bis >='$akt_monat_von' AND periode = '0' 
        	//OR  
        	//datum_von <= '$akt_monat_bis' AND datum_bis >='$akt_monat_von' AND periode >= '0' ORDER by datum_von"
        	
        	$project = 'App\\Project'::where("start_date_time", '<=', $date_array['end'])->where("end_date_time", '>=',$date_array['start'])->select('id','name','number','description','location','type','status','start_date_time', 'end_date_time','attendees','google_event_id','reminder_time')->get();
        	
        	
        	foreach($project as &$row) {
        		//Set icon from project type
        		if($row->type == 1){
        			$row->icon = "sap-icon://retail-store";
        		}elseif($row->type == 2){
        			$row->icon = "sap-icon://shipping-status";
        		}elseif($row->type == 3){
        			$row->icon = "sap-icon://employee";
        		}elseif($row->type == 4){
        			$row->icon = "sap-icon://wrench";
        		}elseif($row->type == 5){
        			$row->icon = "sap-icon://lead";
        		}
        		
        		//Set planner type
        		$row->type = "Type03"; //TODO var type in double use
        		

        	}
        	
        	//$data_response['appointments'] = $project;
        	
        	
        	//Appointments
        	$appointment = 'App\\Appointment'::where("start_date_time", '<=', $date_array['end'])->where("end_date_time", '>=',$date_array['start'])->select('id','name','description','location','status','start_date_time', 'end_date_time','attendees','google_event_id','reminder_time')->get();
        	
        	foreach($appointment as &$row) {
        		$row->type = "Type05";
        		
        	}
        	
        	//$data_response['appointments']= $data_response['appointments']->append($appointment);
        	
        	
        	//Hints
        	$hint = 'App\\Hint'::where("start_date_time", '<=', $date_array['end'])->where("end_date_time", '>=',$date_array['start'])->select('id','name','description','location','status','start_date_time', 'end_date_time','attendees','google_event_id','reminder_time')->get();
        	
        	foreach($hint as &$row) {
        		$row->type = "Type08";
        		
        	}
        	

        	//Birthdays
        	$birthday = 'App\\Birthday'::where("start_date_time", '<=', $date_array['end'])->where("end_date_time", '>=',$date_array['start'])->select('id','name','description','location','status','start_date_time', 'end_date_time','attendees','google_event_id','reminder_time')->get();
        	
        	foreach($birthday as &$row) {
        		$row->type = "Type01";
        		
        	}
        	
        	//Tasks
        	$task = 'App\\Task'::where("start_date_time", '<=', $date_array['end'])->where("end_date_time", '>=',$date_array['start'])->select('id','name','description','location','status','start_date_time', 'end_date_time','attendees','google_event_id','reminder_time')->get();
        	
        	foreach($task as &$row) {
        		$row->type = "Type07";
        		
        	}
        	
        	//Assemble
        	$project->each(function($element) use (&$appointment) {
        		
        		$appointment->push($element);
        		
        	});
        	
        		$appointment->each(function($element) use (&$hint) {
        			
        			$hint->push($element);
        			
        		});
 			
        			$hint->each(function($element) use (&$birthday) {
        				
        				$birthday->push($element);
        				
        			});
        			
        				$birthday->each(function($element) use (&$task) {
        					
        					$task->push($element);
        					
        				});
 			//$project = array_values($project);
 			//$appointment = array_values($appointment);
 			//$hint = array_values($hint);
 			
 			//array_merge($project, $appointment, $hint);
 			//array_push($project, ...$hint);
 			
        	$data_response['appointments']= $task;
        			//$data_response  = $project;
        	
        	/*
        	foreach ($data_response as $key => $row)
        	{
        		
        			$data_response[$key]['start']  = $data_response[$key]['pivot']['day_price'];
        			$data_response[$key]['end']  = $data_response[$key]['pivot']['hour_price'];
        			$data_response[$key]['title']  = $data_response[$key]['pivot']['km_price'];
        			$data_response[$key]['info'] = true;
        			$data_response[$key]['type'] = true;
        			$data_response[$key]['pic'] = true;
        			$data_response[$key]['tentative'] = false;
        	
        	}
        	*/
        	
        	//Return
        	return response()->json([$data_response]);
        }elseif($action == "dashboard"){
        	parse_str($string, $date_array);
        	
        	$data_response = array();
        	
        	//Tasks
        	$task_open = 'App\\Task'::where("status", '=', 1)->get()->count();
        	$task_overdue_start = 'App\\Task'::where([["start_date_time", '<=', $date_array['start']],  ["status", '=', 1]])->get()->count();
        	$task_overdue_end = 'App\\Task'::where([["end_date_time", '<=', $date_array['start']],  ["status", '=', 1]])->get()->count();
        	
        	$task_info = "zu erledigen";
        	$task_state = "Success";
        	if($task_overdue_start > 0){
        		$task_info = "$task_overdue_start überfällig";
        		$task_state = "Warning";
        	}
        	
        	if($task_overdue_end > 0){
        		
        		$task_info = "$task_overdue_end sehr überfällig ($task_overdue_start)";
        		$task_state = "Error";
        	}
        	$start = $date_array['start'];
        	$data_response = [];
        	
        	
        	$data_response[0]['icon'] = "task";
        	$data_response[0]['number'] = $task_open;
        	$data_response[0]['title'] = "Aufgaben";
        	$data_response[0]['info'] = "$task_info";
        	$data_response[0]['infoState'] = $task_state;
            $data_response[0]['target'] = 'task';
            
            //Appointments
        	$appointment_tentative = 'App\\Appointment'::where([["start_date_time", '>=', $date_array['start']], ["status", '=', 1]])->get()->count();
        	$appointment_confirmed = 'App\\Appointment'::where([["start_date_time", '>=', $date_array['start']], ["status", '=', 2]])->get()->count();
        	
        	$appointment_info = "";
        	$appointment_state = "Success";
        	if($appointment_tentative > 0){
        		$appointment_info = "davon $appointment_tentative offen";
        		$appointment_state = "Warning";
        	}
        	$appointment_all = $appointment_confirmed + $appointment_tentative;
        	$data_response[1]['icon'] = "appointment";
        	$data_response[1]['number'] = "$appointment_all";
        	$data_response[1]['title'] = "Bevorstehende Termine";
        	$data_response[1]['info'] = $appointment_info;
        	$data_response[1]['infoState'] = $appointment_state;
        	$data_response[1]['target'] = 'appointment-search';
        	
        	//Projects
        	$project_tentative = 'App\\Project'::where([["start_date_time", '>=', $date_array['start']],  ["status", '=', 1]])->get()->count();
        	$project_confirmed = 'App\\Project'::where([["start_date_time", '>=', $date_array['start']],  ["status", '=', 2]])->get()->count();
            $project_cancelled = 'App\\Project'::where([["start_date_time", '>=', $date_array['start']],  ["status", '=', 3]])->get()->count();
            
        	$project_info = "";
        	$project_state = "Success";
        	if($project_tentative > 0){
        		$project_info = "$project_tentative offen, $project_cancelled abgesagt";
        		$project_state = "Warning";
        	}
        	$project_all = $project_confirmed + $project_tentative + $project_cancelled;
        	$data_response[2]['icon'] = "business-one";
        	$data_response[2]['number'] = "$project_all";
        	$data_response[2]['title'] = "Bevorstehende Projekte";
        	$data_response[2]['info'] = $project_info;
        	$data_response[2]['infoState'] = $project_state;
            $data_response[2]['target'] = 'project-search';
            $data_response[2]['model'] = 'upcomingProjects';
        	
            //Projects -Dry Hire
            /*
        	$project_tentative = 'App\\Project'::where([["start_date_time", '>=', $date_array['start']], ["type", '=', 1], ["status", '=', 1]])->get()->count();
        	$project_confirmed = 'App\\Project'::where([["start_date_time", '>=', $date_array['start']], ["type", '=', 1], ["status", '=', 2]])->get()->count();
                        

        	$project_info = "";
        	$project_state = "Success";
        	if($project_tentative > 0){
        		$project_info = "davon $project_tentative offen";
        		$project_state = "Warning";
        	}
        	$project_all = $project_confirmed + $project_tentative;
        	$data_response[2]['icon'] = "retail-store";
        	$data_response[2]['number'] = "$project_all";
        	$data_response[2]['title'] = "Bevorstehende DryHire Projekte";
        	$data_response[2]['info'] = $project_info;
        	$data_response[2]['infoState'] = $project_state;
            $data_response[2]['target'] = 'project-search';
            */

            //Projects - not invoiced
        	//$project_tentative = 'App\\Project'::where([["start_date_time", '>=', $date_array['start']], ["type", '=', 1], ["status", '=', 1]])->get()->count();
        	//$project_confirmed = 'App\\Project'::where([["start_date_time", '>=', $date_array['start']], ["type", '=', 1], ["status", '=', 2]])->get()->count();
                  
            //$project_not_invoiced = 'App\\Project'::doesntHave('document_invoices')->get()->count();

             // get the current time
             $current = Carbon::now();
            
             
            
            $project_not_invoiced = 'App\\Project'::where([["end_date_time", '<=', $current], ["status", '=', 2]])->doesntHave('document_invoices')->get()->count();
            
            // sub days to the current time
            $current_sub_days = $current->subDays(5);
            $project_not_invoiced_overdue = 'App\\Project'::where([["end_date_time", '<=', $current_sub_days], ["status", '=', 2]])->doesntHave('document_invoices')->get()->count();
            
            
        	$project_info = "nichts zu berechnen";
        	$project_state = "Success";
        	if($project_not_invoiced > 0){
        		$project_info = "$project_not_invoiced zu berechnen";
        		$project_state = "Warning";
        	}
        	
        	if($project_not_invoiced_overdue > 0){
        		
        		$project_info = "$project_not_invoiced_overdue überfällig ";
        		$project_state = "Error";
        	}


        	$data_response[3]['icon'] = "monitor-payments";
        	$data_response[3]['number'] = "$project_not_invoiced";
        	$data_response[3]['title'] = "Abzurechnende Projekte";
        	$data_response[3]['info'] = $project_info;
        	$data_response[3]['infoState'] = $project_state;
            $data_response[3]['target'] = 'project-search';
            $data_response[3]['model'] = 'notInvoicedProjects';

            //Invoices not payed
        	
             // get the current time
            $current = Carbon::now();
            
            $invoices_not_payed = 0;
            
            //$invoices_not_payed = 'App\\InvoiceDocument'::where([["end_date_time", '<=', $current], ["status", '=', 2]])->doesntHave('document_invoices')->get()->count();
            
            // sub days to the current time
            $current_sub_days = $current->subDays(5);
            //$invoices_not_payed_overdue = 'App\\InvoiceDocument'::where([["end_date_time", '<=', $current_sub_days], ["status", '=', 2]])->doesntHave('document_invoices')->get()->count();
            $invoices_not_payed_overdue = 0;
            
        	$invoice_info = "keine offenen";
        	$invoice_state = "Success";
        	if($invoices_not_payed  > 0){
        		$invoice_info = "$invoices_not_payed zu berechnen";
        		$invoice_state = "Warning";
        	}
        	
        	if($invoices_not_payed_overdue > 0){
        		
        		$invoice_info = "$invoices_not_payed_overdue überfällig ";
        		$invoice_state = "Error";
        	}


        	$data_response[4]['icon'] = "unpaid-leave";
        	$data_response[4]['number'] = "$invoices_not_payed";
        	$data_response[4]['title'] = "Offene Rechnungen";
        	$data_response[4]['info'] = $invoice_info;
        	$data_response[4]['infoState'] = $invoice_state;
            $data_response[4]['target'] = 'document-search';
            $data_response[4]['model'] = 'DocumentInvoice';

        					
        	//Return
        	return response()->json($data_response);
        }elseif($action == "documentPreview"){
            $data_response = $modelName::documentPreview($model,$id,$relation,$rid);
            return response()->json($data_response);
            
        }elseif($action == "documentCreate"){
            $data_response = $modelName::documentCreate($model,$id,$relation,$rid);
            //$role = 'invoice';
            //$data_response = 'App\\Document'::where("role", '=', $role)->get();
            //$data_response = 'App\\DocumentInvoiceItem'::find(1)->subitems;
            
            return response()->json($data_response);
            
        }elseif($action == "relatedDocuments"){
        	//Get Documents
        	$documents = 'App\\Document'::select('model')->get();
        	$collection = new Collection();
        	$model = $modelName::find($id);
        	//$relation_response = $model;
        	//$collection ->merge($relation_response);
        	

        	foreach ($documents as $document) {
        		$model_response = $model->Documents($document->model);
        		
        		foreach ($model_response as $key => $row) {
        		    $model_response[$key]['model'] = $document->model;
        		}
        		
        		
        		if (!isset($collection)) {
        			$collection= $model_response;
        		} else {
        			$collection= $collection->merge($model_response);
        		}
        	}
        	
        	
        	
        	$data_response = $collection;
        
        	return response()->json($data_response);
        }elseif($action == "completeProjects"){
            //Get incomplete projects
            $projects = 'App\\Project'::select('id','number','start_date_time','end_date_time')->where('number','99')->get();
            
            
            $data = [];
            foreach ($projects as $project) {
                $number = 'App\\NumberObject'::getNumber(8);
                $data['number']= $number;
                'App\\Project'::where('id', $project->id)->update($data);  
                
               $subproject=[];
               $subproject['transaction_id']=0;
               $subproject['project_id']=$project->id;
               $subproject['number']=$data['number'].".1";
               $subproject['name']="Job";
               $subproject['description']="";
               $subproject['reference_number']="";
               $subproject['company_site_id']=0;
               $subproject['return_company_site_id']=0;
               $subproject['manager_person_id']=0;
               $subproject['status']=1;
               $subproject['priority']=0;
               $subproject['type']=0;
               $subproject['delivery_type_id']=0;
               $subproject['shipping_address_id']=0;
               $subproject['shipping_address_note']=0;
               //$subproject['offer_deadline_date']=$project->start_date_time;
               $subproject['total']=0;
               $subproject['discount']=0;
               $subproject['discount_id']=0;
               $subproject['lock_schedule']=0;
               $subproject['available_later']=0;
               $subproject['check_out']=0;
               $subproject['check_in']=0;
               $subproject['finalized']=0;
               $subproject['invoiced']=0;
               $subproject['no_invoice']=0;
               $subproject['start_date_time']=$project->start_date_time;
               $subproject['end_date_time']=$project->end_date_time;
               $subproject['days']=1;
               $subproject['days_used']=1;
               $subproject['days_off']=1;
               $subproject['factor']=1.0;
           
               
               $subproject['created_user_id'] = Auth::user()->id;
               $subproject['updated_user_id'] = Auth::user()->id;
               $subproject['created_at'] = Carbon::now();
               $subproject['updated_at'] = Carbon::now();
                
                //Insert Row in db
                $newRowModel = 'App\\Subproject'::create($subproject);
                $newRowModelId= $newRowModel->id;
            }
            
            
            
            
           
            
            
            
            $data_response = $newRowModelId;
            return response()->json($data_response);
            
        }elseif($action == "allToGoogleCalendar"){
            //Get incomplete projects
            $projects = $modelName::select('id','name','description','location','start_date_time','end_date_time','reminder_time','attendees')->where('google_event_id','')->get();
            
            
            $data = [];
            foreach ($projects as $data) {
                
                //Prepare attendees
                $attendee_emails = array();
                if($data['attendees'] == ''){
                    array_push($attendee_emails,array('email'=>'laemmle@bigwood.de'));
                }else{
                    $attendees = explode(',', $data['attendees']);
                    
                    foreach ($attendees as $value) {
                        
                        $email = 'App\\Person'::select('email')->where('id',$value)->get();
                        $email = $email[0]['email'];
                        array_push($attendee_emails,array('email'=>$email));
                    }
                }
                
                

                
                //$data['emails'] = $attendee_emails;
                
                
                //Insert in google calendar
                $google_event_id = 0;
                if($model == 'Appointment' or $model == 'Hint' or $model == 'Birthday' or $model == 'Project' or $model == 'Task'){
                    
                    $start_date_time= Carbon::parse($data['start_date_time'])->timezone('Europe/Berlin')->toIso8601String();
                    $end_date_time= Carbon::parse($data['end_date_time'])->timezone('Europe/Berlin')->toIso8601String();
                    
                    $reminderTime= Carbon::parse($data['reminder_time']);
                    $reminderTime= ($reminderTime->hour * 60) + $reminderTime->minute;
                    
                    //$data['reminder_time'] = $reminderTime;
                    
                    
                    //ColorId like Model
                    if($model== "Project"){
                        $colorId= "11";
                    }elseif($model== "Appointment"){
                        $colorId= "3";
                        
                    }elseif($model== "Hint"){
                        $colorId= "10";
                        
                    }elseif($model== "Birthday"){
                        $colorId= "5";
                    }elseif($model== "Task"){
                        $colorId= "7";
                    }
                    
                    
                    
                    // Get the API client and construct the service object.
                    $client = $this->getClient();
                    $service = new Google_Service_Calendar($client);
                    
                    $event = new Google_Service_Calendar_Event(array(
                        'summary' => $data['name'],
                        'location' => $data['location'],
                        'description' => $data['description'],
                        'colorId' => $colorId,
                        'start' => array(
                            'dateTime' => $start_date_time,
                            
                        ),
                        'end' => array(
                            'dateTime' => $end_date_time,
                            
                        ),
                        'attendees' => $attendee_emails,
                        'reminders' => array(
                            'useDefault' => FALSE,
                            'overrides' => array(
                                //array('method' => 'email', 'minutes' => 24 * 60),
                                array('method' => 'popup', 'minutes' => $reminderTime),
                            ),
                        ),
                    ));
                    
                    
                    try{
                        $event = $service->events->insert(GOOGLE_CALENDAR_ID, $event);
                    } catch(Exception $e) {
                        // Do something with the error here
                    }
                    
                    $modelId = $data['id'];
                    //Google event id for local db
                    //$google_event_id = $event['id'];
                    $data2 = [];
                    $data2['google_event_id'] = $event['id'];
                    
                    
                    //Update DB with google event id
                    
                    


                    $modelName::where('id', $modelId)->update($data2);
                    
                   
                }
                
                
                
                
                
                
            }
            
            
            
            
            
            
            
            
            $data_response = $projects;
            return response()->json($data_response);
            
        }
            
        
    }
    
    //PUT Requests
    public function putApi(Request $request, $model = null, $id = null, $relation = null, $rid = null, $action = null)
    {
        //Create model name
        $modelName='App\\' . $model;
        $modelNameRelation='App\\' . $relation;
        
        if (is_null($id ))
        {
            return response()->json("{status:0}");
        }else{
            if(is_null($action)){
            $data = $request->json()->all();
            $data['updated_user_id'] = Auth::user()->id;
            $data['updated_at'] = Carbon::now();
            
            //$MysqlModel = $modelName::find($id);
            //$MysqlModel->fill($data);
            //$MysqlModel->save();
            
            //Update google calendar
            if($model == 'Appointment' or $model == 'Hint' or $model == 'Birthday' or $model == 'Project' or $model == 'Task'){
            	
            	/*
            	//Prepare attendees
            	$attendees = explode(',', $data['attendee_emails']);
            	$attendee_emails = array();
            	foreach ($attendees as $value) {
            		array_push($attendee_emails,array('email'=>$value));
            	}
            	unset($data['attendee_emails']);
            	*/
            	
            	//Prepare attendees
            	$attendee_emails = array();
            	if($data['attendees'] == ''){
            		//array_push($attendee_emails,array('email'=>'laemmle@bigwood.de'));
            	}else{
            		$attendees = explode(',', $data['attendees']);
            		
            		foreach ($attendees as $value) {
            			
            			$email = 'App\\Person'::select('email')->where('id',$value)->get();
            			$email = $email[0]['email'];
            			array_push($attendee_emails,array('email'=>$email));
            		}
            	}
            	unset($data['attendee_emails']);
            	
            	
            	// Get the API client and construct the service object.
            	$client = $this->getClient();
            	$service = new Google_Service_Calendar($client);
            	
            	$event = $service->events->get(GOOGLE_CALENDAR_ID, $data['google_event_id']);
            	
            	$event->setSummary($data['name']);
            	$event->setDescription($data['description']);
            	$event->setLocation($data['location']);
                
                //$start_date_time= Carbon::parse($data['start_date_time'])->subHours(2)->timezone('Europe/Berlin')->toIso8601String();
            	//$end_date_time= Carbon::parse($data['end_date_time'])->subHours(2)->timezone('Europe/Berlin')->toIso8601String();
            	
                
            	$start_date_time= Carbon::parse($data['start_date_time'])->timezone('Europe/Berlin')->toIso8601String();
            	$end_date_time= Carbon::parse($data['end_date_time'])->timezone('Europe/Berlin')->toIso8601String();
            	
            	$reminderTime= Carbon::parse($data['reminder_time']);
            	$reminderTime= ($reminderTime->hour * 60) + $reminderTime->minute;
            	
            	$start = new Google_Service_Calendar_EventDateTime();
            	$start->setDateTime($start_date_time);
            	$event->setStart($start);
            	
            	$end = new Google_Service_Calendar_EventDateTime();
            	$end->setDateTime($end_date_time);
            	$event->setEnd($end);
            	
            	$reminder1 = new Google_Service_Calendar_EventReminder();
            	$reminder1->setMethod('popup');
            	$reminder1->setMinutes($reminderTime);
            	
            	$event->attendees = $attendee_emails;
            	
            	$reminder = new Google_Service_Calendar_EventReminders();
            	$reminder->setUseDefault('false');
            	$reminder->setOverrides(array($reminder1));
            	$event->setReminders($reminder);
            	
            	$optParams = array(
            			'sendUpdates' => 'all',
            	);
            	$updatedEvent = $service->events->update(GOOGLE_CALENDAR_ID, $event->getId(), $event);
            	
            	try {
            	
            	} catch(Exception $e) {
            		// Do something with the error here
            	}
            	
            }
            
            
            $modelName::where('id', $id)->update($data);
            
            return response()->json("{status:2");
            
            //Set default or favorite for one item
            }elseif($action == "default"){

                $relationManyObj = $modelName::find($id)->$relation;
                
                foreach ($relationManyObj as $relationObj) {
                    
                    $relationObj->default = 0;
                    
                    $relationObj->save();
                }

                
                
                $relationObj = $modelNameRelation::find($rid);
                
                $relationObj->default = 1;
                
                $relationObj->save();
                
                
                return response()->json("{status:3, model:$model, id:$id, relation:$relation, rid:$rid, action:$action}");
            }elseif($action == "sync"){
                $data = $request->json()->all();
                $model = $modelName::find($id);
                $data_new = [];
                
                foreach ($data as $key => $row)
                {
                    
                    if($data[$key]['selected'] == true) {
                        $id = $data[$key]['id'];
                        
                        $data_new[$id]['day_price']  = $data[$key]['day_price'];
                        $data_new[$id]['hour_price']  = $data[$key]['hour_price'];
                        $data_new[$id]['km_price']  = $data[$key]['km_price'];
                        $data_new[$id]['updated_user_id'] = Auth::user()->id;
                        $data_new[$id]['created_user_id'] = Auth::user()->id;
                        $data_new[$id]['updated_at'] = Carbon::now();
                        
                    }
                }

                $model->$relation()->sync($data_new);
                
                return response()->json("{status:3, model:$model, id:$id, relation:$relation, rid:$rid, action:$action}");
                //return $request->json()->all();
            }elseif($action == "patch"){
                $data = $request->json()->all();
                //$model = $modelName::find($id);
                
                $id = 0;
                $ref_id = 0;
                
                //Iterate over cattegories / subprojects
                foreach ($data as $key => $row)
                {
                    
                    $id = $data[$key]['id'];
                    
                    if($id == 0){
                        //Create
                        $data[$key]['created_user_id'] = Auth::user()->id;
                        $data[$key]['updated_user_id'] = Auth::user()->id;
                        $data[$key]['updated_at'] = Carbon::now()->format('Y-m-d');
                        $data[$key]['created_at'] = Carbon::now()->format('Y-m-d');
                        
                        $data_new = $data[$key];
                        unset($data_new['items']);
                        $data_new['updated_at'] = Carbon::now();
                        $data_new['created_at'] = Carbon::now();
                        
                        $model = $modelName::create($data_new);
                        $data[$key]['id'] = $model->id;
                        
                    }else{  
                        //Update
                        $data[$key]['updated_user_id'] = Auth::user()->id;
                        $data[$key]['updated_at'] = Carbon::now()->format('Y-m-d');
                        
                        
                        $data_new = $data[$key];
                        unset($data_new['items']);
                        $data_new['updated_at'] = Carbon::now();
                        
                        $modelName::where('id', $id)->update($data_new);
                    }
                    
                    
                    //Iterate over Items / categories
                    foreach ($data[$key]['items'] as $key2 => $row2)
                    {
                        $id2 = $data[$key]['items'][$key2]['id'];
                        if($id2 == 0){
                            //Create
                            $data[$key]['items'][$key2]['created_user_id'] = Auth::user()->id;
                            $data[$key]['items'][$key2]['updated_user_id'] = Auth::user()->id;
                            $data[$key]['items'][$key2]['updated_at'] = Carbon::now()->format('Y-m-d');
                            $data[$key]['items'][$key2]['created_at'] = Carbon::now()->format('Y-m-d');
                            
                            $data[$key]['items'][$key2]['ref_id'] = $data[$key]['id'];
                            
                            $data_new = $data[$key]['items'][$key2];
                            unset($data_new['items']);
                            $data_new['updated_at'] = Carbon::now();
                            $data_new['created_at'] = Carbon::now();
                            
                            $model = $modelName::create($data_new);
                            $data[$key]['items'][$key2]['id'] = $model->id;
                            
                        }else{
                            //Update
                            $data[$key]['items'][$key2]['updated_user_id'] = Auth::user()->id;
                            $data[$key]['items'][$key2]['updated_at'] = Carbon::now()->format('Y-m-d');
                            
                            $data_new = $data[$key]['items'][$key2];
                            unset($data_new['items']);
                            $data_new['updated_at'] = Carbon::now();
                            
                            
                            $modelName::where('id', $id2)->update($data_new);
                        }
                                            
                        //Iterate over Items
                        if (array_key_exists('items', $data[$key]['items'][$key2])) {
                            foreach ($data[$key]['items'][$key2]['items'] as $key3 => $row3)
                            {
                                $id3 = $data[$key]['items'][$key2]['items'][$key3]['id'];
                                if($id3 == 0){
                                    //Create
                                    $data[$key]['items'][$key2]['items'][$key3]['created_user_id'] = Auth::user()->id;
                                    $data[$key]['items'][$key2]['items'][$key3]['updated_user_id'] = Auth::user()->id;
                                    $data[$key]['items'][$key2]['items'][$key3]['updated_at'] = Carbon::now()->format('Y-m-d');
                                    $data[$key]['items'][$key2]['items'][$key3]['created_at'] = Carbon::now()->format('Y-m-d');
                                    
                                    $data[$key]['items'][$key2]['items'][$key3]['ref_id'] = $data[$key2]['id'];
                                    
                                    $data_new = $data[$key]['items'][$key2]['items'][$key3];
                                    unset($data_new['items']);
                                    $data_new['updated_at'] = Carbon::now();
                                    $data_new['created_at'] = Carbon::now();
                                    
                                    $model = $modelName::create($data_new);
                                    $data[$key]['items'][$key2]['items'][$key3]['id'] = $model->id;
                                    
                                }else{
                                    //Update
                                    $data[$key]['items'][$key2]['items'][$key3]['updated_user_id'] = Auth::user()->id;
                                    $data[$key]['items'][$key2]['items'][$key3]['updated_at'] = Carbon::now()->format('Y-m-d');
                                    
                                    $data_new = $data[$key]['items'][$key2]['items'][$key3];
                                    unset($data_new['items']);
                                    $data_new['updated_at'] = Carbon::now();
                                    
                                    
                                    $modelName::where('id', $id3)->update($data_new);
                                }
                            }
                        }
                    }
                        

                }
                
                
                
                return response()->json($data);
                //return response()->json("{status:3, model:$model, id:$id, relation:$relation, rid:$rid, action:$action}");
                //return $request->json()->all();
            }
            
        }
        
    }
    
    //POST Requests
    public function postApi(Request $request, $model = null, $id = null, $relation = null, $rid = null, $action = null)
    {
        //Create model name
        $modelName='App\\' . $model;
        $relationModelName='App\\' . $relation;
        $number = "0";
        
        if(is_null($action)){
            
        
            if ($id==0)
            {
    
                $data = $request->json()->all();
                $data['created_user_id'] = Auth::user()->id;
                $data['updated_user_id'] = Auth::user()->id;
                $data['created_at'] = Carbon::now();
                $data['updated_at'] = Carbon::now();
                
                if(isset($data['number_object_id'])){
                	$number = 'App\\NumberObject'::getNumber($data['number_object_id']);
                    $data['number'] = $number;
                    unset($data['number_object_id']);
                }
     			
                //Insert in google calendar
                $google_event_id = 0;
                if($model == 'Appointment' or $model == 'Hint' or $model == 'Birthday' or $model == 'Project' or $model == 'Task'){
               	
                	$start_date_time= Carbon::parse($data['start_date_time'])->timezone('Europe/Berlin')->toIso8601String();
                	$end_date_time= Carbon::parse($data['end_date_time'])->timezone('Europe/Berlin')->toIso8601String();
                	
                	$reminderTime= Carbon::parse($data['reminder_time']);
                	$reminderTime= ($reminderTime->hour * 60) + $reminderTime->minute;
                	
                	//$data['reminder_time'] = $reminderTime;
                	
                	
                	//ColorId like Model
                	if($model== "Project"){
                		$colorId= "11";
                	}elseif($model== "Appointment"){
                		$colorId= "3";
                		
                	}elseif($model== "Hint"){
                		$colorId= "10";
                		
                	}elseif($model== "Birthday"){
                		$colorId= "5";
                	}elseif($model== "Task"){
                		$colorId= "7";
                	}
                	
    
                	
                	// Get the API client and construct the service object.
                	$client = $this->getClient();
                	$service = new Google_Service_Calendar($client);
                	
                	
                	//Prepare attendees
                	$attendee_emails = array();
                	if($data['attendees'] == ''){
                		//array_push($attendee_emails,array('email'=>'laemmle@bigwood.de'));
                	}else{
                		$attendees = explode(',', $data['attendees']);
                		
                		foreach ($attendees as $value) {
                			
                			$email = 'App\\Person'::select('email')->where('id',$value)->get();
                			$email = $email[0]['email'];
                			array_push($attendee_emails,array('email'=>$email));
                		}
                	}
                	
                	
                	
                	//Prepare attendees
                	/*
                	$attendees = explode(',', $data['attendee_emails']);
                	$attendee_emails = array();
                	foreach ($attendees as $value) {
                		array_push($attendee_emails,array('email'=>$value));
                	} 
                	*/
                	unset($data['attendee_emails']);
                	
                	
                	
                	
                	
                	$event = new Google_Service_Calendar_Event(array(
                			'summary' => $data['name'],
                			'location' => $data['location'],
                			'description' => $data['description'],
                			'colorId' => $colorId,
                			'start' => array(
                					'dateTime' => $start_date_time,
                					
                			),
                			'end' => array(
                					'dateTime' => $end_date_time,
                					
                			),
                			'attendees' => $attendee_emails,
                			'reminders' => array(
                					'useDefault' => FALSE,
                					'overrides' => array(
                							//array('method' => 'email', 'minutes' => 24 * 60),
                							array('method' => 'popup', 'minutes' => $reminderTime),
                					),
                			),
                	));
                	
                	
                	try{
                	    $event = $service->events->insert(GOOGLE_CALENDAR_ID, $event);
                	} catch(Exception $e) {
                		// Do something with the error here
                	}
                	//Google event id for local db
                	$google_event_id = $event['id'];
                	$data['google_event_id'] = $google_event_id;
                }
     			
                //Insert in db
                $model = $modelName::create($data);
                $modelId= $model->id;
    
                return response()->json(['status' => '1', 'modelId' => $modelId, 'number' => $number, 'google_event_id' => $google_event_id]);
                
    
            }else{
                return response()->json("{status:0}");
            }
        }elseif($action=='morph' or $action=='morph_preview'){
            //Action morph models, from / to
            
            //Get new document number
            if($action == 'morph'){
                if($relation == 'DocumentOffer'){
                    $number = 'App\\NumberObject'::getNumber(4);
                }elseif($relation == 'DocumentOrder'){
                    $number = 'App\\NumberObject'::getNumber(3);
                }elseif($relation == 'DocumentConfirmation'){
                    $number = 'App\\NumberObject'::getNumber(13);
                }elseif($relation == 'DocumentInvoice'){
                    $number = 'App\\NumberObject'::getNumber(1);
                }elseif($relation == 'DocumentReversalInvoice'){
                    $number = 'App\\NumberObject'::getNumber(2);
                }elseif($relation == 'DocumentReminder'){
                    $number = 'App\\NumberObject'::getNumber(7);
                }elseif($relation == 'DocumentRental'){
                    $number = 'App\\NumberObject'::getNumber(5);
                }elseif($relation == 'DocumentHire'){
                    $number = 'App\\NumberObject'::getNumber(12);
                }elseif($relation == 'DocumentDeliveryNote'){
                    $number = 'App\\NumberObject'::getNumber(6);
                }elseif($relation == 'DocumentMaterialList'){
                    $number = 'App\\NumberObject'::getNumber(14);
                }elseif($relation == 'Project'){
                    $number = 'App\\NumberObject'::getNumber(8);
                }   
            }else{
                $number = 'PRE-00-00001';
            }
            
                
     
            
            if($model == 'Project' or $model == 'Subproject'){
            //Special traitment for project
                //Document
                if($model == 'Project'){
                    $project = $modelName::find($id)->toArray();
                    $newModel['project_id'] = $project['id'];
                    $newModel['subproject_id'] = 0;
                }else{
                    $subproject = $modelName::find($id)->toArray();
                    $project = 'App\\Project'::find($subproject['project_id'])->toArray();
                    $newModel['project_id'] = $project['id'];
                    $newModel['subproject_id'] = $id;
                }
                
                $newModel['transaction_id'] = 0;
                
                $newModel['masterdata_id'] = $project['customer_id'];
                $newModel['person_id'] = $project['customer_person_id'];
                $newModel['masterdata_name'] = '';
                
                $newModel['number'] = $number;
                $newModel['type'] = 0;
                
                $newModel['payment_method_id'] = $project['payment_method_id'];
                $newModel['payment_term_id'] = $project['payment_term_id'];
                $newModel['total'] = $project['total'];
                $newModel['discount_id'] = $project['discount_id'];
                $newModel['discount'] = $project['discount'];
                
                $newModel['created_user_id'] = Auth::user()->id;
                $newModel['updated_user_id'] = Auth::user()->id;
                $newModel['created_at'] = Carbon::now();
                $newModel['updated_at'] = Carbon::now();

                if($action == 'morph'){
                   $newModel = $relationModelName::create($newModel);
                    $newDocumentId= $newModel->id; 
                }else{
                    $previewDocument = $newModel;
                    $newDocumentId = 0;
                }
                
                
                //Document items from Subprojects -> Materials and Resources
                $count_subproject = 0;
                $count_category = 0;
                $count_item = 0;

                if($model == 'Project'){
                    $subprojects = $modelName::find($id)->subprojects;
                }else{
                    $subprojects[0] = $modelName::find($id);
                }

                $previewItems = [];
                
                foreach ($subprojects as $subproject) {
                    $count_subproject++;
                    $count_category = 0;
                    //$newItem = $subproject->toArray();
                    $newItem['ref_id'] = 0;
                    $newItem['transaction_id'] = $subproject['transaction_id'];
                    $newItem['project_id'] = $subproject['project_id'];
                    $newItem['subproject_id'] = $subproject['id'];
                    $newItem['inventory_id'] = 0;
                    $newItem['resource_type_id'] = 0;
                    $newItem['type'] = 0;
                    $newItem['pos'] = $count_subproject;
                    $newItem['name'] = $subproject['name'];
                    $newItem['description'] = $subproject['description'];
                    $newItem['quantity'] = 0;
                    $newItem['price'] = 0;
                    $newItem['unit_id'] = 0;
                    $newItem['discount_id'] = $subproject['discount_id'];
                    $newItem['discount'] = $subproject['discount'];
                    $newItem['tax_id'] = 0;
                    $newItem['start_date_time'] = $subproject['start_date_time'];
                    $newItem['end_date_time'] = $subproject['end_date_time'];
                    $newItem['days'] = $subproject['days'];
                    $newItem['days_used'] = $subproject['days_used'];
                    $newItem['days_off'] = $subproject['days_off'];
                    $newItem['factor'] = $subproject['factor'];
                    $newItem['status'] = 0;

                    $newItem['created_user_id'] = Auth::user()->id;
                    $newItem['updated_user_id'] = Auth::user()->id;
                    $newItem['created_at'] = Carbon::now();
                    $newItem['updated_at'] = Carbon::now();
                    

                    if($action == 'morph'){
                       //Insert Subproject in db
                        $newSubprojectModel = $newModel->items()->create($newItem);
                        $newSubprojectId= $newSubprojectModel->id; 
                    }else{
                        array_push($previewItems,  (object)$newItem);
                        $newSubprojectModel = (object)$newItem;
                        $newSubprojectId = 0;
                    }
                    
                    
                    $subproject_material_categories = $subproject->SubprojectMaterialCategories->toArray();
                    //Insert Materials Categories
                    foreach ($subproject_material_categories as $subproject_material_categorie) {
                        $newItem = $subproject_material_categorie;
                        
                        //Count categorie pos
                        $count_category++;
                        $count_item = 0;
                        $newItem['type'] = 1;
                        $newItem['pos'] = "$count_subproject.$count_category";
                        $newItem['ref_id'] = $newSubprojectId;
                        $newItem['transaction_id'] = $subproject['transaction_id'];
                        $newItem['project_id'] = $subproject['project_id'];
                        $newItem['resource_type_id'] = 0;
                        $newItem['discount_id'] = $newSubprojectModel->discount_id; //TODO
                        $newItem['discount'] = $newSubprojectModel->discount; //TODO
                        $newItem['days_used'] = 0;
                        $newItem['days_off'] = $newSubprojectModel->days_off;
                        $newItem['factor'] = $newSubprojectModel->factor;
                        $newItem['days'] = $newSubprojectModel->days;
                        $newItem['created_user_id'] = Auth::user()->id;
                        $newItem['updated_user_id'] = Auth::user()->id;
                        $newItem['created_at'] = Carbon::now();
                        $newItem['updated_at'] = Carbon::now();
                        

                        
                        if($action == 'morph'){
                            //Insert Materials Categories in db
                            $newSubprojectMaterialCategorieModel = $newModel->items()->create($newItem);
                            $newSubprojectCategorieId= $newSubprojectMaterialCategorieModel->id;
                         }else{
                             array_push($previewItems,  (object)$newItem);
                             $newSubprojectCategorieId = 0;
                         }

                        //Insert categorie materials
                        $subproject_materials = 'App\\SubprojectMaterial'::find($newItem['id'])->subitems->toArray();
                        //$subproject_materials = $subproject->SubprojectMaterial->toArray();
                        //$data_response = 'App\\DocumentInvoiceItem'::find(1)->subitems;
                        
                        //Insert Materials
                        foreach ($subproject_materials as $subproject_material) {
                            $newItem = $subproject_material;
                            //Count materials
                            $count_item++;
                            $newItem['pos'] = "$count_subproject.$count_category.$count_item";
                            
                            $newItem['type'] = 2;
                            $newItem['ref_id'] = $newSubprojectCategorieId;
                            $newItem['transaction_id'] = $subproject['transaction_id'];
                            $newItem['project_id'] = $subproject['project_id'];
                            $newItem['resource_type_id'] = 0;
                            $newItem['discount_id'] = $newSubprojectModel->discount_id; //TODO
                            $newItem['discount'] = $newSubprojectModel->discount; //TODO
                            $newItem['days_off'] = $newSubprojectModel->days_off;
                            $newItem['days'] = $newSubprojectModel->days;
                            $newItem['days_used'] = $newSubprojectModel->days_used;
                            $newItem['factor'] = $newSubprojectModel->factor;
                            $newItem['created_user_id'] = Auth::user()->id;
                            $newItem['updated_user_id'] = Auth::user()->id;
                            $newItem['created_at'] = Carbon::now();
                            $newItem['updated_at'] = Carbon::now();
                            
                            if($action == 'morph'){
                                //Insert Materials in db
                                $newModel->items()->create($newItem);
                            }else{
                                 array_push($previewItems,  (object)$newItem);
                            }
                            
                            
                        
                        }
                    }
                    
                    
                    //Insert Subproject Resources
                    $subproject_resource_categories = $subproject->SubprojectResourceCategories->toArray();
 
                    foreach ($subproject_resource_categories as $subproject_resource_categorie) {
                        $newItem = $subproject_resource_categorie;
                        
                        //Count categorie pos
                        $count_category++;
                        $count_item = 0;
                        $newItem['type'] = 1;
                        $newItem['pos'] = "$count_subproject.$count_category";
                        $newItem['ref_id'] = $newSubprojectId;
                        $newItem['transaction_id'] = $subproject['transaction_id'];
                        $newItem['project_id'] = $subproject['project_id'];
                        $newItem['inventory_id'] = 0;
                        $newItem['resource_type_id'] = 0;
                        $newItem['discount_id'] = $newSubprojectModel->discount_id; //TODO
                        $newItem['discount'] = $newSubprojectModel->discount; //TODO
                        $newItem['days_used'] = 0;
                        $newItem['days_off'] = $newSubprojectModel->days_off;
                        $newItem['factor'] = $newSubprojectModel->factor;
                        $newItem['days'] = $newSubprojectModel->days;
                        $newItem['created_user_id'] = Auth::user()->id;
                        $newItem['updated_user_id'] = Auth::user()->id;
                        $newItem['created_at'] = Carbon::now();
                        $newItem['updated_at'] = Carbon::now();
                        

                        
                        if($action == 'morph'){
                            //Insert Materials Categories in db
                            $newSubprojectResourceCategorieModel = $newModel->items()->create($newItem);
                            $newSubprojectCategorieId= $newSubprojectResourceCategorieModel->id;
                         }else{
                             array_push($previewItems,  (object)$newItem);
                             $newSubprojectCategorieId = 0;
                         }

                        //Insert categorie materials
                        $subproject_resources = 'App\\SubprojectResource'::find($newItem['id'])->subitems->toArray();
                        //$subproject_materials = $subproject->SubprojectMaterial->toArray();
                        //$data_response = 'App\\DocumentInvoiceItem'::find(1)->subitems;
                        
                        //Insert Materials
                        foreach ($subproject_resources as $subproject_resource) {
                            $newItem = $subproject_resource;
                            //Count materials
                            $count_item++;
                            $newItem['pos'] = "$count_subproject.$count_category.$count_item";
                            
                            $newItem['type'] = 2;
                            $newItem['ref_id'] = $newSubprojectCategorieId;
                            $newItem['transaction_id'] = $subproject['transaction_id'];
                            $newItem['project_id'] = $subproject['project_id'];
                            $newItem['inventory_id'] = 0;
                            $newItem['resource_type_id'] = 0;
                            $newItem['discount_id'] = $newSubprojectModel->discount_id; //TODO
                            $newItem['discount'] = $newSubprojectModel->discount; //TODO
                            $newItem['days_off'] = $newSubprojectModel->days_off;
                            $newItem['days'] = $newSubprojectModel->days;
                            $newItem['days_used'] = $newSubprojectModel->days_used;
                            $newItem['factor'] = $newSubprojectModel->factor;
                            $newItem['created_user_id'] = Auth::user()->id;
                            $newItem['updated_user_id'] = Auth::user()->id;
                            $newItem['created_at'] = Carbon::now();
                            $newItem['updated_at'] = Carbon::now();
                            
                            if($action == 'morph'){
                                //Insert Materials in db
                                $newModel->items()->create($newItem);
                            }else{
                                 array_push($previewItems,  (object)$newItem);
                            }
                            
                            
                        
                        }
                    }
                }
                
                //Insert Project Resources
                if($model == 'Project'){
                    $count_subproject++;
                    $count_category = 0;
                    
                    $project = $modelName::find($id);
                    $project_resource_categories = $project->ProjectResourceCategories->toArray();
                    
                    if(sizeof($project_resource_categories) != 0){
                        //Insert Row for Services
                        $newItem['ref_id'] = 0;
                        $newItem['transaction_id'] = $project['transaction_id'];
                        $newItem['project_id'] = $project['id'];
                        $newItem['subproject_id'] = 0;
                        $newItem['inventory_id'] = 0;
                        $newItem['resource_type_id'] = 0;
                        $newItem['type'] = 0;
                        $newItem['pos'] = $count_subproject;
                        $newItem['name'] = 'Resourcen';
                        $newItem['description'] = '';
                        $newItem['quantity'] = 0;
                        $newItem['price'] = 0;
                        $newItem['unit_id'] = 0;
                        $newItem['discount_id'] = $project['discount_id'];
                        $newItem['discount'] = $project['discount'];
                        $newItem['tax_id'] = 0;
                        $newItem['start_date_time'] = $project['start_date_time'];
                        $newItem['end_date_time'] = $project['end_date_time'];
                        $newItem['days'] = 0;
                        $newItem['days_used'] = 0;
                        $newItem['days_off'] = 0;
                        $newItem['factor'] = 0;
                        $newItem['status'] = 0;
                        
                        $newItem['created_user_id'] = Auth::user()->id;
                        $newItem['updated_user_id'] = Auth::user()->id;
                        $newItem['created_at'] = Carbon::now();
                        $newItem['updated_at'] = Carbon::now();

                        
                        if($action == 'morph'){
                            //Insert Row in db
                            $newRowModel = $newModel->items()->create($newItem);
                            $newRowModelId= $newRowModel->id;
                        }else{
                            array_push($previewItems,  (object)$newItem);
                            $newRowModelId = 0;
                        }
                        
                        
        
                        //Insert Resource Categories
                        
                        foreach ($project_resource_categories as $project_resource_categorie) {
                            $newItem = $project_resource_categorie;
                            
                            //Count categorie pos
                            $count_category++;
                            $count_item = 0;
                            $newItem['type'] = 1;
                            $newItem['pos'] = "$count_subproject.$count_category";
                            $newItem['ref_id'] = $newRowModelId;
                            $newItem['subproject_id'] = 0;
                            $newItem['inventory_id'] = 0;
                            $newItem['transaction_id'] = $subproject['transaction_id'];
                            $newItem['project_id'] = $subproject['project_id'];
                            //$newItem['resource_type_id'] = 0;
                            $newItem['discount_id'] = 0; //TODO
                            //$newItem['days_off'] = 0;
                            $newItem['days_used'] = 0;
                            $newItem['created_user_id'] = Auth::user()->id;
                            $newItem['updated_user_id'] = Auth::user()->id;
                            $newItem['created_at'] = Carbon::now();
                            $newItem['updated_at'] = Carbon::now();
                            
                            if($action == 'morph'){
                                //Insert Row in db
                                $newProjectResourceCategorieModel = $newModel->items()->create($newItem);
                                $newProjectCategorieId= $newProjectResourceCategorieModel->id;
                            }else{
                                array_push($previewItems,  (object)$newItem);
                                $newProjectCategorieId = 0;
                            }

                            
                            //Insert categorie materials
                            $project_resources = 'App\\ProjectResource'::find($newItem['id'])->subitems->toArray();
                            //$subproject_materials = $subproject->SubprojectMaterial->toArray();
                            //$data_response = 'App\\DocumentInvoiceItem'::find(1)->subitems;
                            
                            //Insert Materials
                            foreach ($project_resources as $project_resource) {
                                $newItem = $project_resource;
                                //Count materials
                                $count_item++;
                                $newItem['pos'] = "$count_subproject.$count_category.$count_item";
                                
                                $newItem['type'] = 3;
                                $newItem['ref_id'] = $newProjectCategorieId;
                                $newItem['transaction_id'] = $subproject['transaction_id'];
                                $newItem['project_id'] = $subproject['project_id'];
                                $newItem['subproject_id'] = 0;
                                $newItem['inventory_id'] = 0;
                                //$newItem['resource_type_id'] = 0;
                                $newItem['discount_id'] = 0; //TODO
                                //$newItem['days_off'] = 0;
                                $newItem['days_used'] = 0;
                                $newItem['created_user_id'] = Auth::user()->id;
                                $newItem['updated_user_id'] = Auth::user()->id;
                                $newItem['created_at'] = Carbon::now();
                                $newItem['updated_at'] = Carbon::now();
                                
                                if($action == 'morph'){
                                    //Insert Row in db
                                    $newModel->items()->create($newItem);
                                }else{
                                    array_push($previewItems,  (object)$newItem);
                                }
        
                                
                            
                            
                            }
                            
                        }
                    }
                }
                
            }else{
            //Just copy
                //Document
                $newModel = $modelName::find($id)->toArray();
                $newModel['number'] = $number;
                $newModel['created_user_id'] = Auth::user()->id;
                $newModel['updated_user_id'] = Auth::user()->id;
                $newModel['created_at'] = Carbon::now();
                $newModel['updated_at'] = Carbon::now();
                
                $newModel = $relationModelName::create($newModel);
                $newDocumentId= $newModel->id;
               
                //Document items
                $relations = $modelName::find($id)->items->toArray();
                foreach ($relations as $newItem) {
                    $newItem['ref_id'] = $newDocumentId;
                    $newItem['created_user_id'] = Auth::user()->id;
                    $newItem['updated_user_id'] = Auth::user()->id;
                    $newItem['created_at'] = Carbon::now();
                    $newItem['updated_at'] = Carbon::now();
                   
                    $newModel->items()->create($newItem);
                }

            }
            if($action == 'morph'){
                $documentFilename = $relationModelName::documentCreate($relation,$newDocumentId,0,0);
                return response()->json(['status' => '1', 'id' => $newDocumentId, 'number' => $number,'filename' => $documentFilename]);
                
            }else{
                $documentFilename = $relationModelName::documentPreviewStream($previewDocument,0,$previewItems,0);
                //$documentFilename = 'test.pdf';
                //print_r ($previewDocument);
                //print_r ($previewItems);

                return response()->json(['status' => '1', 'id' => $newDocumentId, 'number' => $number,'filename' => $documentFilename]);
                //$previewItems = 'App\\DocumentOffer'::find(259)->items;
                
                //return response()->json([$previewItems]);
                
            }
        }elseif($action=='sendEmail'){
            //Send email
            $data = $request->json()->all();

            //$newModel = $modelName::find($id);
            
            Mail::to($data['mailTo'])->send(new SendDocument($data));
            $sessionId = session()->getId();
            Storage::deleteDirectory('attachments/'.$sessionId.'/');

            return response()->json(['status' => '1','data' => $data['mailTo']]);
                
        }elseif($action=='upload'){
            //Upload files
            //Storage::makeDirectory('attachments');
            $filename = $request->header('fileName');
            $sessionId = session()->getId();
            $name = $sessionId."_".$filename;
            $data = file_get_contents("php://input");
            Storage::put('attachments/'.$sessionId.'/'.$filename, $data);
            //$path = $request->file('uploadCollection')->store('attachments');
            //$files = Storage::files('attachments');
        
            //$request->file('file')->store('attachments');

            //$files = Storage::files('attachments');

            //Storage::put('attachments/', $request->file('file'));
/*
            $path = '';
            $files = $request->file('uploadCollection');
            if(!empty($files)) :
                foreach($files as $file) :
                  $name = time()."_".$file->getClientOriginalName();
                  //Storage::put('attachments/',$name, $file);
                  //$file->move('images/client/preview', $name);
                  //$car->file = $name;
                  //$file->store('attachments');

                  $path = $file->storeAs(
                    'attachments', $name
                );

                endforeach;
            endif;

        if($request->hasFile('file')) {

            // Upload path
            $destinationPath = 'attachments/';

            // Create directory if not exists
            if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0755, true);
            }

            // Get file extension
            $extension = $request->file('file')->getClientOriginalExtension();

            // Valid extensions
            $validextensions = array("jpeg","jpg","png","pdf");

            // Check extension
            if(in_array(strtolower($extension), $validextensions)){

                // Rename file 
                $fileName = str_slug(Carbon::now()->toDayDateTimeString()).rand(11111, 99999) .'.' . $extension;

                // Uploading file to given path
                $request->file('file')->move($destinationPath, $fileName); 
            }
        }
        */

            $files = Storage::files('attachments');
            //Storage::delete($files);
            return response()->json(['status' => '1','data' => $files]);
              
        }
        
        
    }
    
    //Delete Requests
    public function deleteApi(Request $request, $model = null, $id = null, $relation = null, $rid = null)
    {
        //Create model name
        $modelName='App\\' . $model;
        
        //Update google calendar
        if($model == 'Appointment' or $model == 'Hint' or $model == 'Birthday'){
            //TODO add project again
        	// Get the API client and construct the service object.
        	$client = $this->getClient();
        	$service = new Google_Service_Calendar($client);
        	try{
        	    $service->events->delete(GOOGLE_CALENDAR_ID, $rid);
        	} catch(Exception $e) {
        		// Do something with the error here
        	}
        }
        
        

        //Delete all data of project
        if($model == 'Project'){
            //Delete project
            
                //Delete project resources
                $projectResources = $modelName::find($id)->ProjectResource;
                foreach ($projectResources as $projectResource) {
                    'App\\ProjectResource'::destroy($projectResource['id']);
                }
                //Delete project tasks
                //Delete project appointments
                //Delete project documents
                //Delete project history


            //Delete subprojects
            $subprojects = $modelName::find($id)->subprojects;
            foreach ($subprojects as $subproject) {
            
                //Delete subproject resources
                $subprojectResources = 'App\\Subproject'::find($subproject['id'])->SubprojectResource;
                foreach ($subprojectResources as $subprojectResource) {
                    'App\\SubprojectResource'::destroy($subprojectResource['id']);
                }
                //Delete subproject materials
                $subprojectMaterials = 'App\\Subproject'::find($subproject['id'])->SubprojectMaterial;
                foreach ($subprojectMaterials as $subprojectMaterial) {
                    'App\\SubprojectMaterial'::destroy($subprojectMaterial['id']);
                }
                //Delete subproject tasks
                //Delete subproject appointments
                //Delete subproject documents
                //Delete subproject history

                //Finally delete subproject
                'App\\Subproject'::destroy($subproject['id']);
            }
            //Finally delete project
            $modelName::destroy($id);

            return response()->json("{status:2}");
        }else{
            //Delete model from db
            $MysqlModel = $modelName::destroy($id);
            return response()->json("{status:2}");
        }

        
        
        
    }
    

}
