<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRemarksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('remarks', function (Blueprint $table) {
            $table->increments('id');
            $table->string('ref_table');
			$table->integer('ref_id')->unsigned();

			
			$table->string('title');
			$table->text('text');
			
			$table->date('resubmission');
			$table->integer('resubmission_user_id')->unsigned();
			$table->foreign('resubmission_user_id')->references('id')->on('users');
			
			$table->integer('status')->unsigned();
			
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
        Schema::dropIfExists('remarks');
    }
}
