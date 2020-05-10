<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PeopleGroup extends Model
{
    protected $guarded = ['id'];
    
    public function Masterdata()
    {
        return $this->hasMany('App\Person', 'group');
    }
}
