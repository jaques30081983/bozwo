<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
class NumberObject extends Model
{
    protected $guarded = ['id'];
    
    public static function getNumber($id,$string = null,$relation = null)
    {
        parse_str($string, $action_array);
        
        //Get the current time
        $current = Carbon::now();
        
        //Check for test mode
        if(!isset($action_array['test'])){
            //Get model
            $Q1 = self::find($id);
            
            //Reset sequential number on the end of the year
            if($Q1->current_year == $current->year){
                //pass
            }else{
                if($Q1->reset == 1){
                    $Q1->current_year = $current->year;
                    $Q1->sequential_number = 0;
                }
            }
            //Increase sequential number
            $Q1->sequential_number = $Q1->sequential_number+1;
            
            $Q1->save();
            
            $pattern = $Q1->pattern;
            $sequential_number= $Q1->sequential_number;
            $length = $Q1->length;
        }else{
            $pattern = $action_array['pattern'];
            if($action_array['sequential_number'] == 0){
                $action_array['sequential_number'] = $action_array['sequential_number']+1;
            }
            $sequential_number= $action_array['sequential_number'];
            $length = $action_array['length'];
            $relation = 'test';
        }
        
        //Sequential number add zeros
        $sequential_number = str_pad($sequential_number, $length ,'0', STR_PAD_LEFT);
        
        
        //Pattern '/\[+(parent)+\]/'
        preg_match_all("/\{([^\}]+)\}/", $pattern, $matches);
        
        foreach ($matches[0] as $key => $match) {
            
            if($matches[1][$key] == "number"){
                //Add sequential number
                $pattern =  preg_replace("/$match/",  $sequential_number, $pattern);
            }elseif($matches[1][$key] == "parent"){
                //Add Vars
                $pattern =  preg_replace("/$match/",  "$relation", $pattern);
                
            }else{
                $pattern =  preg_replace("/$match/",  $current->format($matches[1][$key]), $pattern);
            }
        }
        
        
        
  
        //Return
        return $pattern;
    }
}
