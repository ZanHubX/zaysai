<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;

class AdminStoreController extends Controller
{
    public function index(Request $request)
    {
        $stores = Store::with('user')
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
                    'created_at' => $store->created_at,

                    'owner' => $store->user
                        ? [
                            'id' => $store->user->id,
                            'name' => $store->user->name,
                            'email' => $store->user->email,
                        ]
                        : null,

                    'products_count' => $store->products_count,
                    'orders_count' => $store->orders_count,
                ];
            });

        return response()->json([
            'stores' => $stores,
            'total' => $stores->count(),
        ]);
    }
}
