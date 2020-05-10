<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ResourceDisposition extends Model
{
    protected $guarded = ['id'];

    public function Project()
    {
        return $this->belongsToMany(Project::class,'resource_dispositions', 'id', 'project_id');
    }

}
