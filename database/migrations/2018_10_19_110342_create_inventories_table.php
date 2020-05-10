<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateInventoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('inventories', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('category_id')->unsigned();
            $table->foreign('category_id')->references('id')->on('inventory_categories');
            
            $table->string('name');
            $table->text('description');
            $table->integer('masterdata_id')->unsigned();
            $table->foreign('masterdata_id')->references('id')->on('masterdata');
            
            $table->text('notes');
            
            $table->integer('unit_id')->unsigned();
            $table->foreign('unit_id')->references('id')->on('units');
                 
            $table->decimal('weight', 40, 2);  
            $table->decimal('width', 40, 2);
            $table->decimal('height', 40, 2);
            $table->decimal('depth', 40, 2);
            $table->decimal('volume', 40, 6);
            
            $table->integer('apparent_power');
            $table->integer('real_power');
            
            $table->integer('power_connector_id')->unsigned();
            $table->foreign('power_connector_id')->references('id')->on('power_connectors');
            
            $table->integer('country_id')->unsigned();
            $table->foreign('country_id')->references('id')->on('countries');
            
            $table->integer('customs_tariff_number');
            
            $table->string('barcode');
            
            $table->decimal('purchase_price', 40, 2);
            $table->decimal('sales_price', 40, 2);
            $table->decimal('sub_hire_price', 40, 2);
            $table->decimal('calculated_costs', 40, 2);
            $table->decimal('rental_price', 40, 2);
            
            $table->integer('currency_id')->unsigned();
            $table->foreign('currency_id')->references('id')->on('currencys');
            
            $table->boolean('no_discount');
            
            $table->decimal('quantity', 40, 2);
            $table->integer('packaging_unit')->unsigned();
            
            $table->decimal('rental_stock', 40, 2);
            $table->decimal('sales_stock', 40, 2);
            
            $table->decimal('min_rental_stock', 40, 2);
            $table->decimal('min_sales_stock', 40, 2);
            

            $table->integer('tax_id')->unsigned();
            $table->foreign('tax_id')->references('id')->on('taxes');
            
            $table->boolean('disabled');
            $table->boolean('puplish');
            $table->integer('price_list_order')->unsigned();

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
        Schema::dropIfExists('inventories');
    }
}
