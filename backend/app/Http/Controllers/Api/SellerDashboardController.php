<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SellerDashboardController extends Controller
{
    public function index(Request $request)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $totalProducts = $store->products()->count();

        $totalOrders = $store->orders()->count();

        $paidOrders = $store->orders()
            ->where('payment_status', 'paid')
            ->count();

        $unpaidOrders = $store->orders()
            ->where('payment_status', 'unpaid')
            ->count();

        $pendingOrders = $store->orders()
            ->where('status', 'pending')
            ->count();

        $processingOrders = $store->orders()
            ->where('status', 'processing')
            ->count();

        $completedOrders = $store->orders()
            ->where('status', 'completed')
            ->count();

        $cancelledOrders = $store->orders()
            ->where('status', 'cancelled')
            ->count();

        $revenue = $store->orders()
            ->where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->sum('total');

        $recentOrders = $store->orders()
            ->with('items')
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
                'status' => $store->status,
            ],

            'stats' => [
                'total_products' => $totalProducts,
                'total_orders' => $totalOrders,
                'paid_orders' => $paidOrders,
                'unpaid_orders' => $unpaidOrders,
                'pending_orders' => $pendingOrders,
                'processing_orders' => $processingOrders,
                'completed_orders' => $completedOrders,
                'cancelled_orders' => $cancelledOrders,
                'revenue' => $revenue,
            ],

            'recent_orders' => $recentOrders,
        ]);
    }
}
