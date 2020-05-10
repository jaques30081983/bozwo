<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateResourcesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->increments('id');
            
            $table->integer('type')->unsigned();
            $table->foreign('type')->references('id')->on('resource_types');
            
            $table->string('name');
            $table->string('description');

            $table->integer('person_id')->unsigned();
            $table->foreign('person_id')->references('id')->on('people');
            
            $table->integer('vehicle_id')->unsigned();
            $table->foreign('vehicle_id')->references('id')->on('vehicles');
            
            $table->integer('tariff_id')->unsigned();
            $table->foreign('tariff_id')->references('id')->on('tariffs');
            
            $table->decimal('day_price', 40, 2);
            $table->decimal('hour_price', 40, 2);
            $table->decimal('km_price', 40, 2);
            
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
        Schema::dropIfExists('resources');
    }
}
