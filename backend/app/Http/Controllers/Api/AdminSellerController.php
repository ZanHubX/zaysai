<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminSellerController extends Controller
{
    public function index(Request $request)
    {
        $sellers = User::whereHas('store')
            ->with('store')
            ->latest()
            ->get()
            ->map(function ($seller) {
                return [
                    'id' => $seller->id,
                    'name' => $seller->name,
                    'email' => $seller->email,
                    'is_active' => $seller->is_active ?? true,
                    'created_at' => $seller->created_at,

                    'store' => $seller->store
                        ? [
                            'id' => $seller->store->id,
                            'name' => $seller->store->name,
                            'slug' => $seller->store->slug,
                        ]
                        : null,
                ];
            });

        return response()->json([
            'sellers' => $sellers,
            'total' => $sellers->count(),
        ]);
    }
}
