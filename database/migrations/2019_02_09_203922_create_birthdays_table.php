<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBirthdaysTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('birthdays', function (Blueprint $table) {
        	$table->increments('id');
        	
        	$table->string('name');
        	$table->string('description');
        	$table->string('location');
        	
        	$table->datetime('start_date_time');
        	$table->datetime('end_date_time');
        	$table->integer('status')->unsigned();
        	
        	$table->string('attendees');
        	$table->string('google_event_id');
        	$table->time('reminder_time');
        	
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
        Schema::dropIfExists('birthdays');
    }
}
