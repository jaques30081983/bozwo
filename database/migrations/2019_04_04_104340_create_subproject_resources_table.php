<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSubprojectResourcesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('subproject_resources', function (Blueprint $table) {
            $table->increments('id');
            
            $table->integer('ref_id')->unsigned();
            $table->foreign('ref_id')->references('id')->on('subproject_resources');
            
            $table->integer('subproject_id')->unsigned();
            $table->foreign('subproject_id')->references('id')->on('subprojects');
            
            $table->integer('resource_type_id')->unsigned();
            $table->foreign('resource_type_id')->references('id')->on('resource_types');
            
            $table->integer('type')->unsigned();
            $table->string('pos');
            
            $table->string('name');
            $table->string('description');
            $table->integer('quantity')->unsigned();
            $table->decimal('price', 40, 2);
            
            $table->integer('unit_id')->unsigned();
            $table->foreign('unit_id')->references('id')->on('units');
            
            $table->integer('discount_id')->unsigned();
            $table->foreign('discount_id')->references('id')->on('discounts');
            $table->decimal('discount', 40, 2);
            
            $table->integer('tax_id')->unsigned();
            $table->foreign('tax_id')->references('id')->on('taxes');
            
            $table->datetime('start_date_time');
            $table->datetime('end_date_time');
            
            $table->integer('days')->unsigned();
            $table->integer('days_off')->unsigned();
            $table->decimal('factor', 10, 1);
            
            $table->integer('status')->unsigned();
            
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
        Schema::dropIfExists('subproject_resources');
    }
}
