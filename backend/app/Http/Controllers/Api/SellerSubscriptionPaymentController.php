<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\SubscriptionPayment;
use App\Models\SubscriptionPaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SellerSubscriptionPaymentController extends Controller
{
    /**
     * =========================================================
     * LIST ACTIVE PLANS
     * =========================================================
     */
    public function plans(Request $request)
    {
        $plans = Plan::where('is_active', true)
            ->orderBy('price')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'slug' => $plan->slug,
                    'price' => $plan->price,
                    'currency' => $plan->currency,
                    'billing_cycle' => $plan->billing_cycle,
                    'max_products' => $plan->max_products,
                    'max_orders' => $plan->max_orders,
                    'custom_domain' => (bool) $plan->custom_domain,
                    'remove_branding' => (bool) $plan->remove_branding,
                    'advanced_analytics' => (bool) $plan->advanced_analytics,
                    'priority_support' => (bool) $plan->priority_support,
                ];
            });

        return response()->json([
            'plans' => $plans,
        ]);
    }


    /**
     * =========================================================
     * LIST ACTIVE SUBSCRIPTION PAYMENT METHODS
     * =========================================================
     */
    public function paymentMethods(Request $request)
    {
        $paymentMethods = SubscriptionPaymentMethod::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(function ($method) {
                return [
                    'id' => $method->id,
                    'name' => $method->name,
                    'type' => $method->type,
                    'account_name' => $method->account_name,
                    'account_number' => $method->account_number,
                    'instructions' => $method->instructions,
                    'has_qr_image' => !empty($method->qr_image),
                    'sort_order' => $method->sort_order,
                ];
            });

        return response()->json([
            'payment_methods' => $paymentMethods,
            'total' => $paymentMethods->count(),
        ]);
    }


    /**
     * =========================================================
     * VIEW SUBSCRIPTION PAYMENT METHOD QR
     * =========================================================
     */
    public function paymentMethodQr(
        Request $request,
        $id
    ) {
        $method = SubscriptionPaymentMethod::query()
            ->where('id', $id)
            ->where('is_active', true)
            ->first();

        if (!$method) {
            return response()->json([
                'message' =>
                'Subscription payment method not found.',
            ], 404);
        }

        if (!$method->qr_image) {
            return response()->json([
                'message' =>
                'QR image not available.',
            ], 404);
        }

        $disk = Storage::disk('local');

        if (!$disk->exists($method->qr_image)) {
            return response()->json([
                'message' =>
                'QR image file not found.',
            ], 404);
        }

        return response()->file(
            $disk->path($method->qr_image)
        );
    }


    /**
     * =========================================================
     * LIST SELLER SUBSCRIPTION PAYMENTS
     * =========================================================
     */
    public function index(Request $request)
    {
        $seller = $request->user();

        $payments = SubscriptionPayment::with('plan')
            ->where('user_id', $seller->id)
            ->latest()
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,

                    'plan' => $payment->plan
                        ? [
                            'id' => $payment->plan->id,
                            'name' => $payment->plan->name,
                            'price' => $payment->plan->price,
                            'currency' => $payment->plan->currency,
                            'billing_cycle' =>
                            $payment->plan->billing_cycle,
                        ]
                        : null,

                    'amount' => $payment->amount,

                    'currency' => $payment->currency,

                    'payment_method' =>
                    $payment->payment_method,

                    'transaction_reference' =>
                    $payment->transaction_reference,

                    'has_proof' =>
                    !empty($payment->payment_proof),

                    'status' =>
                    $payment->status,

                    'rejection_reason' =>
                    $payment->rejection_reason,

                    'reviewed_at' =>
                    $payment->reviewed_at,

                    'created_at' =>
                    $payment->created_at,

                    'updated_at' =>
                    $payment->updated_at,
                ];
            });

        return response()->json([
            'payments' => $payments,
            'total' => $payments->count(),
        ]);
    }


    /**
     * =========================================================
     * CREATE SUBSCRIPTION PAYMENT REQUEST
     * =========================================================
     */
    public function store(Request $request)
    {
        $seller = $request->user();

        $validated = $request->validate([
            'plan_id' => [
                'required',
                'integer',
                'exists:plans,id',
            ],

            'payment_method' => [
                'required',
                'string',
                'max:100',
            ],

            'transaction_reference' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Check Plan
        |--------------------------------------------------------------------------
        */

        $plan = Plan::where('id', $validated['plan_id'])
            ->where('is_active', true)
            ->first();

        if (!$plan) {
            return response()->json([
                'message' =>
                'Selected plan is not available.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Check Payment Method
        |--------------------------------------------------------------------------
        */

        $paymentMethod = SubscriptionPaymentMethod::query()
            ->where('id', $validated['payment_method'])
            ->where('is_active', true)
            ->first();

        if (!$paymentMethod) {
            return response()->json([
                'message' =>
                'Selected payment method is not available.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Prevent Duplicate Pending Payment
        |--------------------------------------------------------------------------
        */

        $existingPending = SubscriptionPayment::where(
            'user_id',
            $seller->id
        )
            ->where('status', 'pending')
            ->first();

        if ($existingPending) {
            return response()->json([
                'message' =>
                'You already have a pending subscription payment.',

                'payment' => [
                    'id' =>
                    $existingPending->id,

                    'status' =>
                    $existingPending->status,
                ],
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Create Payment Request
        |--------------------------------------------------------------------------
        */

        $payment = SubscriptionPayment::create([
            'user_id' =>
            $seller->id,

            'plan_id' =>
            $plan->id,

            'amount' =>
            $plan->price,

            'currency' =>
            $plan->currency,

            /*
            | Store the selected payment method ID
            | as a string because the existing
            | subscription_payments table uses
            | payment_method as a string field.
            */
            'payment_method' =>
            (string) $paymentMethod->id,

            'transaction_reference' =>
            $validated['transaction_reference'] ?? null,

            'status' =>
            'pending',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' =>
            'Subscription payment request created successfully.',

            'payment' => [
                'id' =>
                $payment->id,

                'plan' => [
                    'id' =>
                    $plan->id,

                    'name' =>
                    $plan->name,

                    'price' =>
                    $plan->price,

                    'currency' =>
                    $plan->currency,

                    'billing_cycle' =>
                    $plan->billing_cycle,
                ],

                'amount' =>
                $payment->amount,

                'currency' =>
                $payment->currency,

                'payment_method' => [
                    'id' =>
                    $paymentMethod->id,

                    'name' =>
                    $paymentMethod->name,

                    'type' =>
                    $paymentMethod->type,

                    'account_name' =>
                    $paymentMethod->account_name,

                    'account_number' =>
                    $paymentMethod->account_number,
                ],

                'transaction_reference' =>
                $payment->transaction_reference,

                'status' =>
                $payment->status,

                'created_at' =>
                $payment->created_at,
            ],
        ], 201);
    }


    /**
     * =========================================================
     * UPLOAD PAYMENT PROOF
     * =========================================================
     */
    public function uploadProof(
        Request $request,
        $id
    ) {
        $seller = $request->user();

        $payment = SubscriptionPayment::where(
            'id',
            $id
        )
            ->where(
                'user_id',
                $seller->id
            )
            ->first();

        if (!$payment) {
            return response()->json([
                'message' =>
                'Subscription payment not found.',
            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | Only Pending Payment Can Receive Proof
        |--------------------------------------------------------------------------
        */

        if ($payment->status !== 'pending') {
            return response()->json([
                'message' =>
                'Payment proof can only be uploaded for pending payments.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Validate Image
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'payment_proof' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | Delete Previous Proof
        |--------------------------------------------------------------------------
        */

        if ($payment->payment_proof) {

            $disk = Storage::disk('local');

            if ($disk->exists($payment->payment_proof)) {
                $disk->delete(
                    $payment->payment_proof
                );
            }
        }


        /*
        |--------------------------------------------------------------------------
        | Store New Proof
        |--------------------------------------------------------------------------
        */

        $path = $request
            ->file('payment_proof')
            ->store(
                'subscription-payment-proofs',
                'local'
            );


        /*
        |--------------------------------------------------------------------------
        | Save Path
        |--------------------------------------------------------------------------
        */

        $payment->update([
            'payment_proof' =>
            $path,
        ]);


        return response()->json([
            'message' =>
            'Payment proof uploaded successfully.',

            'payment' => [
                'id' =>
                $payment->id,

                'status' =>
                $payment->status,

                'has_proof' =>
                true,

                'updated_at' =>
                $payment->updated_at,
            ],
        ]);
    }


    /**
     * =========================================================
     * VIEW OWN PAYMENT PROOF
     * =========================================================
     */
    public function paymentProof(
        Request $request,
        $id
    ) {
        $seller = $request->user();

        $payment = SubscriptionPayment::where(
            'id',
            $id
        )
            ->where(
                'user_id',
                $seller->id
            )
            ->first();

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

        if (!$disk->exists($payment->payment_proof)) {
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
}
