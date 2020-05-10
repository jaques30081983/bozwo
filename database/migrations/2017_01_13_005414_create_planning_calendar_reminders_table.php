<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePlanningCalendarRemindersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('planning_calendar_reminders', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('planning_calendar_id')->unsigned();
            $table->foreign('planning_calendar_id')->references('id')->on('planning_calendars');
            
            $table->integer('user_id')->unsigned();
            $table->foreign('user_id')->references('id')->on('users');
            
            $table->integer('staff_id')->unsigned();
            $table->foreign('staff_id')->references('id')->on('staffs');
            
            $table->integer('minutes');
            
            $table->integer('email');
            $table->integer('popup');
            $table->integer('sms');
            
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
        Schema::dropIfExists('planning_calendar_reminders');
    }
}
