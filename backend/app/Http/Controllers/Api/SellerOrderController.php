<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SellerOrderController extends Controller
{
    public function index(Request $request)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $orders = $store->orders()
            ->with('items')
            ->latest()
            ->paginate(20);

        return response()->json([
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
            ],
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, int $id)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $order = $store->orders()
            ->with('items')
            ->findOrFail($id);

        return response()->json([
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                'in:pending,processing,completed,cancelled',
            ],
        ]);

        $order = $store->orders()->findOrFail($id);

        $order->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Order status updated successfully.',
            'order' => $order,
        ]);
    }
}
