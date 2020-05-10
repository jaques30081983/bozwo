<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SubprojectMaterial extends Model
{
	protected $guarded = ['id'];
	public function Subproject()
	{
		return $this->belongsTo(Subproject::class);
		
	} 
	
	public function subitems()
	{
	    
	    return $this->hasMany('App\SubprojectMaterial', 'ref_id')
	    ->orderByRaw('LENGTH(subproject_materials.pos)', 'ASC')
	    ->orderBy('subproject_materials.pos', 'ASC');
	    

	}
}
