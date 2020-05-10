<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class MasterdataGroup extends Model
{
    protected $guarded = ['id'];
    
    public function Masterdata()
    {
        return $this->hasMany('App\Masterdata', 'group');
    }
}
