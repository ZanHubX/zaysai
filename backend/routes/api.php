<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SellerOrderController;
use App\Http\Controllers\Api\SellerProductController;
use App\Http\Controllers\Api\StorefrontController;
use App\Http\Controllers\Api\SellerStoreController;
use App\Http\Controllers\Api\SellerPaymentMethodController;
use App\Http\Controllers\Api\SellerDashboardController;


/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
|
| Customer / public users can access these routes without login.
|
*/


/*
|--------------------------------------------------------------------------
| Seller Login
|--------------------------------------------------------------------------
*/

Route::post('/login', [
    AuthController::class,
    'login'
]);


/*
|--------------------------------------------------------------------------
| Public Store Information
|--------------------------------------------------------------------------
*/

Route::get('/stores/{slug}', [
    StorefrontController::class,
    'show'
]);


/*
|--------------------------------------------------------------------------
| Public Store Products
|--------------------------------------------------------------------------
*/

Route::get('/stores/{slug}/products', [
    StorefrontController::class,
    'products'
]);


/*
|--------------------------------------------------------------------------
| Public Product Detail
|--------------------------------------------------------------------------
*/

Route::get('/stores/{slug}/products/{productSlug}', [
    StorefrontController::class,
    'product'
]);


/*
|--------------------------------------------------------------------------
| Public Store Payment Methods
|--------------------------------------------------------------------------
|
| Customers can see active payment methods during checkout.
|
*/

Route::get('/stores/{slug}/payment-methods', [
    StorefrontController::class,
    'paymentMethods'
]);


/*
|--------------------------------------------------------------------------
| Customer Place Order
|--------------------------------------------------------------------------
*/

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
    | Seller Dashboard
    |--------------------------------------------------------------------------
    |
    | Dashboard statistics and recent orders.
    |
    */

    Route::get('/seller/dashboard', [
        SellerDashboardController::class,
        'index'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Seller Store Settings
    |--------------------------------------------------------------------------
    */

    // Get Store Settings
    Route::get('/seller/store', [
        SellerStoreController::class,
        'show'
    ]);

    // Update Store Settings
    Route::put('/seller/store', [
        SellerStoreController::class,
        'update'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Seller Payment Methods
    |--------------------------------------------------------------------------
    */

    // Get Payment Methods
    Route::get('/seller/payment-methods', [
        SellerPaymentMethodController::class,
        'index'
    ]);

    // Create Payment Method
    Route::post('/seller/payment-methods', [
        SellerPaymentMethodController::class,
        'store'
    ]);

    // Get Single Payment Method
    Route::get('/seller/payment-methods/{id}', [
        SellerPaymentMethodController::class,
        'show'
    ]);

    // Update Payment Method
    Route::put('/seller/payment-methods/{id}', [
        SellerPaymentMethodController::class,
        'update'
    ]);

    // Delete Payment Method
    Route::delete('/seller/payment-methods/{id}', [
        SellerPaymentMethodController::class,
        'destroy'
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

    // Get Payment Proof
    Route::get('/seller/orders/{id}/payment-proof', [
        SellerOrderController::class,
        'paymentProof'
    ]);

    // Update Order Status
    Route::patch('/seller/orders/{id}/status', [
        SellerOrderController::class,
        'updateStatus'
    ]);

    // Update Payment Status
    Route::patch('/seller/orders/{id}/payment-status', [
        SellerOrderController::class,
        'updatePaymentStatus'
    ]);

    // Update Fulfillment Status
    Route::patch('/seller/orders/{id}/fulfillment-status', [
        SellerOrderController::class,
        'updateFulfillmentStatus'
    ]);

    // Update Fulfillment Details
    Route::post('/seller/orders/{id}/fulfillment', [
        SellerOrderController::class,
        'updateFulfillment'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Seller Products
    |--------------------------------------------------------------------------
    */

    // Get Products
    Route::get('/seller/products', [
        SellerProductController::class,
        'index'
    ]);

    // Create Product
    Route::post('/seller/products', [
        SellerProductController::class,
        'store'
    ]);

    // Get Single Product
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

/*
|--------------------------------------------------------------------------
| Customer Order Tracking
|--------------------------------------------------------------------------
*/

Route::get('/orders/{orderNumber}/track', [
    OrderController::class,
    'track'
]);