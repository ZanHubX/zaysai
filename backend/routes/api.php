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
use App\Http\Controllers\Api\SellerCustomerController;

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminSellerController;
use App\Http\Controllers\Api\AdminStoreController;
use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\AdminOrderController;
use App\Http\Controllers\Api\AdminSettingsController;


/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
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
| Customer Order Tracking
|--------------------------------------------------------------------------
*/

Route::get('/orders/{orderNumber}/track', [
    OrderController::class,
    'track'
]);


/*
|--------------------------------------------------------------------------
| Protected Seller Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Seller Authentication
    |--------------------------------------------------------------------------
    */

    Route::get('/me', [
        AuthController::class,
        'me'
    ]);

    Route::post('/logout', [
        AuthController::class,
        'logout'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Seller Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get('/seller/dashboard', [
        SellerDashboardController::class,
        'index'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Seller Customers
    |--------------------------------------------------------------------------
    */

    Route::get('/seller/customers', [
        SellerCustomerController::class,
        'index'
    ]);

    Route::get('/seller/customers/{phone}', [
        SellerCustomerController::class,
        'show'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Seller Store Settings
    |--------------------------------------------------------------------------
    */

    Route::get('/seller/store', [
        SellerStoreController::class,
        'show'
    ]);

    Route::put('/seller/store', [
        SellerStoreController::class,
        'update'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Seller Payment Methods
    |--------------------------------------------------------------------------
    */

    Route::get('/seller/payment-methods', [
        SellerPaymentMethodController::class,
        'index'
    ]);

    Route::post('/seller/payment-methods', [
        SellerPaymentMethodController::class,
        'store'
    ]);

    Route::get('/seller/payment-methods/{id}', [
        SellerPaymentMethodController::class,
        'show'
    ]);

    Route::put('/seller/payment-methods/{id}', [
        SellerPaymentMethodController::class,
        'update'
    ]);

    Route::delete('/seller/payment-methods/{id}', [
        SellerPaymentMethodController::class,
        'destroy'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Seller Orders
    |--------------------------------------------------------------------------
    */

    Route::get('/seller/orders', [
        SellerOrderController::class,
        'index'
    ]);

    Route::get('/seller/orders/{id}', [
        SellerOrderController::class,
        'show'
    ]);

    Route::get('/seller/orders/{id}/payment-proof', [
        SellerOrderController::class,
        'paymentProof'
    ]);

    Route::patch('/seller/orders/{id}/status', [
        SellerOrderController::class,
        'updateStatus'
    ]);

    Route::patch('/seller/orders/{id}/payment-status', [
        SellerOrderController::class,
        'updatePaymentStatus'
    ]);

    Route::patch('/seller/orders/{id}/fulfillment-status', [
        SellerOrderController::class,
        'updateFulfillmentStatus'
    ]);

    Route::post('/seller/orders/{id}/fulfillment', [
        SellerOrderController::class,
        'updateFulfillment'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Seller Products
    |--------------------------------------------------------------------------
    */

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


/*
|--------------------------------------------------------------------------
| Admin Authentication
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Admin Login
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->group(function () {

    Route::post('/login', [
        AdminAuthController::class,
        'login'
    ]);
});


/*
|--------------------------------------------------------------------------
| Protected Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('admin')
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Admin Profile
        |--------------------------------------------------------------------------
        */

        Route::get('/me', [
            AdminAuthController::class,
            'me'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Admin Logout
        |--------------------------------------------------------------------------
        */

        Route::post('/logout', [
            AdminAuthController::class,
            'logout'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Admin Dashboard
        |--------------------------------------------------------------------------
        */

        Route::get('/dashboard', [
            AdminDashboardController::class,
            'index'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Admin Sellers
        |--------------------------------------------------------------------------
        */

        Route::get('/sellers', [
            AdminSellerController::class,
            'index'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Admin Stores
        |--------------------------------------------------------------------------
        */

        Route::get('/stores', [
            AdminStoreController::class,
            'index'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Admin Products
        |--------------------------------------------------------------------------
        */

        Route::get('/products', [
            AdminProductController::class,
            'index'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Admin Orders
        |--------------------------------------------------------------------------
        */

        Route::get('/orders', [
            AdminOrderController::class,
            'index'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Admin Settings
        |--------------------------------------------------------------------------
        */

        Route::get('/settings', [
            AdminSettingsController::class,
            'index'
        ]);

        Route::put('/settings', [
            AdminSettingsController::class,
            'update'
        ]);
    });
