<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateVehiclesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->increments('id');
            $table->boolean('default');
            
            $table->integer('masterdata_id')->unsigned();
            $table->foreign('masterdata_id')->references('id')->on('masterdata');
            
            $table->boolean('rental_vehicle');
                 
            $table->string('name');
            $table->string('description');
            $table->string('manufacturer');
            $table->string('model');
            $table->string('numberplate');
            $table->date('construction_year');
            $table->decimal('payload', 5, 2);  
            $table->decimal('loading_volume', 5, 2);
            $table->integer('average_speed')->unsigned();
            $table->integer('seats')->unsigned();
            
            $table->text('comment');
            
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
        Schema::dropIfExists('vehicles');
    }
}
