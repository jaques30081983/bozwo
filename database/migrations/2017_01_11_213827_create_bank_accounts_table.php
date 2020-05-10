<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBankAccountsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->increments('id');
			$table->integer('masterdata_id')->unsigned();
			$table->foreign('masterdata_id')->references('id')->on('masterdata');
			$table->string('bank_name');
			$table->string('sort_number');
			$table->string('acc_number');
			$table->string('bic');
			$table->string('iban');
			
			$table->text('note');
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
        Schema::dropIfExists('bank_accounts');
    }
}
