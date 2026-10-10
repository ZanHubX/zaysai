<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    /**
     * Display all products.
     */
    public function index(Request $request)
    {
        $products = Product::with([
            'store',
            'store.user',
        ])
            ->latest()
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->price,
                    'currency' => $product->currency,
                    'description' => $product->description,
                    'image' => $product->image,

                    // Product status comes from is_active
                    'is_active' => (bool) $product->is_active,

                    'status' => $product->is_active
                        ? 'active'
                        : 'inactive',

                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,

                    'store' => $product->store
                        ? [
                            'id' => $product->store->id,
                            'name' => $product->store->name,
                            'slug' => $product->store->slug,
                            'status' => $product->store->status,
                        ]
                        : null,

                    'seller' => $product->store?->user
                        ? [
                            'id' => $product->store->user->id,
                            'name' => $product->store->user->name,
                            'email' => $product->store->user->email,
                            'is_active' => (bool) (
                                $product->store->user->is_active
                                ?? true
                            ),
                        ]
                        : null,
                ];
            });

        return response()->json([
            'products' => $products,
            'total' => $products->count(),
        ]);
    }

    /**
     * Display a single product with details.
     */
    public function show(Request $request, $id)
    {
        $product = Product::with([
            'store',
            'store.user',
        ])->find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        return response()->json([
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                'currency' => $product->currency,
                'image' => $product->image,

                // Product status
                'is_active' => (bool) $product->is_active,

                'status' => $product->is_active
                    ? 'active'
                    : 'inactive',

                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ],

            'store' => $product->store
                ? [
                    'id' => $product->store->id,
                    'name' => $product->store->name,
                    'slug' => $product->store->slug,
                    'logo' => $product->store->logo,
                    'status' => $product->store->status,
                ]
                : null,

            'seller' => $product->store?->user
                ? [
                    'id' => $product->store->user->id,
                    'name' => $product->store->user->name,
                    'email' => $product->store->user->email,
                    'is_active' => (bool) (
                        $product->store->user->is_active
                        ?? true
                    ),
                ]
                : null,
        ]);
    }

    /**
     * Activate or deactivate a product.
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        $product->is_active = $validated['is_active'];
        $product->save();

        return response()->json([
            'message' => $product->is_active
                ? 'Product activated successfully.'
                : 'Product deactivated successfully.',

            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'is_active' => (bool) $product->is_active,
                'status' => $product->is_active
                    ? 'active'
                    : 'inactive',
            ],
        ]);
    }
}