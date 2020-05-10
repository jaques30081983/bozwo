<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DocumentHireItem extends Model
{
    protected $guarded = ['id'];
    public function DocumentHire()
    {
        return $this->belongsTo(DocumentHire::class);
    } 
    
    public function subitems()
    {
        return $this->hasMany('App\DocumentHireItem', 'ref_id');
    }
}
