<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DocumentMaterialListItem extends Model
{
    protected $guarded = ['id'];
    public function DocumentMaterialList()
    {
        return $this->belongsTo(DocumentMaterialList::class);
    }
    
    
    public function subitems()
    {
        return $this->hasMany('App\DocumentMaterialListItem', 'ref_id');
    }
}
