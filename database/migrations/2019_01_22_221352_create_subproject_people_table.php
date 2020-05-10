<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSubprojectPeopleTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('subproject_people', function (Blueprint $table) {
        	$table->increments('id');
        	$table->integer('subproject_id')->unsigned();
        	$table->foreign('subproject_id')->references('id')->on('subprojects');
        	
        	$table->integer('resource_type_id')->unsigned();
        	$table->foreign('resource_type_id')->references('id')->on('resource_types');
        	        	
        	$table->integer('quantity')->unsigned();
        	
        	$table->datetime('start_date_time');
        	$table->datetime('end_date_time');
        	
        	$table->integer('created_user_id')->unsigned();
        	$table->foreign('created_user_id')->references('id')->on('users');
        	$table->integer('updated_user_id')->unsigned();
        	$table->foreign('updated_user_id')->references('id')->on('users');
        	
        	$table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('subproject_people');
    }
}
