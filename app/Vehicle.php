<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $guarded = ['id'];
    public function Masterdata()
    {
        return $this->belongsTo(Masterdata::class);
    } 
    
    public function ResourceType()
    {
        return $this->morphToMany('App\ResourceType', 'resource')->withPivot('day_price','hour_price','km_price');
    }

    public function ProjectResource()
    {
        return $this->belongsToMany(ProjectResource::class);
    }
	
	public function SubprojectResource()
    {
        return $this->belongsToMany(SubrojectResource::class);
    }
}
