<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Controllers
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Public / Common Controllers
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\StorefrontController;
use App\Http\Controllers\Api\MaintenanceStatusController;

/*
|--------------------------------------------------------------------------
| Seller Controllers
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Api\SellerOrderController;
use App\Http\Controllers\Api\SellerProductController;
use App\Http\Controllers\Api\SellerStoreController;
use App\Http\Controllers\Api\SellerPaymentMethodController;
use App\Http\Controllers\Api\SellerDashboardController;
use App\Http\Controllers\Api\SellerCustomerController;
use App\Http\Controllers\Api\SellerSubscriptionPaymentController;

/*
|--------------------------------------------------------------------------
| Admin Controllers
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminSellerController;
use App\Http\Controllers\Api\AdminStoreController;
use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\AdminOrderController;
use App\Http\Controllers\Api\AdminSubscriptionController;
use App\Http\Controllers\Api\AdminSubscriptionPaymentController;
use App\Http\Controllers\Api\AdminSubscriptionPaymentMethodController;
use App\Http\Controllers\Api\AdminSettingsController;


/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Maintenance Status
|--------------------------------------------------------------------------
*/

Route::get('/maintenance-status', [
    MaintenanceStatusController::class,
    'index'
]);


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
| Public Contact Admin Settings
|--------------------------------------------------------------------------
*/

Route::get('/settings/contact-admin', [
    \App\Http\Controllers\Api\PublicSettingsController::class,
    'contactAdmin'
]);


/*
|--------------------------------------------------------------------------
| PROTECTED SELLER ROUTES
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


    /*
    |--------------------------------------------------------------------------
    | SELLER SUBSCRIPTION
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | Available Subscription Plans
    |--------------------------------------------------------------------------
    */

    Route::get('/seller/subscription/plans', [
        SellerSubscriptionPaymentController::class,
        'plans'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Available Subscription Payment Methods
    |--------------------------------------------------------------------------
    */

    Route::get('/seller/subscription/payment-methods', [
        SellerSubscriptionPaymentController::class,
        'paymentMethods'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Subscription Payment Method QR
    |--------------------------------------------------------------------------
    */

    Route::get('/seller/subscription/payment-methods/{id}/qr', [
        SellerSubscriptionPaymentController::class,
        'paymentMethodQr'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Seller Subscription Payment History
    |--------------------------------------------------------------------------
    */

    Route::get('/seller/subscription/payments', [
        SellerSubscriptionPaymentController::class,
        'index'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Create Subscription Payment Request
    |--------------------------------------------------------------------------
    */

    Route::post('/seller/subscription/payments', [
        SellerSubscriptionPaymentController::class,
        'store'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Upload Subscription Payment Proof
    |--------------------------------------------------------------------------
    */

    Route::post('/seller/subscription/payments/{id}/proof', [
        SellerSubscriptionPaymentController::class,
        'uploadProof'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Seller View Subscription Payment Proof
    |--------------------------------------------------------------------------
    */

    Route::get('/seller/subscription/payments/{id}/proof', [
        SellerSubscriptionPaymentController::class,
        'paymentProof'
    ]);
});


/*
|--------------------------------------------------------------------------
| ADMIN LOGIN
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
| PROTECTED ADMIN ROUTES
|--------------------------------------------------------------------------
|
| auth:sanctum
| admin
|
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'admin'
])
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

        Route::get('/sellers/{id}', [
            AdminSellerController::class,
            'show'
        ]);

        Route::patch('/sellers/{id}/status', [
            AdminSellerController::class,
            'updateStatus'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Admin Seller Subscription
        |--------------------------------------------------------------------------
        */

        /*
        |--------------------------------------------------------------------------
        | All Subscriptions
        |--------------------------------------------------------------------------
        */

        Route::get('/subscriptions', [
            AdminSubscriptionController::class,
            'index'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Existing Subscription Detail Route
        |--------------------------------------------------------------------------
        */

        Route::get('/subscriptions/{sellerId}', [
            AdminSubscriptionController::class,
            'show'
        ]);


        /*
        |--------------------------------------------------------------------------
        | IMPORTANT:
        | Seller Detail Page uses:
        |
        | GET /admin/sellers/{sellerId}/subscription
        |--------------------------------------------------------------------------
        */

        Route::get('/sellers/{sellerId}/subscription', [
            AdminSubscriptionController::class,
            'show'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Create / Update Seller Subscription
        |--------------------------------------------------------------------------
        */

        Route::post('/sellers/{id}/subscription', [
            AdminSubscriptionController::class,
            'update'
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

        Route::get('/stores/{id}', [
            AdminStoreController::class,
            'show'
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

        Route::get('/products/{id}', [
            AdminProductController::class,
            'show'
        ]);

        Route::patch('/products/{id}/status', [
            AdminProductController::class,
            'updateStatus'
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

        Route::get('/orders/{id}', [
            AdminOrderController::class,
            'show'
        ]);

        Route::patch('/orders/{id}/status', [
            AdminOrderController::class,
            'updateStatus'
        ]);

        Route::get('/orders/{id}/payment-proof', [
            AdminOrderController::class,
            'paymentProof'
        ]);

        Route::get('/orders/{id}/purchase-proof', [
            AdminOrderController::class,
            'purchaseProof'
        ]);


        /*
        |--------------------------------------------------------------------------
        | ADMIN SUBSCRIPTION PAYMENT METHODS
        |--------------------------------------------------------------------------
        */

        /*
        |--------------------------------------------------------------------------
        | List Payment Methods
        |--------------------------------------------------------------------------
        */

        Route::get('/subscription-payment-methods', [
            AdminSubscriptionPaymentMethodController::class,
            'index'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Show Payment Method
        |--------------------------------------------------------------------------
        */

        Route::get('/subscription-payment-methods/{id}', [
            AdminSubscriptionPaymentMethodController::class,
            'show'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Create Payment Method
        |--------------------------------------------------------------------------
        */

        Route::post('/subscription-payment-methods', [
            AdminSubscriptionPaymentMethodController::class,
            'store'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Update Payment Method
        |--------------------------------------------------------------------------
        */

        Route::post('/subscription-payment-methods/{id}', [
            AdminSubscriptionPaymentMethodController::class,
            'update'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Delete Payment Method
        |--------------------------------------------------------------------------
        */

        Route::delete('/subscription-payment-methods/{id}', [
            AdminSubscriptionPaymentMethodController::class,
            'destroy'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Payment Method QR Image
        |--------------------------------------------------------------------------
        */

        Route::get('/subscription-payment-methods/{id}/qr', [
            AdminSubscriptionPaymentMethodController::class,
            'qrImage'
        ]);


        /*
        |--------------------------------------------------------------------------
        | ADMIN SUBSCRIPTION PAYMENTS
        |--------------------------------------------------------------------------
        */

        /*
        |--------------------------------------------------------------------------
        | Payment List
        |--------------------------------------------------------------------------
        */

        Route::get('/subscription-payments', [
            AdminSubscriptionPaymentController::class,
            'index'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Payment Detail
        |--------------------------------------------------------------------------
        */

        Route::get('/subscription-payments/{id}', [
            AdminSubscriptionPaymentController::class,
            'show'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Payment Proof
        |--------------------------------------------------------------------------
        */

        Route::get('/subscription-payments/{id}/proof', [
            AdminSubscriptionPaymentController::class,
            'paymentProof'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Approve Payment
        |--------------------------------------------------------------------------
        */

        Route::post('/subscription-payments/{id}/approve', [
            AdminSubscriptionPaymentController::class,
            'approve'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Reject Payment
        |--------------------------------------------------------------------------
        */

        Route::post('/subscription-payments/{id}/reject', [
            AdminSubscriptionPaymentController::class,
            'reject'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Admin Settings
        |--------------------------------------------------------------------------
        */

        /*
        |--------------------------------------------------------------------------
        | Get Settings
        |--------------------------------------------------------------------------
        */

        Route::get('/settings', [
            AdminSettingsController::class,
            'index'
        ]);


        /*
        |--------------------------------------------------------------------------
        | Update Settings
        |--------------------------------------------------------------------------
        */

        Route::put('/settings', [
            AdminSettingsController::class,
            'update'
        ]);
    });
