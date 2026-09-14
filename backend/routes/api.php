<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SellerOrderController;
use App\Http\Controllers\Api\SellerProductController;
use App\Http\Controllers\Api\StorefrontController;


/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
|
| Customer / public users can access these routes without login.
|
*/


// Seller Login
Route::post('/login', [
    AuthController::class,
    'login'
]);


// Public Store Information
Route::get('/stores/{slug}', [
    StorefrontController::class,
    'show'
]);


// Public Store Products
Route::get('/stores/{slug}/products', [
    StorefrontController::class,
    'products'
]);


// Public Product Detail
Route::get('/stores/{slug}/products/{productSlug}', [
    StorefrontController::class,
    'product'
]);


// Customer Place Order
Route::post('/stores/{slug}/orders', [
    OrderController::class,
    'store'
]);


/*
|--------------------------------------------------------------------------
| Protected Seller Routes
|--------------------------------------------------------------------------
|
| Seller must login and send Sanctum Bearer Token.
|
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Seller Authentication
    |--------------------------------------------------------------------------
    */

    // Logged-in Seller Information
    Route::get('/me', [
        AuthController::class,
        'me'
    ]);

    // Seller Logout
    Route::post('/logout', [
        AuthController::class,
        'logout'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Seller Orders
    |--------------------------------------------------------------------------
    */

    // Get Seller Orders
    Route::get('/seller/orders', [
        SellerOrderController::class,
        'index'
    ]);

    // Get Single Order
    Route::get('/seller/orders/{id}', [
        SellerOrderController::class,
        'show'
    ]);

    // Update Order Status
    Route::patch('/seller/orders/{id}/status', [
        SellerOrderController::class,
        'updateStatus'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Seller Products
    |--------------------------------------------------------------------------
    */

    // Product List
    Route::get('/seller/products', [
        SellerProductController::class,
        'index'
    ]);

    // Create Product
    Route::post('/seller/products', [
        SellerProductController::class,
        'store'
    ]);

    // Product Detail
    Route::get('/seller/products/{id}', [
        SellerProductController::class,
        'show'
    ]);

    // Update Product
    Route::put('/seller/products/{id}', [
        SellerProductController::class,
        'update'
    ]);

    // Delete Product
    Route::delete('/seller/products/{id}', [
        SellerProductController::class,
        'destroy'
    ]);
});
