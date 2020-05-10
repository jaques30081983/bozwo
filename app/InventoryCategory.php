<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class InventoryCategory extends Model
{
    protected $guarded = ['id'];
    public function nodes()
    {
        //return $this->belongsTo(self::class, 'parent_id', 'id');
        return $this->hasMany(self::class, 'parent_id');
    }
    
    public function items()
    {
        return $this->hasMany('App\Inventory', 'category_id');
    }
    
    public function parent_category()
    {
        return $this->hasMany(self::class, 'id', 'parent_id');
    }
}
