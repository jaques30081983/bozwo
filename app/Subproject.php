<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Subproject extends Model
{
	protected $guarded = ['id'];
	public function SubprojectMaterial()
	{
		return $this->hasMany(SubprojectMaterial::class);
	}
	
	public function SubprojectMaterialCategories()
	{
	    return $this->hasMany(SubprojectMaterial::class)->where('subproject_materials.ref_id', '=', 0);
	}
	
	public function SubprojectResource()
	{
	    return $this->hasMany(SubprojectResource::class);
	}

	public function SubprojectResourceCategories()
	{
	    return $this->hasMany(SubprojectResource::class)->where('subproject_resources.ref_id', '=', 0);
	}
	
	
	public function SubprojectPerson()
	{
		return $this->hasMany(SubprojectPerson::class);
	}
	
	public function SubprojectVehicle()
	{
		return $this->hasMany(SubprojectVehicle::class);
	}

	public function Documents($model)
	{
		return $this->hasMany('App\\'.$model)->get();
	}
}
