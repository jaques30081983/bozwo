<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateResourceDispositionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('resource_dispositions', function (Blueprint $table) {
            $table->increments('id');

            $table->integer('ref_id')->unsigned();
            $table->foreign('ref_id')->references('id')->on('resource_dispositions');
            
            $table->integer('project_id')->unsigned();
            $table->foreign('project_id')->references('id')->on('projects');

            $table->integer('subproject_id')->unsigned();
            $table->foreign('subproject_id')->references('id')->on('subprojects');
            
            $table->integer('resource_type_id')->unsigned();
            $table->foreign('resource_type_id')->references('id')->on('resource_types');

            $table->integer('project_resource_id')->unsigned();
            $table->foreign('project_resource_id')->references('id')->on('project_resources');

            $table->integer('subproject_resource_id')->unsigned();
            $table->foreign('subproject_resource_id')->references('id')->on('subproject_resources');

            $table->string('resource_role');
            
            $table->integer('person_id')->unsigned();
            $table->foreign('person_id')->references('id')->on('people');

            $table->integer('vehicle_id')->unsigned();
            $table->foreign('vehicle_id')->references('id')->on('vehicles');

            $table->datetime('start_date_time');
            $table->datetime('end_date_time');

            $table->integer('quantity')->unsigned();
            $table->decimal('budget', 40, 2);
            $table->decimal('costs', 40, 2);

            $table->integer('status')->unsigned();

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
        Schema::dropIfExists('resource_dispositions');
    }
}
