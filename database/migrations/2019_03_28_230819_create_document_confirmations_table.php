<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDocumentConfirmationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('document_confirmations', function (Blueprint $table) {
            $table->increments('id');
            
            $table->integer('transaction_id')->unsigned();
            $table->foreign('transaction_id')->references('id')->on('transactions');
            
            $table->integer('project_id')->unsigned();
            $table->foreign('project_id')->references('id')->on('projects');
            
            $table->integer('subproject_id')->unsigned();
            $table->foreign('subproject_id')->references('id')->on('subprojects');
            
            $table->integer('masterdata_id')->unsigned();
            $table->foreign('masterdata_id')->references('id')->on('masterdata');
            
            $table->integer('person_id')->unsigned();
            $table->foreign('person_id')->references('id')->on('people');
            
            $table->string('masterdata_name');
            
            $table->string('number');
            
            $table->integer('type')->unsigned();

            $table->integer('payment_method_id')->unsigned();
            $table->foreign('payment_method_id')->references('id')->on('payment_methods');

            $table->integer('payment_term_id')->unsigned();
            $table->foreign('payment_term_id')->references('id')->on('payment_terms');

            $table->decimal('total', 40, 2);  
            
            $table->integer('discount_id')->unsigned();
            $table->foreign('discount_id')->references('id')->on('discounts');

            $table->integer('discount');
            
            
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
        Schema::dropIfExists('document_confirmations');
    }
}
