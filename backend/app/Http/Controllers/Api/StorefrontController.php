<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;

class StorefrontController extends Controller
{
    public function show(string $slug)
    {
        $store = Store::where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        return response()->json([
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
                'logo' => $store->logo,
                'description' => $store->description,
                'phone' => $store->phone,
            ],
        ]);
    }

    public function products(string $slug)
    {
        $store = Store::where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        $products = $store->products()
            ->where('is_active', true)
            ->latest()
            ->paginate(20);

        return response()->json([
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
            ],
            'products' => $products,
        ]);
    }

    public function product(string $slug, string $productSlug)
    {
        $store = Store::where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        $product = $store->products()
            ->where('slug', $productSlug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
            ],
            'product' => $product,
        ]);
    }
}
