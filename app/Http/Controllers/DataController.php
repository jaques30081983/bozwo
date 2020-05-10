<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Customer as Customer;
use App\CustomerShippingAdress as CustomerShippingAdress;
use App\CustomerContactPerson as CustomerContactPerson;
use Carbon\Carbon;
use Illuminate\Foundation\Validation\ValidatesRequests;

class DataController extends Controller
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
	
 
    	
    
    public function customer(Request $request, $id = null)
    {
    	
    	if ($request->isMethod('get')) {
    		if (is_null($id ))
    		{
    			$data_response = Customer::all();
    			return response()->json($data_response);
    		}
    		else
    		{
    			$data_response= Customer::find($id);
    			
    			if(is_null($data_response)){
   
    				//$data_response = Customer::all();
    				
    				$users = Customer::all();
    				$user = $users->first();
    				$data_response= array_keys($user->toArray());
    				//return response()->json();
    				//return response()->json($data_response);
    				
    				return response()->json([
    						'company_name_1' => '',
    						'company_name_2' =>'',
							'first_name' =>'',
							'last_name' =>'',
							'street' =>'',
							'house_number' =>'',
							'zip' =>'',
							'city' =>'',
							'country_id' =>1,
							'phone' =>'',
							'mobile' =>'',
							'fax' =>'',
							'email' =>'',
							'url' =>'',
							'tax_number' =>'',
							'vat_id' =>'',
							'discount' =>'',
							'payment_method_id' =>1,
							'payment_term_id' =>1,
							'shop_user_name' =>'',
							'shop_password' =>'',
							'note' =>'',
							'created_user_id' =>1,
							'updated_user_id' =>1
    				]);
    				
    			} else {
    				
    				return response()->json($data_response);
    			}
    		}
    	}
    	
    	if ($request->isMethod('post')) {
    		
    		if ($id==0)
    		{
    		    $request->validate([
    		        'discount' => 'nullable|numeric',
    		    ]);
	    		$data = $request->json()->all();
	    		$customer = Customer::create($data);
	    		$customerId= $customer->id;
	    		
	    		return response()->json("{status:1, customerId:$customerId}");
    		}else{
    			return response()->json("{status:0}");
    		}
    	}
    	if ($request->isMethod('put')) {
    		
    		if (is_null($id ))
    		{
    			return response()->json("{status:0}");
    		}else{
    			$data = $request->json()->all();
    			
    			$MysqlModel = Customer::find($id);
    			$MysqlModel->fill($data);
    			$MysqlModel->save();
    			return response()->json("{status:2}");
    		}
    	}
    }
    
    
    public function customerContactPerson(Request $request, $id = null)
    {
    	
    	if ($request->isMethod('get')) {
    		if (is_null($id ))
    		{
    			$data_response = CustomerContactPerson::all();
    			return response()->json($data_response);
    		}
    		else
    		{
    			$data_response= CustomerContactPerson::find($id);
    			
    			if(is_null($data_response)){
    				
    				//$data_response = Customer::all();
    				
    				$users = CustomerContactPerson::all();
    				$user = $users->first();
    				$data_response= array_keys($user->toArray());
    				//return response()->json();
    				//return response()->json($data_response);
    				
    				return response()->json([
    						'customer_id' => 0,
    						'title' => '',
    						'department' =>'',
    						'first_name' =>'',
    						'last_name' =>'',
    			
    						'phone' =>'',
    						'mobile' =>'',
    						'fax' =>'',
    						'email' =>'',
    						
    						'gender' =>0,
    						'birthday' =>'',
    						
    						'created_user_id' =>1,
    						'updated_user_id' =>1
    				]);
    				
    			} else {
    				
    				return response()->json($data_response);
    			}
    		}
    	}
    	
    	if ($request->isMethod('post')) {
    	    if ($id==0)
    	    {
    	        $this->validate($request, [
    	            'birthday' => 'nullable'
    	        ]);
    	        

    		
    			$data = $request->json()->all();
    			
    			CustomerContactPerson::create($data);
    			
    			return response()->json("{status:1}");
    	    }else{
    	        return response()->json("{status:0}");
    	    }
    		
    	}
    	if ($request->isMethod('put')) {
    		
    		if (is_null($id ))
    		{
    			return response()->json("{status:0}");
    		}else{
    			$data = $request->json()->all();
    			
    			$MysqlModel = CustomerContactPerson::find($id);
    			$MysqlModel->fill($data);
    			$MysqlModel->save();
    			return response()->json("{status:2}");
    		}
    	}
    }
    
    public function session(Request $request, $id = null)
    {
        
        if ($request->isMethod('get')) {
            return response()->json("{status:1}");
        }
        
    
    }

}
