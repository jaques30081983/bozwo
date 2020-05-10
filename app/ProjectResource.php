<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ProjectResource extends Model
{
    protected $guarded = ['id'];
    public function subitems()
    {
        return $this->hasMany('App\ProjectResource', 'ref_id')
        ->orderByRaw('LENGTH(project_resources.pos)', 'ASC')
        ->orderBy('project_resources.pos', 'ASC');

    }

    public function dispositions()
    {
        return $this->belongsToMany('App\ProjectResource','resource_dispositions', 'project_resource_id', 'id')->
        withPivot('person_id', 'vehicle_id');

        //return $this->hasMany(ResourceDisposition::class);
    }

}
