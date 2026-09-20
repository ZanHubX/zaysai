<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    /**
     * Display all orders across the ZaySai platform.
     */
    public function index(Request $request)
    {
        $orders = Order::with([
            'store',
            'paymentMethod',
            'items',
        ])
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,

                    'order_number' => $order->order_number,

                    'customer' => [
                        'name' => $order->customer_name,
                        'phone' => $order->customer_phone,
                        'email' => $order->customer_email,
                        'contact_platform' => $order->contact_platform,
                        'contact_name' => $order->contact_name,
                        'contact_username' => $order->contact_username,
                    ],

                    'store' => $order->store
                        ? [
                            'id' => $order->store->id,
                            'name' => $order->store->name,
                            'slug' => $order->store->slug,
                        ]
                        : null,

                    'payment_method' => $order->paymentMethod
                        ? [
                            'id' => $order->paymentMethod->id,
                            'name' => $order->paymentMethod->name,
                        ]
                        : null,

                    'total' => $order->total,
                    'currency' => $order->currency,

                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'fulfillment_status' => $order->fulfillment_status,

                'items_count' => $order->items->sum('quantity'),

                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                ];
            });

        return response()->json([
            'orders' => $orders,
            'total' => $orders->count(),
        ]);
    }
}
