<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateInventoryHistoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('inventory_histories', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('ref_id')->unsigned();
            $table->foreign('ref_id')->references('id')->on('inventories');
            
            $table->integer('owner_id')->unsigned();
            $table->foreign('owner_id')->references('id')->on('masterdata');
            
            $table->integer('supplier_id')->unsigned();
            $table->foreign('supplier_id')->references('id')->on('masterdata');
            
            $table->integer('location_id')->unsigned();
            $table->foreign('location_id')->references('id')->on('location');
            
            $table->integer('quantity')->unsigned();
            $table->integer('type')->unsigned();
            $table->integer('inventory_type')->unsigned();
            $table->boolean('item_type');
            
            $table->text('description');

            $table->datetime('date_time');
            $table->datetime('warranty_end');
            $table->decimal('purchase_price', 40, 2);
            
            $table->string('job_number');
            $table->string('job_name');
            
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
        Schema::dropIfExists('inventory_histories');
    }
}
