<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateInventoryDevicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('inventory_devices', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('inventory_id')->unsigned();
            $table->foreign('inventory_id')->references('id')->on('inventories');
            
            $table->integer('owner_id')->unsigned();
            $table->foreign('owner_id')->references('id')->on('masterdata');
            
            $table->integer('supplier_id')->unsigned();
            $table->foreign('supplier_id')->references('id')->on('masterdata');
            
            
            $table->integer('inventory_history_entry_id')->unsigned();
            $table->foreign('inventory_history_entry_id')->references('id')->on('inventory_histories');
            
            $table->integer('inventory_history_deletion_id')->unsigned();
            $table->foreign('inventory_history_deletion_id')->references('id')->on('inventory_histories');
            
            $table->integer('inventory_location_id')->unsigned();
            $table->foreign('inventory_location_id')->references('id')->on('inventory_location');
            
            $table->integer('workshop_activity_id')->unsigned();
            $table->foreign('workshop_activity_id')->references('id')->on('workshop_activities');
            
            $table->integer('serial_number')->unsigned();
            $table->integer('inventory_number')->unsigned();
            $table->integer('sequence_number')->unsigned();
            
            $table->decimal('purchase_price', 40, 2);
            $table->string('device_field_1');
            $table->string('device_field_2');
            
            $table->integer('operating_hours')->unsigned();
            $table->integer('operating_days')->unsigned();
            
            $table->string('barcode');
            
            $table->datetime('warranty_end');
            $table->datetime('inventory_entry');
            $table->datetime('inventory_deletion');
            
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
        Schema::dropIfExists('inventory_devices');
    }
}
