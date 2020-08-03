<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('people_id')->unsigned();
            $table->foreign('people_id')->references('id')->on('people');
            
            $table->string('name');
            $table->string('email')->unique();
            $table->string('email_google')->unique();
            $table->string('password');

			
			$table->string('first_name');
			$table->string('last_name');
			$table->string('language');
			$table->string('phone');
			$table->string('fax');
			$table->string('mobile');
			
			$table->string('email_name');
			$table->string('email_password');
			$table->string('email_pop');
			$table->string('email_imap');
			$table->string('email_smtp');
			$table->string('email_signature');
			
			$table->string('disabled');
			
			$table->rememberToken();
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
        Schema::drop('users');
    }
}
