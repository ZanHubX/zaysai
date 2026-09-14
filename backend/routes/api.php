<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SellerOrderController;
use App\Http\Controllers\Api\SellerProductController;


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


    // Seller Orders

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


    // Seller Products

    Route::get('/seller/products', [
        SellerProductController::class,
        'index'
    ]);

    Route::post('/seller/products', [
        SellerProductController::class,
        'store'
    ]);

    Route::get('/seller/products/{id}', [
        SellerProductController::class,
        'show'
    ]);

    Route::put('/seller/products/{id}', [
        SellerProductController::class,
        'update'
    ]);

    Route::delete('/seller/products/{id}', [
        SellerProductController::class,
        'destroy'
    ]);
});
