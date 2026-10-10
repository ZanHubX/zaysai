<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\SubscriptionPaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AdminSubscriptionPaymentController extends Controller
{
    /**
     * =========================================================
     * LIST SUBSCRIPTION PAYMENTS
     * =========================================================
     */
    public function index(Request $request)
    {
        $paymentMethodNames = SubscriptionPaymentMethod::query()
            ->pluck('name', 'id');

        $payments = SubscriptionPayment::with([
            'user',
            'plan',
            'reviewer',
        ])
            ->latest()
            ->get()
            ->map(function ($payment) use ($paymentMethodNames) {

                $paymentMethodValue =
                    $payment->payment_method;

                if (
                    is_numeric($paymentMethodValue) &&
                    $paymentMethodNames->has(
                        (int) $paymentMethodValue
                    )
                ) {
                    $paymentMethodValue =
                        $paymentMethodNames->get(
                            (int) $paymentMethodValue
                        );
                }

                return [
                    'id' => $payment->id,

                    /*
                    |--------------------------------------------------------------------------
                    | Seller
                    |--------------------------------------------------------------------------
                    */
                    'seller' => $payment->user
                        ? [
                            'id' =>
                            $payment->user->id,

                            'name' =>
                            $payment->user->name,

                            'email' =>
                            $payment->user->email,
                        ]
                        : null,

                    /*
                    |--------------------------------------------------------------------------
                    | Plan
                    |--------------------------------------------------------------------------
                    */
                    'plan' => $payment->plan
                        ? [
                            'id' =>
                            $payment->plan->id,

                            'name' =>
                            $payment->plan->name,

                            'price' =>
                            $payment->plan->price,

                            'currency' =>
                            $payment->plan->currency,

                            'billing_cycle' =>
                            $payment->plan->billing_cycle,
                        ]
                        : null,

                    /*
                    |--------------------------------------------------------------------------
                    | Payment
                    |--------------------------------------------------------------------------
                    */
                    'amount' =>
                    $payment->amount,

                    'currency' =>
                    $payment->currency,

                    'payment_method' =>
                    $paymentMethodValue,

                    'transaction_reference' =>
                    $payment->transaction_reference,

                    /*
                    |--------------------------------------------------------------------------
                    | Proof
                    |--------------------------------------------------------------------------
                    */
                    'has_proof' =>
                    !empty($payment->payment_proof),

                    /*
                    |--------------------------------------------------------------------------
                    | Status
                    |--------------------------------------------------------------------------
                    */
                    'status' =>
                    $payment->status,

                    'rejection_reason' =>
                    $payment->rejection_reason,

                    /*
                    |--------------------------------------------------------------------------
                    | Reviewer
                    |--------------------------------------------------------------------------
                    */
                    'reviewed_by' =>
                    $payment->reviewer
                        ? [
                            'id' =>
                            $payment->reviewer->id,

                            'name' =>
                            $payment->reviewer->name,
                        ]
                        : null,

                    'reviewed_at' =>
                    $payment->reviewed_at,

                    /*
                    |--------------------------------------------------------------------------
                    | Dates
                    |--------------------------------------------------------------------------
                    */
                    'created_at' =>
                    $payment->created_at,

                    'updated_at' =>
                    $payment->updated_at,
                ];
            });

        return response()->json([
            'payments' => $payments,

            'total' =>
            $payments->count(),

            'stats' => [
                'pending' =>
                $payments
                    ->where(
                        'status',
                        'pending'
                    )
                    ->count(),

                'approved' =>
                $payments
                    ->where(
                        'status',
                        'approved'
                    )
                    ->count(),

                'rejected' =>
                $payments
                    ->where(
                        'status',
                        'rejected'
                    )
                    ->count(),

                'total' =>
                $payments->count(),
            ],
        ]);
    }


    /**
     * =========================================================
     * SHOW SINGLE PAYMENT
     * =========================================================
     */
    public function show(
        Request $request,
        $id
    ) {
        $payment = SubscriptionPayment::with([
            'user',
            'plan',
            'reviewer',
        ])->find($id);

        if (!$payment) {
            return response()->json([
                'message' =>
                'Subscription payment not found.',
            ], 404);
        }

        $paymentMethodValue =
            $payment->payment_method;

        if (is_numeric($paymentMethodValue)) {
            $paymentMethod =
                SubscriptionPaymentMethod::find(
                    (int) $paymentMethodValue
                );

            if ($paymentMethod) {
                $paymentMethodValue =
                    $paymentMethod->name;
            }
        }

        return response()->json([
            'payment' => [
                'id' =>
                $payment->id,

                /*
                |--------------------------------------------------------------------------
                | Seller
                |--------------------------------------------------------------------------
                */
                'seller' => $payment->user
                    ? [
                        'id' =>
                        $payment->user->id,

                        'name' =>
                        $payment->user->name,

                        'email' =>
                        $payment->user->email,
                    ]
                    : null,

                /*
                |--------------------------------------------------------------------------
                | Plan
                |--------------------------------------------------------------------------
                */
                'plan' => $payment->plan
                    ? [
                        'id' =>
                        $payment->plan->id,

                        'name' =>
                        $payment->plan->name,

                        'price' =>
                        $payment->plan->price,

                        'currency' =>
                        $payment->plan->currency,

                        'billing_cycle' =>
                        $payment->plan->billing_cycle,
                    ]
                    : null,

                /*
                |--------------------------------------------------------------------------
                | Payment
                |--------------------------------------------------------------------------
                */
                'amount' =>
                $payment->amount,

                'currency' =>
                $payment->currency,

                'payment_method' =>
                $paymentMethodValue,

                'transaction_reference' =>
                $payment->transaction_reference,

                /*
                |--------------------------------------------------------------------------
                | Proof
                |--------------------------------------------------------------------------
                */
                'has_proof' =>
                !empty($payment->payment_proof),

                /*
                |--------------------------------------------------------------------------
                | Status
                |--------------------------------------------------------------------------
                */
                'status' =>
                $payment->status,

                'rejection_reason' =>
                $payment->rejection_reason,

                /*
                |--------------------------------------------------------------------------
                | Reviewer
                |--------------------------------------------------------------------------
                */
                'reviewed_by' =>
                $payment->reviewer
                    ? [
                        'id' =>
                        $payment->reviewer->id,

                        'name' =>
                        $payment->reviewer->name,
                    ]
                    : null,

                'reviewed_at' =>
                $payment->reviewed_at,

                /*
                |--------------------------------------------------------------------------
                | Dates
                |--------------------------------------------------------------------------
                */
                'created_at' =>
                $payment->created_at,

                'updated_at' =>
                $payment->updated_at,
            ],
        ]);
    }


    /**
     * =========================================================
     * VIEW PAYMENT PROOF
     * =========================================================
     */
    public function paymentProof(
        Request $request,
        $id
    ) {
        $payment =
            SubscriptionPayment::find($id);

        if (!$payment) {
            return response()->json([
                'message' =>
                'Subscription payment not found.',
            ], 404);
        }

        if (!$payment->payment_proof) {
            return response()->json([
                'message' =>
                'No payment proof uploaded.',
            ], 404);
        }

        $disk = Storage::disk('local');

        if (!$disk->exists(
            $payment->payment_proof
        )) {
            return response()->json([
                'message' =>
                'Payment proof file not found.',
            ], 404);
        }

        return response()->file(
            $disk->path(
                $payment->payment_proof
            )
        );
    }


    /**
     * =========================================================
     * APPROVE SUBSCRIPTION PAYMENT
     * =========================================================
     */
    public function approve(
        Request $request,
        $id
    ) {
        return DB::transaction(
            function () use (
                $request,
                $id
            ) {

                /*
                |--------------------------------------------------------------------------
                | Lock payment row
                |--------------------------------------------------------------------------
                */
                $payment =
                    SubscriptionPayment::with('plan')
                    ->lockForUpdate()
                    ->find($id);

                if (!$payment) {
                    return response()->json([
                        'message' =>
                        'Subscription payment not found.',
                    ], 404);
                }

                /*
                |--------------------------------------------------------------------------
                | Only pending payments
                |--------------------------------------------------------------------------
                */
                if (
                    $payment->status !==
                    'pending'
                ) {
                    return response()->json([
                        'message' =>
                        'Only pending payments can be approved.',
                    ], 422);
                }

                /*
                |--------------------------------------------------------------------------
                | Payment proof required
                |--------------------------------------------------------------------------
                */
                if (
                    !$payment->payment_proof
                ) {
                    return response()->json([
                        'message' =>
                        'Payment proof is required before approval.',
                    ], 422);
                }

                /*
                |--------------------------------------------------------------------------
                | Plan exists
                |--------------------------------------------------------------------------
                */
                if (!$payment->plan) {
                    return response()->json([
                        'message' =>
                        'Selected plan no longer exists.',
                    ], 422);
                }

                /*
                |--------------------------------------------------------------------------
                | Plan must be active
                |--------------------------------------------------------------------------
                */
                if (
                    !$payment->plan->is_active
                ) {
                    return response()->json([
                        'message' =>
                        'Selected plan is inactive.',
                    ], 422);
                }

                /*
                |--------------------------------------------------------------------------
                | Seller
                |--------------------------------------------------------------------------
                */
                $seller =
                    $payment->user;

                if (!$seller) {
                    return response()->json([
                        'message' =>
                        'Seller account not found.',
                    ], 422);
                }

                $now = now();

                /*
                |--------------------------------------------------------------------------
                | Expire current subscription
                |--------------------------------------------------------------------------
                */
                Subscription::where(
                    'user_id',
                    $seller->id
                )
                    ->whereIn(
                        'status',
                        [
                            'trial',
                            'active',
                            'paused',
                        ]
                    )
                    ->update([
                        'status' =>
                        'expired',
                    ]);

                /*
                |--------------------------------------------------------------------------
                | Calculate subscription period
                |--------------------------------------------------------------------------
                */
                $startsAt = $now;

                $endsAt = null;

                if (
                    $payment->plan
                    ->billing_cycle ===
                    'monthly'
                ) {
                    $endsAt =
                        $now
                        ->copy()
                        ->addMonth();
                }

                if (
                    $payment->plan
                    ->billing_cycle ===
                    'yearly'
                ) {
                    $endsAt =
                        $now
                        ->copy()
                        ->addYear();
                }

                /*
                |--------------------------------------------------------------------------
                | Create active subscription
                |--------------------------------------------------------------------------
                */
                $subscription =
                    Subscription::create([
                        'user_id' =>
                        $seller->id,

                        'plan_id' =>
                        $payment->plan_id,

                        'status' =>
                        'active',

                        'starts_at' =>
                        $startsAt,

                        'ends_at' =>
                        $endsAt,

                        'trial_ends_at' =>
                        null,
                    ]);

                /*
                |--------------------------------------------------------------------------
                | Approve payment
                |--------------------------------------------------------------------------
                */
                $payment->update([
                    'status' =>
                    'approved',

                    'reviewed_by' =>
                    $request
                        ->user()
                        ->id,

                    'reviewed_at' =>
                    $now,
                ]);

                return response()->json([
                    'message' =>
                    'Subscription payment approved successfully.',

                    'payment' => [
                        'id' =>
                        $payment->id,

                        'status' =>
                        $payment->status,

                        'reviewed_at' =>
                        $payment->reviewed_at,
                    ],

                    'subscription' => [
                        'id' =>
                        $subscription->id,

                        'plan_id' =>
                        $subscription->plan_id,

                        'status' =>
                        $subscription->status,

                        'starts_at' =>
                        $subscription->starts_at,

                        'ends_at' =>
                        $subscription->ends_at,
                    ],
                ]);
            }
        );
    }


    /**
     * =========================================================
     * REJECT SUBSCRIPTION PAYMENT
     * =========================================================
     */
    public function reject(
        Request $request,
        $id
    ) {
        $validated =
            $request->validate([
                'rejection_reason' => [
                    'required',
                    'string',
                    'max:1000',
                ],
            ]);

        $payment =
            SubscriptionPayment::find($id);

        if (!$payment) {
            return response()->json([
                'message' =>
                'Subscription payment not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Only pending payments
        |--------------------------------------------------------------------------
        */
        if (
            $payment->status !==
            'pending'
        ) {
            return response()->json([
                'message' =>
                'Only pending payments can be rejected.',
            ], 422);
        }

        $payment->update([
            'status' =>
            'rejected',

            'rejection_reason' =>
            $validated['rejection_reason'],

            'reviewed_by' =>
            $request
                ->user()
                ->id,

            'reviewed_at' =>
            now(),
        ]);

        return response()->json([
            'message' =>
            'Subscription payment rejected successfully.',

            'payment' => [
                'id' =>
                $payment->id,

                'status' =>
                $payment->status,

                'rejection_reason' =>
                $payment->rejection_reason,

                'reviewed_at' =>
                $payment->reviewed_at,
            ],
        ]);
    }
}
