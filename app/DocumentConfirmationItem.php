<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DocumentConfirmationItem extends Model
{
    protected $guarded = ['id'];
    public function DocumentConfirmation()
    {
        return $this->belongsTo(DocumentConfirmation::class);
    }
    
    
    public function subitems()
    {
        return $this->hasMany('App\DocumentConfirmationItem', 'ref_id');
    }
}
