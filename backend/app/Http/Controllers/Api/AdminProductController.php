<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
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
                    'stock' => $product->stock,
                    'status' => $product->status,
                    'created_at' => $product->created_at,

                    'store' => $product->store
                        ? [
                            'id' => $product->store->id,
                            'name' => $product->store->name,
                            'slug' => $product->store->slug,
                        ]
                        : null,

                    'seller' => $product->store?->user
                        ? [
                            'id' => $product->store->user->id,
                            'name' => $product->store->user->name,
                            'email' => $product->store->user->email,
                        ]
                        : null,
                ];
            });

        return response()->json([
            'products' => $products,
            'total' => $products->count(),
        ]);
    }
}
