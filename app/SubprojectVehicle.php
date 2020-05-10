<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SubprojectVehicle extends Model
{
	protected $guarded = ['id'];
	public function Subproject()
	{
		return $this->belongsTo(Subproject::class);
		
	} 
}
