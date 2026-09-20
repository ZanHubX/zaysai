<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Main Admin Dashboard
     */
    public function index(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | Platform Overview
        |--------------------------------------------------------------------------
        */

        $totalSellers = User::whereHas('store')->count();

        $totalStores = Store::count();

        $totalProducts = DB::table('products')->count();

        $totalOrders = Order::count();

        /*
        |--------------------------------------------------------------------------
        | Revenue
        |--------------------------------------------------------------------------
        |
        | Revenue includes paid orders that are not cancelled.
        |
        */

        $totalRevenue = Order::where(
            'payment_status',
            'paid'
        )
            ->where(
                'status',
                '!=',
                'cancelled'
            )
            ->sum('total');

        /*
        |--------------------------------------------------------------------------
        | Order Status
        |--------------------------------------------------------------------------
        */

        $pendingOrders = Order::where(
            'status',
            'pending'
        )->count();

        $processingOrders = Order::where(
            'status',
            'processing'
        )->count();

        $completedOrders = Order::where(
            'status',
            'completed'
        )->count();

        $cancelledOrders = Order::where(
            'status',
            'cancelled'
        )->count();

        /*
        |--------------------------------------------------------------------------
        | Payment Status
        |--------------------------------------------------------------------------
        */

        $paidOrders = Order::where(
            'payment_status',
            'paid'
        )->count();

        $unpaidOrders = Order::where(
            'payment_status',
            'unpaid'
        )->count();

        /*
        |--------------------------------------------------------------------------
        | Recent Orders
        |--------------------------------------------------------------------------
        */

        $recentOrders = Order::with([
            'store',
            'items',
        ])
            ->latest()
            ->limit(10)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Top Products
        |--------------------------------------------------------------------------
        */

        $topProducts = DB::table('order_items')
            ->join(
                'orders',
                'orders.id',
                '=',
                'order_items.order_id'
            )
            ->where(
                'orders.payment_status',
                'paid'
            )
            ->where(
                'orders.status',
                '!=',
                'cancelled'
            )
            ->select([
                'order_items.product_id',
                'order_items.product_name',
                DB::raw(
                    'SUM(order_items.quantity) as total_quantity'
                ),
                DB::raw(
                    'SUM(order_items.subtotal) as total_revenue'
                ),
            ])
            ->groupBy(
                'order_items.product_id',
                'order_items.product_name'
            )
            ->orderByDesc(
                'total_revenue'
            )
            ->limit(5)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'stats' => [
                'total_sellers' => $totalSellers,
                'total_stores' => $totalStores,
                'total_products' => $totalProducts,
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,

                'pending_orders' => $pendingOrders,
                'processing_orders' => $processingOrders,
                'completed_orders' => $completedOrders,
                'cancelled_orders' => $cancelledOrders,

                'paid_orders' => $paidOrders,
                'unpaid_orders' => $unpaidOrders,
            ],

            'recent_orders' => $recentOrders,

            'top_products' => $topProducts,
        ]);
    }
}
