<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use \AlgoWeb\PODataLaravel\Models\MetadataTrait;
class Masterdata extends Model
{
    protected $table = 'masterdata';
    public $timestamps = true;
    protected $fillable = ['group', 'number', 'number_old', 'number_ext', 'company_name_1', 'company_name_2','first_name','last_name',
    		'street','house_number','zip','city','country_id','phone','mobile','fax','email','url',
    		'tax_number','vat_id','discount_id','payment_method_id','payment_term_id',
    		'shop_user_name','shop_password','note','created_user_id','updated_user_id','created_at','updated_at'];
    protected $guarded = ['id'];
    
    
    public function Person()
    {
        return $this->hasMany('App\Person');

    }
    
    public function ShippingAddress()
    {
        return $this->hasMany('App\ShippingAddress');
    }
    
    public function BankAccount()
    {
        return $this->hasMany('App\BankAccount');
    }
    
    public function Vehicle()
    {
        return $this->hasMany('App\Vehicle');
    }
    
    public function MasterdataGroup()
    {
        return $this->belongsToMany('App\MasterdataGroup');
    }
    
}