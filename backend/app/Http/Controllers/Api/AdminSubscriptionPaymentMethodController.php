<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminSubscriptionPaymentMethodController extends Controller
{
    /**
     * =========================================================
     * LIST PAYMENT METHODS
     * =========================================================
     */
    public function index(Request $request)
    {
        $paymentMethods = SubscriptionPaymentMethod::query()
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
                    'is_active' => (bool) $method->is_active,
                    'sort_order' => $method->sort_order,

                    'has_qr_image' => !empty($method->qr_image),

                    'created_at' => $method->created_at,
                    'updated_at' => $method->updated_at,
                ];
            });

        return response()->json([
            'payment_methods' => $paymentMethods,
            'total' => $paymentMethods->count(),
        ]);
    }


    /**
     * =========================================================
     * SHOW PAYMENT METHOD
     * =========================================================
     */
    public function show(Request $request, $id)
    {
        $method = SubscriptionPaymentMethod::find($id);

        if (!$method) {
            return response()->json([
                'message' => 'Subscription payment method not found.',
            ], 404);
        }

        return response()->json([
            'payment_method' => [
                'id' => $method->id,
                'name' => $method->name,
                'type' => $method->type,
                'account_name' => $method->account_name,
                'account_number' => $method->account_number,
                'instructions' => $method->instructions,
                'is_active' => (bool) $method->is_active,
                'sort_order' => $method->sort_order,
                'has_qr_image' => !empty($method->qr_image),
                'created_at' => $method->created_at,
                'updated_at' => $method->updated_at,
            ],
        ]);
    }


    /**
     * =========================================================
     * CREATE PAYMENT METHOD
     * =========================================================
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'type' => [
                'required',
                'string',
                'max:50',
            ],

            'account_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'account_number' => [
                'nullable',
                'string',
                'max:255',
            ],

            'qr_image' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'instructions' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],

            'sort_order' => [
                'nullable',
                'integer',
                'min:0',
            ],
        ]);

        $method = new SubscriptionPaymentMethod();

        $method->name = $validated['name'];
        $method->type = $validated['type'];
        $method->account_name =
            $validated['account_name'] ?? null;
        $method->account_number =
            $validated['account_number'] ?? null;
        $method->instructions =
            $validated['instructions'] ?? null;
        $method->is_active =
            $validated['is_active'] ?? true;
        $method->sort_order =
            $validated['sort_order'] ?? 0;

        /**
         * ---------------------------------------------------------
         * QR IMAGE
         * ---------------------------------------------------------
         */
        if ($request->hasFile('qr_image')) {
            $method->qr_image = $request
                ->file('qr_image')
                ->store(
                    'subscription-payment-methods',
                    'local'
                );
        }

        $method->save();

        return response()->json([
            'message' =>
            'Subscription payment method created successfully.',

            'payment_method' => [
                'id' => $method->id,
                'name' => $method->name,
                'type' => $method->type,
                'account_name' => $method->account_name,
                'account_number' => $method->account_number,
                'instructions' => $method->instructions,
                'is_active' => (bool) $method->is_active,
                'sort_order' => $method->sort_order,
                'has_qr_image' =>
                !empty($method->qr_image),
                'created_at' => $method->created_at,
                'updated_at' => $method->updated_at,
            ],
        ], 201);
    }


    /**
     * =========================================================
     * UPDATE PAYMENT METHOD
     * =========================================================
     */
    public function update(Request $request, $id)
    {
        $method = SubscriptionPaymentMethod::find($id);

        if (!$method) {
            return response()->json([
                'message' =>
                'Subscription payment method not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'type' => [
                'required',
                'string',
                'max:50',
            ],

            'account_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'account_number' => [
                'nullable',
                'string',
                'max:255',
            ],

            'qr_image' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'instructions' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],

            'sort_order' => [
                'nullable',
                'integer',
                'min:0',
            ],
        ]);

        $method->name = $validated['name'];
        $method->type = $validated['type'];
        $method->account_name =
            $validated['account_name'] ?? null;
        $method->account_number =
            $validated['account_number'] ?? null;
        $method->instructions =
            $validated['instructions'] ?? null;
        $method->is_active =
            $validated['is_active'] ?? $method->is_active;
        $method->sort_order =
            $validated['sort_order'] ?? $method->sort_order;

        /**
         * ---------------------------------------------------------
         * REPLACE QR IMAGE
         * ---------------------------------------------------------
         */
        if ($request->hasFile('qr_image')) {

            if (
                $method->qr_image &&
                Storage::disk('local')->exists(
                    $method->qr_image
                )
            ) {
                Storage::disk('local')->delete(
                    $method->qr_image
                );
            }

            $method->qr_image = $request
                ->file('qr_image')
                ->store(
                    'subscription-payment-methods',
                    'local'
                );
        }

        $method->save();

        return response()->json([
            'message' =>
            'Subscription payment method updated successfully.',

            'payment_method' => [
                'id' => $method->id,
                'name' => $method->name,
                'type' => $method->type,
                'account_name' => $method->account_name,
                'account_number' => $method->account_number,
                'instructions' => $method->instructions,
                'is_active' => (bool) $method->is_active,
                'sort_order' => $method->sort_order,
                'has_qr_image' =>
                !empty($method->qr_image),
                'created_at' => $method->created_at,
                'updated_at' => $method->updated_at,
            ],
        ]);
    }


    /**
     * =========================================================
     * DELETE PAYMENT METHOD
     * =========================================================
     */
    public function destroy(Request $request, $id)
    {
        $method = SubscriptionPaymentMethod::find($id);

        if (!$method) {
            return response()->json([
                'message' =>
                'Subscription payment method not found.',
            ], 404);
        }

        /**
         * ---------------------------------------------------------
         * DELETE QR IMAGE
         * ---------------------------------------------------------
         */
        if (
            $method->qr_image &&
            Storage::disk('local')->exists(
                $method->qr_image
            )
        ) {
            Storage::disk('local')->delete(
                $method->qr_image
            );
        }

        $method->delete();

        return response()->json([
            'message' =>
            'Subscription payment method deleted successfully.',
        ]);
    }


    /**
     * =========================================================
     * QR IMAGE
     * =========================================================
     */
    public function qrImage(Request $request, $id)
    {
        $method = SubscriptionPaymentMethod::find($id);

        if (!$method) {
            return response()->json([
                'message' =>
                'Subscription payment method not found.',
            ], 404);
        }

        if (!$method->qr_image) {
            return response()->json([
                'message' =>
                'QR image not found.',
            ], 404);
        }

        if (
            !Storage::disk('local')->exists(
                $method->qr_image
            )
        ) {
            return response()->json([
                'message' =>
                'QR image file not found.',
            ], 404);
        }

        return response()->file(
            Storage::disk('local')->path(
                $method->qr_image
            )
        );
    }
}
