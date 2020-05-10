<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDocumentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->increments('id');
            
            $table->string('name');
            $table->string('description');
            
            $table->string('model');
            $table->string('relation');
            
            $table->string('role');
            
            //PDF
            $table->string('author');
            $table->string('title');
            $table->string('subject');
            $table->string('keywords');
            
            $table->string('format');
            $table->string('orientation');
            $table->string('rotate');
            $table->string('margin_left');
            $table->string('margin_top');
            $table->string('margin_right');
            $table->string('margin_bottom');
            
            $table->string('margin_header');
            $table->string('margin_footer');
            
            //Relations
            $table->integer('number_id')->unsigned();
            $table->foreign('number_id')->references('id')->on('number_objects');
            
            $table->integer('template_header_id')->unsigned();
            $table->foreign('template_header_id')->references('id')->on('templates');
            
            $table->integer('template_content_id')->unsigned();
            $table->foreign('template_content_id')->references('id')->on('templates');
            
            $table->integer('template_footer_id')->unsigned();
            $table->foreign('template_footer_id')->references('id')->on('templates');
            
            
            //User / Timestamps
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
        Schema::dropIfExists('documents');
    }
}
