<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProjectsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->increments('id');
            
            $table->integer('transaction_id')->unsigned();
            $table->foreign('transaction_id')->references('id')->on('transactions');
            
            $table->string('number');
            $table->string('name');
            $table->string('description');
            $table->string('location');
            $table->string('reference_number');
            
            $table->integer('company_site_id')->unsigned();
            $table->foreign('company_site_id')->references('id')->on('company_sites');
            
            $table->integer('manager_person_id')->unsigned();
            $table->foreign('manager_person_id')->references('id')->on('people');
            
            
            $table->integer('status')->unsigned();
            $table->integer('priority')->unsigned();
            $table->integer('project_type_id')->unsigned();
            $table->foreign('project_type_id')->references('id')->on('project_types');
            
            $table->integer('event_id')->unsigned();
            $table->foreign('event_id')->references('id')->on('events');
            

            
            $table->integer('payment_term_id')->unsigned();
            $table->foreign('payment_term_id')->references('id')->on('payment_terms');
            
            $table->integer('customer_id')->unsigned();
            $table->foreign('customer_id')->references('id')->on('masterdata');
            
            $table->integer('customer_person_id')->unsigned();
            $table->foreign('customer_person_id')->references('id')->on('people');
            
            
            $table->datetime('start_date_time');
            $table->datetime('end_date_time');
            

            $table->date('order_date');
            $table->integer('type_of_orders_id')->unsigned();
            $table->string('attendees');
            $table->string('google_event_id');
            $table->time('reminder_time');
  
            
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
        Schema::dropIfExists('projects');
    }
}
