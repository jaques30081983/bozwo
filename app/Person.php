<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Person extends Model
{
    protected $fillable = ['group', 'role', 'masterdata_id', 'user_id', 'title','department','position','first_name','last_name','phone','mobile','fax','email','gender','birthday','created_user_id','updated_user_id','created_at','updated_at'];
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
		
		return $this->belongsToMany(ProjectResource::class,'resource_dispositions', 'id', 'project_resource_id');
    }
	
	public function SubprojectResource()
    {
        return $this->belongsToMany(SubprojectResource::class,'resource_dispositions', 'subproject_resource_id', 'id');
    }
	
}
