<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SubprojectResource extends Model
{
    protected $guarded = ['id'];
    public function Subproject()
    {
        return $this->belongsTo(Subproject::class);
        
    }
    
    public function subitems()
    {
        
        return $this->hasMany('App\SubprojectResource', 'ref_id')
        ->orderByRaw('LENGTH(subproject_resources.pos)', 'ASC')
        ->orderBy('subproject_resources.pos', 'ASC');
        
        
    }
}
