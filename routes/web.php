<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of the routes that are handled
| by your application. Just tell Laravel the URIs it should respond
| to using a Closure or controller method. Build something great!
|
*/


//Auth::routes();
Route::get('/login', 'Auth\LoginController@showLoginForm');
Route::post('/login', 'Auth\LoginController@login');
Route::any('/logout', 'Auth\LoginController@logout');

//Route::get('/register', 'Auth\RegisterController@showRegistrationForm')->middleware('auth');

//Route::post('/register', 'Auth\RegisterController@register')->middleware('auth');


Route::get('/', 'HomeController@index');
Route::get('/home', 'HomeController@index');


//Route to documents
Route::get('/document/{path_to_file}', function ($path_to_file) {
    if(Auth::check()) {
        $path_to_file = base_path()."/spool/$path_to_file";
        return response()->file($path_to_file);
    }
});

//Route to attachments of mails
Route::get('/attachments/{path_to_file}', function ($path_to_file) {
    if(Auth::check()) {
        $sessionId = session()->getId();
        $path_to_file = base_path()."/storage/app/attachments/$sessionId/$path_to_file";
        return response()->file($path_to_file);
    }
});
