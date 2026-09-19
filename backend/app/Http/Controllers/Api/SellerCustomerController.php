<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SellerCustomerController extends Controller
{
    public function index(Request $request)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $customers = $store->orders()
            ->select([
                'customer_name',
                'customer_phone',
                'customer_email',
                'contact_platform',
                'contact_name',
                'contact_username',
                'contact_link',
            ])
            ->get()
            ->groupBy(function ($order) {
                return $order->customer_phone;
            })
            ->map(function ($orders) {
                $latestOrder = $orders
                    ->sortByDesc('created_at')
                    ->first();

                return [
                    'customer_name' => $latestOrder->customer_name,
                    'customer_phone' => $latestOrder->customer_phone,
                    'customer_email' => $latestOrder->customer_email,

                    'contact_platform' =>
                    $latestOrder->contact_platform,

                    'contact_name' =>
                    $latestOrder->contact_name,

                    'contact_username' =>
                    $latestOrder->contact_username,

                    'contact_link' =>
                    $latestOrder->contact_link,

                    'total_orders' =>
                    $orders->count(),

                    'total_spent' =>
                    $orders->sum('total'),

                    'last_order_at' =>
                    $latestOrder->created_at,
                ];
            })
            ->values();

        return response()->json([
            'customers' => $customers,
        ]);
    }
}
