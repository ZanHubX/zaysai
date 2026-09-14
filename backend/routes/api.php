<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SellerOrderController;


// Public routes
Route::post('/login', [AuthController::class, 'login']);

Route::post('/stores/{slug}/orders', [
    OrderController::class,
    'store'
]);


// Protected seller routes
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [
        AuthController::class,
        'me'
    ]);

    Route::post('/logout', [
        AuthController::class,
        'logout'
    ]);

    Route::get('/seller/orders', [
        SellerOrderController::class,
        'index'
    ]);

    Route::get('/seller/orders/{id}', [
        SellerOrderController::class,
        'show'
    ]);

    Route::patch('/seller/orders/{id}/status', [
        SellerOrderController::class,
        'updateStatus'
    ]);
});
