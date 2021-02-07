<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DocumentReminder extends Model
{
    protected $guarded = ['id'];
    public function items()
    {
        $orderAlphanumeric = "INET_ATON(SUBSTRING_INDEX(CONCAT(pos,'.0.0.0'),'.',4))";
        return $this->hasMany('App\DocumentReminderItem')->orderByRaw($orderAlphanumeric);
    }

    public function masterdata()
    {
        return $this->belongsTo('App\Masterdata'::class);
    }
    
    public static function documentPreview($model,$id,$relation,$rid)
    {
        $data_response = 'App\\Document'::createPdf($model,$id,$relation,$rid,'reminder','preview');
        return $data_response;
    }
    public static function documentPreviewStream($model,$id,$relation,$rid)
    {
        $data_response = 'App\\Document'::createPdf($model,$id,$relation,$rid,'reminder','preview_stream');
        return $data_response;
    }

    public static function documentCreate($model,$id,$relation,$rid)
    {
        $data_response = 'App\\Document'::createPdf($model,$id,$relation,$rid,'reminder','create');
        return $data_response;
    }
}
