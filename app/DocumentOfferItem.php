<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DocumentOfferItem extends Model
{
    protected $guarded = ['id'];
    public function DocumentOffer()
    {
        return $this->belongsTo(DocumentOffer::class);
    } 
    
    
    public function subitems()
    {
        return $this->hasMany('App\DocumentOfferItem', 'ref_id');
    }
    
}
