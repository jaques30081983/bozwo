<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePlanningCalendarsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('planning_calendars', function (Blueprint $table) {
            $table->increments('id');
            $table->string('title');
            $table->text('info');
            
            $table->string('location');
            
            $table->dateTime('datetime_start');
            $table->dateTime('datetime_end');
            
            
            $table->integer('type')->unsigned();
            $table->string('pic');
            
            $table->integer('status')->unsigned();
            
            $table->string('users');
            $table->string('staffs');
            
            $table->integer('project_id')->unsigned();
            $table->foreign('project_id')->references('id')->on('projects');
            
            
            $table->integer('transaction_id')->unsigned();
            $table->foreign('transaction_id')->references('id')->on('transactions');
            
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
        Schema::dropIfExists('planning_calendars');
    }
}
