<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateResourcePlansTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('resource_plans', function (Blueprint $table) {
            $table->increments('id');
            
            $table->integer('resource_id')->unsigned();
            $table->string('resource_type');
            
            $table->string('name');
            $table->text('description');
            
            
            $table->integer('type_id')->unsigned();
            $table->foreign('type_id')->references('id')->on('resource_types');
            
            $table->integer('transaction_id')->unsigned();
            $table->foreign('transaction_id')->references('id')->on('transactions');
            
            $table->integer('project_id')->unsigned();
            $table->foreign('project_id')->references('id')->on('projects');
            
            $table->integer('job_id')->unsigned();
            $table->foreign('job_id')->references('id')->on('jobs');
                        
            $table->dateTime('datetime_start');
            $table->dateTime('datetime_end');
            
            $table->integer('status')->unsigned();
            
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
        Schema::dropIfExists('resource_plans');
    }
}
