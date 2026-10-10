<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;

class AdminStoreController extends Controller
{
    /**
     * Display all stores.
     */
    public function index(Request $request)
    {
        $stores = Store::with([
            'user',
        ])
            ->withCount([
                'products',
                'orders',
            ])
            ->latest()
            ->get()
            ->map(function ($store) {
                return [
                    'id' => $store->id,

                    'name' => $store->name,

                    'slug' => $store->slug,

                    'logo' => $store->logo,

                    'status' => $store->status,

                    'created_at' => $store->created_at,

                    'updated_at' => $store->updated_at,

                    /*
                    |--------------------------------------------------------------------------
                    | Owner / Seller
                    |--------------------------------------------------------------------------
                    */

                    'seller' => $store->user
                        ? [
                            'id' => $store->user->id,

                            'name' => $store->user->name,

                            'email' => $store->user->email,

                            'is_active' => (bool) (
                                $store->user->is_active
                                ?? true
                            ),
                        ]
                        : null,

                    /*
                    |--------------------------------------------------------------------------
                    | Counts
                    |--------------------------------------------------------------------------
                    */

                    'products_count' => $store->products_count,

                    'orders_count' => $store->orders_count,
                ];
            });

        return response()->json([
            'stores' => $stores,

            'total' => $stores->count(),
        ]);
    }


    /**
     * Display a single store.
     */
    public function show(Request $request, $id)
    {
        $store = Store::with([
            'user',
            'products',
            'orders',
        ])
            ->withCount([
                'products',
                'orders',
            ])
            ->find($id);

        if (!$store) {
            return response()->json([
                'message' => 'Store not found.',
            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | Products
        |--------------------------------------------------------------------------
        */

        $products = $store->products
            ->map(function ($product) {
                return [
                    'id' => $product->id,

                    'name' => $product->name,

                    'slug' => $product->slug,

                    'description' => $product->description,

                    'price' => $product->price,

                    'currency' => $product->currency,

                    'image' => $product->image,

                    'is_active' => (bool) $product->is_active,

                    'status' => $product->is_active
                        ? 'active'
                        : 'inactive',

                    'created_at' => $product->created_at,

                    'updated_at' => $product->updated_at,
                ];
            });


        /*
        |--------------------------------------------------------------------------
        | Seller
        |--------------------------------------------------------------------------
        */

        $seller = $store->user
            ? [
                'id' => $store->user->id,

                'name' => $store->user->name,

                'email' => $store->user->email,

                'is_active' => (bool) (
                    $store->user->is_active
                    ?? true
                ),

                'created_at' => $store->user->created_at,

                'updated_at' => $store->user->updated_at,
            ]
            : null;


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'store' => [
                'id' => $store->id,

                'name' => $store->name,

                'slug' => $store->slug,

                'logo' => $store->logo,

                'description' => $store->description,

                'phone' => $store->phone,

                'status' => $store->status,

                'created_at' => $store->created_at,

                'updated_at' => $store->updated_at,
            ],

            'seller' => $seller,

            'products' => $products,

            'orders_count' => $store->orders_count,

            'total_products' => $products->count(),
        ]);
    }
}
