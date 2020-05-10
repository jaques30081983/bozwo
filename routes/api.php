<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:api');

Route::post('/{model?}/{id?}/{relation?}/{rid?}/{action?}', 'ApiController@postApi');
Route::get('/{model?}/{id?}/{relation?}/{rid?}/{action?}/{string?}/{filter?}', 'ApiController@getApi');
Route::put('/{model?}/{id?}/{relation?}/{rid?}/{action?}', 'ApiController@putApi');
Route::delete('/{model?}/{id?}/{relation?}/{rid?}', 'ApiController@deleteApi');