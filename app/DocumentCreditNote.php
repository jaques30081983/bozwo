<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DocumentCreditNote extends Model
{
    public function masterdata()
    {
        return $this->belongsTo('App\Masterdata'::class);
    }
}
