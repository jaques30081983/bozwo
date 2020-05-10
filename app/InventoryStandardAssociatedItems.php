<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class InventoryStandardAssociatedItems extends Model
{
    protected $guarded = ['id'];
    public function Inventory()
    {
        return $this->belongsTo(Inventory::class);
        //return $this->morphToMany(Inventory::class)->withPivot('quantity');
    } 
}
