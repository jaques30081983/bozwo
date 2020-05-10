<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DocumentRentalItem extends Model
{
	protected $guarded = ['id'];
	public function DocumentRental()
	{
		return $this->belongsTo(DocumentRental::class);
	}
	
	
	public function subitems()
	{
		return $this->hasMany('App\DocumentRentalItem', 'ref_id');
	}
}
