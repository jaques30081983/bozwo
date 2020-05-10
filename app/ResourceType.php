<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ResourceType extends Model
{
    public function Person()
    {
        return $this->morphedByMany('App\Person', 'resource');
    }
    
    public function Vehicle()
    {
        return $this->morphedByMany('App\Vehicle', 'resource');
    }
}
