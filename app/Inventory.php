<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $guarded = ['id'];
    
    public function items()
    {
        return $this->belongsTo(InventoryCategory::class);
    } 
    
    public function StandardAssociatedItems()
    {
        //return $this->belongsToMany(Inventory::class, 'inventory_standard_associated_items','ref_id', 'id');
        //return $this->belongsToMany('App\Role', 'role_user', 'user_id', 'role_id');
        return $this->belongsToMany(Inventory::class, 'inventory_standard_associated_items','ref_id','inventory_id')->select("inventory_standard_associated_items.id","name")->withPivot('quantity');
        //return $this->morphToMany(Inventory::class, 'inventory_standard_associated_items')->withPivot('quantity');
    }
    
    public function LinkedAssociatedItems()
    {
        return $this->belongsToMany(Inventory::class, 'inventory_linked_associated_items','ref_id','inventory_id')->select("inventory_linked_associated_items.id","name")->withPivot('quantity');
        
    }
    
    public function AlternativesItems()
    {
        return $this->belongsToMany(Inventory::class, 'inventory_alternatives_items','ref_id','inventory_id')->select("inventory_alternatives_items.id","name");
        
    }
    
    public function Devices()
    {
        return $this->hasMany(InventoryDevices::class);
    }
    
    public function History()
    {
        return $this->hasMany(InventoryHistory::class);
    }
    
    public function Supplier()
    {
        return $this->belongsToMany(InventorySupplier::class);
    }
}
