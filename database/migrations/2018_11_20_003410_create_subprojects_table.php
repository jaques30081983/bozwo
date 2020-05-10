<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSubprojectsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('subprojects', function (Blueprint $table) {
            $table->increments('id');
            
            $table->integer('transaction_id')->unsigned();
            $table->foreign('transaction_id')->references('id')->on('transactions');
                        
            $table->integer('project_id')->unsigned();
            $table->foreign('project_id')->references('id')->on('projects');
            
            $table->string('number');
            $table->string('name');
            $table->string('description');
            $table->string('reference_number');
            
            $table->integer('company_site_id')->unsigned();
            $table->foreign('company_site_id')->references('id')->on('company_sites');
            
            $table->integer('return_company_site_id')->unsigned();
            $table->foreign('return_company_site_id')->references('id')->on('company_sites');
            
            $table->integer('manager_person_id')->unsigned();
            $table->foreign('manager_person_id')->references('id')->on('people');
            
            
            $table->integer('status')->unsigned();
            $table->integer('priority')->unsigned();
            $table->integer('type')->unsigned();
            
            
            $table->integer('delivery_type_id')->unsigned();
            $table->foreign('delivery_type_id')->references('id')->on('delivery_types');
            
            $table->integer('shipping_address_id')->unsigned();
            $table->foreign('shipping_address_id')->references('id')->on('shipping_addresses');
            $table->string('shipping_address_note');
            
            $table->date('offer_deadline_date');
            $table->decimal('total', 40, 2);
            
            $table->integer('discount_id')->unsigned();
            $table->foreign('discount_id')->references('id')->on('discounts');
            $table->decimal('discount', 40, 2);
            
            $table->boolean('lock_schedule');
            $table->boolean('available_later');
            $table->boolean('check_out');
            $table->boolean('check_in');
            $table->boolean('finalized');
            
            $table->boolean('invoiced');
            $table->boolean('no_invoice');
            
            $table->datetime('start_date_time');
            $table->datetime('end_date_time');
            
            $table->integer('days')->unsigned();
            $table->integer('days_used')->unsigned();
            $table->decimal('factor', 10, 1);
            
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
        Schema::dropIfExists('subprojects');
    }
}
