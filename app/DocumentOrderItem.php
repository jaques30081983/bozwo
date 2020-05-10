<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DocumentOrderItem extends Model
{
    protected $guarded = ['id'];
    public function DocumentOrder()
    {
        return $this->belongsTo(DocumentOrder::class);
    } 
    
    public function subitems()
    {
        return $this->hasMany('App\DocumentOrderItem', 'ref_id');
    }
}
