<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
	protected $guarded = ['id'];
	public function subprojects()
	{
		return $this->hasMany('App\Subproject', 'project_id');
	}
	
	public function ProjectResource()
	{
	    return $this->hasMany(ProjectResource::class);
	}

	public function ProjectResourceDisposition()
	{
		//return $this->hasMany(ResourceDisposition::class);
		//return $this->belongsToMany(ResourceDisposition::class,'resource_dispositions', 'id', 'project_resource_id');
		
		//return $this->belongsToMany(ProjectResource::class,'resource_dispositions', 'id', 'project_id');
		/*
		return $this->hasManyThrough(
            ProjectResource::class,
            Person::class,
            'country_id', // Foreign key on users table...
            'user_id', // Foreign key on posts table...
            'id', // Local key on countries table...
            'id' // Local key on users table...
		);
		*/
		//return $this->hasMany(ProjectResource::class)->with

		/*
		return $this->hasManyThrough(
			'App\ResourceDisposition',
            'App\ProjectResource',
            
            'project_id', // Foreign key on users table...
            'project_resource_id', // Foreign key on history table...
            'id', // Local key on suppliers table...
            'id' // Local key on users table...
        );
			*/
		
		//return $this->hasMany(ProjectResource::class)->Dispositions();
		//return $this->morphOne(ProjectResource::class, 'Dispositions', 'project_id', 'project_resource_id', 'id', 'id');
		//return $this->morphMany('App\ProjectResource', 'dispositions');
		//return $this->hasMany(ProjectResource::class)->;
		//$roles = App\User::find(1)->roles()->orderBy('name')->get();
		//return $this->morphTo('App\ProjectResource')->withPivot('person_id', 'vehicle_id');
		return $this->belongsToMany('App\ProjectResource','resource_dispositions')->withPivot('person_id', 'vehicle_id', 'status');
	}

	public function document_invoices()
	{
		return $this->hasMany('App\DocumentInvoice', 'project_id');
	}

	public function ProjectResourceCategories()
	{
	    return $this->hasMany(ProjectResource::class)->where('project_resources.ref_id', '=', 0);
	}
	
	
	public function Documents($model)
	{
		return $this->hasMany('App\\'.$model)->get();
	}


}
