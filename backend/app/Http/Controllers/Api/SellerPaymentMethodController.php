<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;

class SellerPaymentMethodController extends Controller
{
    public function index(Request $request)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Store not found.',
            ], 404);
        }

        $paymentMethods = $store->paymentMethods()
            ->latest()
            ->get();

        return response()->json([
            'payment_methods' => $paymentMethods,
        ]);
    }

    public function store(Request $request)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Store not found.',
            ], 404);
        }

        $validated = $request->validate([
            'type' => [
                'required',
                'string',
                'in:kpay,wavepay,bank',
            ],
            'account_name' => [
                'required',
                'string',
                'max:120',
            ],
            'account_number' => [
                'required',
                'string',
                'max:100',
            ],
            'qr_image' => [
                'nullable',
                'string',
                'max:2048',
            ],
            'instructions' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'is_active' => [
                'boolean',
            ],
        ]);

        $paymentMethod = $store->paymentMethods()->create($validated);

        return response()->json([
            'message' => 'Payment method created successfully.',
            'payment_method' => $paymentMethod,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Store not found.',
            ], 404);
        }

        $paymentMethod = $store->paymentMethods()
            ->where('id', $id)
            ->first();

        if (!$paymentMethod) {
            return response()->json([
                'message' => 'Payment method not found.',
            ], 404);
        }

        return response()->json([
            'payment_method' => $paymentMethod,
        ]);
    }

    public function update(Request $request, $id)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Store not found.',
            ], 404);
        }

        $paymentMethod = $store->paymentMethods()
            ->where('id', $id)
            ->first();

        if (!$paymentMethod) {
            return response()->json([
                'message' => 'Payment method not found.',
            ], 404);
        }

        $validated = $request->validate([
            'type' => [
                'required',
                'string',
                'in:kpay,wavepay,bank',
            ],
            'account_name' => [
                'required',
                'string',
                'max:120',
            ],
            'account_number' => [
                'required',
                'string',
                'max:100',
            ],
            'qr_image' => [
                'nullable',
                'string',
                'max:2048',
            ],
            'instructions' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'is_active' => [
                'boolean',
            ],
        ]);

        $paymentMethod->update($validated);

        return response()->json([
            'message' => 'Payment method updated successfully.',
            'payment_method' => $paymentMethod->fresh(),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Store not found.',
            ], 404);
        }

        $paymentMethod = $store->paymentMethods()
            ->where('id', $id)
            ->first();

        if (!$paymentMethod) {
            return response()->json([
                'message' => 'Payment method not found.',
            ], 404);
        }

        $paymentMethod->delete();

        return response()->json([
            'message' => 'Payment method deleted successfully.',
        ]);
    }
}
