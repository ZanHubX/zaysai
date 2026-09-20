<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

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

        /*
        |--------------------------------------------------------------------------
        | Basic Stats
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | Revenue
        |--------------------------------------------------------------------------
        |
        | Revenue only includes paid orders and excludes cancelled orders.
        |
        */

        $revenue = $store->orders()
            ->where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->sum('total');

        /*
        |--------------------------------------------------------------------------
        | Sales Overview - Last 7 Days
        |--------------------------------------------------------------------------
        */

        $startDate = Carbon::today()->subDays(6);
        $endDate = Carbon::today();

        $salesOrders = $store->orders()
            ->whereBetween('created_at', [
                $startDate->startOfDay(),
                $endDate->endOfDay(),
            ])
            ->where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->get([
                'total',
                'created_at',
            ]);

        $salesOverview = collect();

        for ($i = 0; $i < 7; $i++) {
            $date = $startDate->copy()->addDays($i);

            $dailyOrders = $salesOrders->filter(function ($order) use ($date) {
                return $order->created_at->isSameDay($date);
            });

            $salesOverview->push([
                'date' =>
                $date->format('Y-m-d'),

                'label' =>
                $date->format('M d'),

                'orders' =>
                $dailyOrders->count(),

                'revenue' =>
                $dailyOrders->sum('total'),
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Top Products
        |--------------------------------------------------------------------------
        */

        $topProducts = $store->orders()
            ->where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->join(
                'order_items',
                'orders.id',
                '=',
                'order_items.order_id'
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
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Recent Orders
        |--------------------------------------------------------------------------
        */

        $recentOrders = $store->orders()
            ->with('items')
            ->latest()
            ->limit(5)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'store' => [
                'id' =>
                $store->id,

                'name' =>
                $store->name,

                'slug' =>
                $store->slug,

                'logo' =>
                $store->logo,

                'status' =>
                $store->status,
            ],

            'stats' => [
                'total_products' =>
                $totalProducts,

                'total_orders' =>
                $totalOrders,

                'paid_orders' =>
                $paidOrders,

                'unpaid_orders' =>
                $unpaidOrders,

                'pending_orders' =>
                $pendingOrders,

                'processing_orders' =>
                $processingOrders,

                'completed_orders' =>
                $completedOrders,

                'cancelled_orders' =>
                $cancelledOrders,

                'revenue' =>
                $revenue,
            ],

            'sales_overview' =>
            $salesOverview,

            'top_products' =>
            $topProducts,

            'recent_orders' =>
            $recentOrders,
        ]);
    }
}
