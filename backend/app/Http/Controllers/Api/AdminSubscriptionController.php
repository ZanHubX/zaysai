<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminSubscriptionController extends Controller
{
    /**
     * Get all seller subscriptions.
     */
    public function index(Request $request)
    {
        $subscriptions = Subscription::with([
            'user',
            'plan',
        ])
            ->latest()
            ->get()
            ->map(function ($subscription) {
                return [
                    'id' => $subscription->id,

                    'seller' => $subscription->user
                        ? [
                            'id' => $subscription->user->id,
                            'name' => $subscription->user->name,
                            'email' => $subscription->user->email,
                        ]
                        : null,

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
                        ]
                        : null,

                    'status' => $subscription->status,
                    'trial_ends_at' => $subscription->trial_ends_at,
                    'starts_at' => $subscription->starts_at,
                    'ends_at' => $subscription->ends_at,

                    'created_at' => $subscription->created_at,
                    'updated_at' => $subscription->updated_at,
                ];
            });

        return response()->json([
            'subscriptions' => $subscriptions,
            'total' => $subscriptions->count(),
        ]);
    }


    /**
     * Get a seller's current subscription.
     */
    public function show(Request $request, $sellerId)
    {
        $seller = User::find($sellerId);

        if (!$seller) {
            return response()->json([
                'message' => 'Seller not found.',
            ], 404);
        }

        $subscription = Subscription::with('plan')
            ->where('user_id', $seller->id)
            ->latest()
            ->first();

        if (!$subscription) {
            return response()->json([
                'seller' => [
                    'id' => $seller->id,
                    'name' => $seller->name,
                    'email' => $seller->email,
                ],
                'subscription' => null,
            ]);
        }

        return response()->json([
            'seller' => [
                'id' => $seller->id,
                'name' => $seller->name,
                'email' => $seller->email,
            ],

            'subscription' => [
                'id' => $subscription->id,

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
                        'custom_domain' => $subscription->plan->custom_domain,
                        'remove_branding' => $subscription->plan->remove_branding,
                        'advanced_analytics' => $subscription->plan->advanced_analytics,
                        'priority_support' => $subscription->plan->priority_support,
                    ]
                    : null,

                'status' => $subscription->status,
                'trial_ends_at' => $subscription->trial_ends_at,
                'starts_at' => $subscription->starts_at,
                'ends_at' => $subscription->ends_at,

                'created_at' => $subscription->created_at,
                'updated_at' => $subscription->updated_at,
            ],
        ]);
    }


    /**
     * Create a subscription for a seller.
     */
    public function store(Request $request, $sellerId)
    {
        $validated = $request->validate([
            'plan_id' => [
                'required',
                'integer',
                'exists:plans,id',
            ],

            'status' => [
                'nullable',
                'in:trial,active,expired,cancelled,paused',
            ],

            'trial_ends_at' => [
                'nullable',
                'date',
            ],

            'starts_at' => [
                'nullable',
                'date',
            ],

            'ends_at' => [
                'nullable',
                'date',
            ],
        ]);

        $seller = User::find($sellerId);

        if (!$seller) {
            return response()->json([
                'message' => 'Seller not found.',
            ], 404);
        }

        $plan = Plan::find($validated['plan_id']);

        if (!$plan || !$plan->is_active) {
            return response()->json([
                'message' => 'Selected plan is inactive or unavailable.',
            ], 422);
        }

        $existingSubscription = Subscription::where(
            'user_id',
            $seller->id
        )
            ->whereIn('status', [
                'trial',
                'active',
                'paused',
            ])
            ->latest()
            ->first();

        if ($existingSubscription) {
            return response()->json([
                'message' => 'Seller already has an active subscription.',
                'subscription_id' => $existingSubscription->id,
            ], 409);
        }

        $subscription = DB::transaction(function () use (
            $seller,
            $plan,
            $validated
        ) {
            return Subscription::create([
                'user_id' => $seller->id,
                'plan_id' => $plan->id,
                'status' => $validated['status'] ?? 'active',
                'trial_ends_at' => $validated['trial_ends_at'] ?? null,
                'starts_at' => $validated['starts_at'] ?? now(),
                'ends_at' => $validated['ends_at'] ?? null,
            ]);
        });

        $subscription->load([
            'user',
            'plan',
        ]);

        return response()->json([
            'message' => 'Subscription created successfully.',

            'subscription' => [
                'id' => $subscription->id,
                'seller_id' => $subscription->user_id,
                'plan_id' => $subscription->plan_id,
                'plan_name' => $subscription->plan?->name,
                'status' => $subscription->status,
                'trial_ends_at' => $subscription->trial_ends_at,
                'starts_at' => $subscription->starts_at,
                'ends_at' => $subscription->ends_at,
            ],
        ], 201);
    }


    /**
     * Update a seller's subscription.
     */
    public function update(Request $request, $sellerId)
    {
        $validated = $request->validate([
            'plan_id' => [
                'sometimes',
                'integer',
                'exists:plans,id',
            ],

            'status' => [
                'sometimes',
                'in:trial,active,expired,cancelled,paused',
            ],

            'trial_ends_at' => [
                'nullable',
                'date',
            ],

            'starts_at' => [
                'nullable',
                'date',
            ],

            'ends_at' => [
                'nullable',
                'date',
            ],
        ]);

        $seller = User::find($sellerId);

        if (!$seller) {
            return response()->json([
                'message' => 'Seller not found.',
            ], 404);
        }

        $subscription = Subscription::where(
            'user_id',
            $seller->id
        )
            ->latest()
            ->first();

        if (!$subscription) {
            return response()->json([
                'message' => 'Seller does not have a subscription.',
            ], 404);
        }

        if (isset($validated['plan_id'])) {
            $plan = Plan::find($validated['plan_id']);

            if (!$plan || !$plan->is_active) {
                return response()->json([
                    'message' => 'Selected plan is inactive or unavailable.',
                ], 422);
            }
        }

        DB::transaction(function () use (
            $subscription,
            $validated
        ) {
            $subscription->update($validated);
        });

        $subscription->refresh();

        $subscription->load([
            'user',
            'plan',
        ]);

        return response()->json([
            'message' => 'Subscription updated successfully.',

            'subscription' => [
                'id' => $subscription->id,
                'seller_id' => $subscription->user_id,
                'plan_id' => $subscription->plan_id,
                'plan_name' => $subscription->plan?->name,
                'status' => $subscription->status,
                'trial_ends_at' => $subscription->trial_ends_at,
                'starts_at' => $subscription->starts_at,
                'ends_at' => $subscription->ends_at,
            ],
        ]);
    }
}
