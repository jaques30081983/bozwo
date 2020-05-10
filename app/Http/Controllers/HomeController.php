<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Customer as Customer;
use App\CustomerShippingAdress as CustomerShippingAdress;
use App\CustomerContactPerson as CustomerContactPerson;
use Carbon\Carbon;


class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('home');
    }
    
    /**
     * Customers.
     *
     * 
     */
    public function customers_all()
    {
    	    $customer = Customer::all();
			
    		return response()->json($customer);
    }
    public function customers()
    {
    	// get the current time
    	$current = Carbon::now();
    	
    	// sub days to the current time
    	$current_sub_days = $current->subDays(15);
    	
    	$customer = Customer::where('updated_at', '>', "$current_sub_days")
    	->get();
    		
    	return response()->json($customer);
    }
    public function customer(Request $request, $customer_id)
    {
    	$customer = Customer::find($customer_id);
    		
    	return response()->json($customer);
    }
    
   
    
    public function customer_search(Request $request, $search_string)
    {
    	$customer = Customer::where('first_name', 'LIKE', "%$search_string%")
    	->orWhere('last_name', 'LIKE', "%$search_string%")
    	->orWhere('company_name_1', 'LIKE', "%$search_string%")
    	->orWhere('company_name_2', 'LIKE', "%$search_string%")
    	->orWhere('zip', 'LIKE', "%$search_string%")
    	->get();
    
    	return response()->json($customer);
    }
    
    public function customer_shipping_adresses(Request $request, $customer_id)
    {
    	$customer_shipping_adresses = CustomerShippingAdress::where('customer_id', '=', "$customer_id")->get();
    
    	return response()->json($customer_shipping_adresses);
    }
    
    public function customer_contact_people(Request $request, $customer_id)
    {
    	$customer_contact_people = CustomerContactPerson::where('customer_id', '=', "$customer_id")->get();
    
    	return response()->json($customer_contact_people);
    }
}
