<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePeopleTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('people', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('group')->unsigned();
            $table->foreign('group')->references('id')->on('people_groups');
            
			$table->integer('masterdata_id')->unsigned();
			$table->foreign('masterdata_id')->references('id')->on('masterdata');
			
			$table->integer('user_id')->unsigned();
			$table->foreign('user_id')->references('id')->on('user');
			
			$table->string('title');
			$table->string('department');
			
			$table->string('first_name');
			$table->string('last_name');
			
			$table->string('phone');
			$table->string('mobile');
			$table->string('fax');
            $table->string('email');
            $table->string('email_from');
            $table->string('email_signature');
			
			$table->string('gender');
			$table->date('birthday');
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
        Schema::dropIfExists('people');
    }
}
