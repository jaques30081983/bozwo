<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DocumentReversalInvoiceItem extends Model
{
    protected $guarded = ['id'];
    public function DocumentReversalInvoice()
    {
        return $this->belongsTo(DocumentReversalInvoice::class);
    } 
    
    public function subitems()
    {
        return $this->hasMany('App\DocumentReversalInvoiceItem', 'ref_id');
    }
}
