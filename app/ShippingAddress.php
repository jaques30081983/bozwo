<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ShippingAddress extends Model
{
    protected $guarded = ['id'];
    
    public function Masterdata()
    {
        return $this->belongsTo(Masterdata::class);
    } 
}
