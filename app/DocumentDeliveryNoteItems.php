<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DocumentDeliveryNoteItems extends Model
{
    protected $guarded = ['id'];
    public function DocumentDeliveryNote()
    {
        return $this->belongsTo(DocumentDeliveryNote::class);
    } 
    
    public function subitems()
    {
        return $this->hasMany('App\DocumentDeliveryNoteItem', 'ref_id');
    }
}
