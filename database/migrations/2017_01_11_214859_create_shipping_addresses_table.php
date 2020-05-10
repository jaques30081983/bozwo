<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateShippingAddressesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('shipping_addresses', function (Blueprint $table) {
            $table->increments('id');
			$table->integer('masterdata_id')->unsigned();
			$table->foreign('masterdata_id')->references('id')->on('masterdata');
			
			$table->string('name');
			$table->string('department');
			$table->string('contact');
			
			$table->string('street');
			$table->string('house_number');
			$table->string('zip');
			$table->string('city');
			$table->integer('country_id');

			$table->string('phone');
			
			$table->string('note');
			$table->boolean('default');
			
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
        Schema::dropIfExists('shipping_addresses');
    }
}
