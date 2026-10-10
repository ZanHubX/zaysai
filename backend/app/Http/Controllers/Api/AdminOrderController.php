<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminOrderController extends Controller
{
    /**
     * Display all orders across the ZaySai platform.
     */
    public function index(Request $request)
    {
        $orders = Order::with([
            'store',
            'paymentMethod',
            'items',
        ])
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,

                    'customer' => [
                        'name' => $order->customer_name,
                        'phone' => $order->customer_phone,
                        'email' => $order->customer_email,
                        'contact_platform' => $order->contact_platform,
                        'contact_name' => $order->contact_name,
                        'contact_username' => $order->contact_username,
                        'contact_link' => $order->contact_link,
                    ],

                    'store' => $order->store
                        ? [
                            'id' => $order->store->id,
                            'name' => $order->store->name,
                            'slug' => $order->store->slug,
                            'logo' => $order->store->logo,
                        ]
                        : null,

                    'payment_method' => $order->paymentMethod
                        ? [
                            'id' => $order->paymentMethod->id,
                            'name' => $order->paymentMethod->name,
                        ]
                        : null,

                    'items_count' => $order->items->sum('quantity'),

                    'total' => $order->total,
                    'currency' => $order->currency,

                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'fulfillment_status' => $order->fulfillment_status,

                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                ];
            });

        return response()->json([
            'orders' => $orders,
            'total' => $orders->count(),
        ]);
    }

    /**
     * Display a single order with complete details.
     */
    public function show(Request $request, $id)
    {
        $order = Order::with([
            'store',
            'paymentMethod',
            'items',
        ])->find($id);

        if (!$order) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);
        }

        return response()->json([
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,

                'customer' => [
                    'name' => $order->customer_name,
                    'phone' => $order->customer_phone,
                    'email' => $order->customer_email,
                    'contact_platform' => $order->contact_platform,
                    'contact_name' => $order->contact_name,
                    'contact_username' => $order->contact_username,
                    'contact_link' => $order->contact_link,
                ],

                'store' => $order->store
                    ? [
                        'id' => $order->store->id,
                        'name' => $order->store->name,
                        'slug' => $order->store->slug,
                        'logo' => $order->store->logo,
                    ]
                    : null,

                'payment_method' => $order->paymentMethod
                    ? [
                        'id' => $order->paymentMethod->id,
                        'name' => $order->paymentMethod->name,
                    ]
                    : null,

                'items' => $order->items,

                'payment_proof' => $order->payment_proof,

                'fulfillment_type' => $order->fulfillment_type,
                'fulfillment_status' => $order->fulfillment_status,
                'voucher' => $order->voucher,
                'purchase_proof' => $order->purchase_proof,

                'admin_notes' => $order->admin_notes,

                'total' => $order->total,
                'currency' => $order->currency,

                'status' => $order->status,
                'payment_status' => $order->payment_status,

                'notes' => $order->notes,

                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
            ],
        ]);
    }

    /**
     * Display payment proof for admin.
     */
    public function paymentProof(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);
        }

        if (!$order->payment_proof) {
            return response()->json([
                'message' => 'Payment proof not found.',
            ], 404);
        }

        $disk = Storage::disk('local');

        if (!$disk->exists($order->payment_proof)) {
            return response()->json([
                'message' => 'Payment proof file not found.',
            ], 404);
        }

        return response()->file(
            $disk->path($order->payment_proof)
        );
    }

    /**
     * Display purchase proof for admin.
     */
    public function purchaseProof(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);
        }

        if (!$order->purchase_proof) {
            return response()->json([
                'message' => 'Purchase proof not found.',
            ], 404);
        }

        $disk = Storage::disk('local');

        if (!$disk->exists($order->purchase_proof)) {
            return response()->json([
                'message' => 'Purchase proof file not found.',
            ], 404);
        }

        return response()->file(
            $disk->path($order->purchase_proof)
        );
    }
}
