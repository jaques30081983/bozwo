<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMasterdataTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('masterdata', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('group');
            
            $table->string('number');
            $table->string('number_old');
            $table->string('number_ext');
            
			$table->string('company_name_1');
			$table->string('company_name_2');
			
			$table->string('first_name');
			$table->string('last_name');
			
			$table->string('street');
			$table->string('house_number');
			$table->string('zip');
			$table->string('city');
			$table->integer('country_id');
			$table->foreign('country_id')->references('id')->on('countries');
			
			$table->string('phone');
			$table->string('mobile');
			$table->string('fax');
			$table->string('email');
			$table->string('url');
			
			$table->string('tax_number');
			$table->string('vat_id');
			$table->integer('discount_id');
			$table->foreign('discount_id')->references('id')->on('discounts');
			
			$table->integer('payment_method_id');
			$table->foreign('payment_method_id')->references('id')->on('payment_methods');
			$table->integer('payment_term_id');
			$table->foreign('payment_term_id')->references('id')->on('payment_terms');
			
			$table->string('shop_user_name');
			$table->string('shop_password');
			
			$table->text('note');
			
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
        Schema::dropIfExists('masterdata');
    }
}
