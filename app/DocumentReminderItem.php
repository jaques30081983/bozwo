<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DocumentReminderItem extends Model
{
    protected $guarded = ['id'];
    public function DocumentReminder()
    {
        return $this->belongsTo(DocumentReminder::class);
    } 
    
    public function subitems()
    {
        return $this->hasMany('App\DocumentReminderItem', 'ref_id');
    }
}
}
