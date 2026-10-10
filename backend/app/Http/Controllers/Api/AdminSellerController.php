<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminSellerController extends Controller
{
    /**
     * Display all sellers.
     */
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
                            'description' => $seller->store->description,
                            'status' => $seller->store->status,
                        ]
                        : null,
                ];
            });

        return response()->json([
            'sellers' => $sellers,
            'total' => $sellers->count(),
        ]);
    }

    /**
     * Display a single seller with details.
     */
    public function show(Request $request, $id)
    {
        $seller = User::with([
            'store',
            'store.products',
            'store.orders',
            'subscriptions',
            'subscriptions.plan',
        ])->find($id);

        if (!$seller) {
            return response()->json([
                'message' => 'Seller not found.',
            ], 404);
        }

        if (!$seller->store) {
            return response()->json([
                'message' => 'This seller does not have a store.',
            ], 404);
        }

        $store = $seller->store;

        /*
        |--------------------------------------------------------------------------
        | Latest Subscription
        |--------------------------------------------------------------------------
        */

        $subscription = $seller->subscriptions
            ->sortByDesc('created_at')
            ->first();

        /*
        |--------------------------------------------------------------------------
        | Orders & Statistics
        |--------------------------------------------------------------------------
        */

        $orders = $store->orders;

        $totalOrders = $orders->count();

        $totalRevenue = $orders
            ->where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->sum('total');

        $pendingOrders = $orders
            ->where('status', 'pending')
            ->count();

        $processingOrders = $orders
            ->where('status', 'processing')
            ->count();

        $completedOrders = $orders
            ->where('status', 'completed')
            ->count();

        $cancelledOrders = $orders
            ->where('status', 'cancelled')
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Recent Orders
        |--------------------------------------------------------------------------
        */

        $recentOrders = $orders
            ->sortByDesc('created_at')
            ->take(10)
            ->values()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'customer_phone' => $order->customer_phone,
                    'total' => $order->total,
                    'currency' => $order->currency,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'fulfillment_status' => $order->fulfillment_status,
                    'created_at' => $order->created_at,
                ];
            });

        /*
        |--------------------------------------------------------------------------
        | Subscription Data
        |--------------------------------------------------------------------------
        */

        $subscriptionData = null;

        if ($subscription) {
            $subscriptionData = [
                'id' => $subscription->id,
                'status' => $subscription->status,
                'trial_ends_at' => $subscription->trial_ends_at,
                'starts_at' => $subscription->starts_at,
                'ends_at' => $subscription->ends_at,

                'plan' => $subscription->plan
                    ? [
                        'id' => $subscription->plan->id,
                        'name' => $subscription->plan->name,
                        'slug' => $subscription->plan->slug,
                        'price' => $subscription->plan->price,
                        'currency' => $subscription->plan->currency,
                        'billing_cycle' => $subscription->plan->billing_cycle,

                        'max_products' => $subscription->plan->max_products,
                        'max_orders' => $subscription->plan->max_orders,

                        'custom_domain' => (bool) $subscription->plan->custom_domain,
                        'remove_branding' => (bool) $subscription->plan->remove_branding,
                        'advanced_analytics' => (bool) $subscription->plan->advanced_analytics,
                        'priority_support' => (bool) $subscription->plan->priority_support,
                    ]
                    : null,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'seller' => [
                'id' => $seller->id,
                'name' => $seller->name,
                'email' => $seller->email,
                'is_active' => $seller->is_active ?? true,
                'created_at' => $seller->created_at,
                'updated_at' => $seller->updated_at,
            ],

            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
                'logo' => $store->logo,
                'description' => $store->description,
                'phone' => $store->phone,
                'status' => $store->status,
                'created_at' => $store->created_at,
                'updated_at' => $store->updated_at,
            ],

            'subscription' => $subscriptionData,

            'stats' => [
                'products' => $store->products->count(),
                'orders' => $totalOrders,
                'revenue' => $totalRevenue,
                'pending_orders' => $pendingOrders,
                'processing_orders' => $processingOrders,
                'completed_orders' => $completedOrders,
                'cancelled_orders' => $cancelledOrders,
            ],

            'recent_orders' => $recentOrders,
        ]);
    }

    /**
     * Activate or deactivate a seller.
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $seller = User::whereHas('store')
            ->find($id);

        if (!$seller) {
            return response()->json([
                'message' => 'Seller not found.',
            ], 404);
        }

        $seller->is_active = $validated['is_active'];
        $seller->save();

        return response()->json([
            'message' => $seller->is_active
                ? 'Seller activated successfully.'
                : 'Seller deactivated successfully.',

            'seller' => [
                'id' => $seller->id,
                'name' => $seller->name,
                'email' => $seller->email,
                'is_active' => $seller->is_active,
            ],
        ]);
    }
}
