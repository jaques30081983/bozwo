<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DocumentInvoiceItem extends Model
{
    protected $guarded = ['id'];
    public function DocumentInvoice()
    {
        return $this->belongsTo(DocumentInvoice::class);
    } 
    
    public function subitems()
    {
        return $this->hasMany('App\DocumentInvoiceItem', 'ref_id');
    }
}
