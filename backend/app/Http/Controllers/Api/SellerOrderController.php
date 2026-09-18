<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SellerOrderController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Seller Orders
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $orders = $store->orders()
            ->with([
                'items',
                'paymentMethod',
            ])
            ->latest()
            ->paginate(20);

        return response()->json([
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
            ],
            'orders' => $orders,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Show Order
    |--------------------------------------------------------------------------
    */

    public function show(Request $request, int $id)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $order = $store->orders()
            ->with([
                'items',
                'paymentMethod',
            ])
            ->findOrFail($id);

        return response()->json([
            'order' => $order,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Payment Proof
    |--------------------------------------------------------------------------
    |
    | Seller can securely view the payment screenshot
    | belonging to an order from their own store.
    |
    */

    public function paymentProof(Request $request, int $id)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $order = $store->orders()
            ->where('id', $id)
            ->firstOrFail();

        if (!$order->payment_proof) {
            return response()->json([
                'message' => 'Payment proof not found.',
            ], 404);
        }

        $path = Storage::disk('local')
            ->path($order->payment_proof);

        if (!file_exists($path)) {
            return response()->json([
                'message' => 'Payment proof file not found.',
            ], 404);
        }

        return response()->file($path);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Order Status
    |--------------------------------------------------------------------------
    */

    public function updateStatus(Request $request, int $id)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                'in:pending,processing,completed,cancelled',
            ],
        ]);

        $order = $store->orders()
            ->findOrFail($id);

        $order->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Order status updated successfully.',

            'order' => $order->load([
                'items',
                'paymentMethod',
            ]),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Payment Status
    |--------------------------------------------------------------------------
    */

    public function updatePaymentStatus(
        Request $request,
        int $id
    ) {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $validated = $request->validate([
            'payment_status' => [
                'required',
                'in:unpaid,paid',
            ],
        ]);

        $order = $store->orders()
            ->findOrFail($id);

        $order->update([
            'payment_status' => $validated['payment_status'],
        ]);

        return response()->json([
            'message' => 'Payment status updated successfully.',

            'order' => $order->load([
                'items',
                'paymentMethod',
            ]),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Fulfillment Status
    |--------------------------------------------------------------------------
    |
    | Pending → Processing → Completed
    |
    */

    public function updateFulfillmentStatus(
        Request $request,
        int $id
    ) {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $validated = $request->validate([
            'fulfillment_status' => [
                'required',
                'in:pending,processing,completed',
            ],
        ]);

        $order = $store->orders()
            ->findOrFail($id);

        $order->update([
            'fulfillment_status' =>
            $validated['fulfillment_status'],
        ]);

        return response()->json([
            'message' =>
            'Fulfillment status updated successfully.',

            'order' => $order->load([
                'items',
                'paymentMethod',
            ]),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Fulfillment Details
    |--------------------------------------------------------------------------
    |
    | Seller can add:
    |
    | - Voucher
    | - Purchase Proof
    | - Admin Notes
    |
    */

    public function updateFulfillment(
        Request $request,
        int $id
    ) {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $validated = $request->validate([
            'voucher' => [
                'nullable',
                'string',
            ],

            'admin_notes' => [
                'nullable',
                'string',
            ],

            'purchase_proof' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $order = $store->orders()
            ->findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | Purchase Proof
        |--------------------------------------------------------------------------
        */

        $purchaseProofPath = $order->purchase_proof;

        if ($request->hasFile('purchase_proof')) {

            /*
            |--------------------------------------------------------------------------
            | Delete Old Purchase Proof
            |--------------------------------------------------------------------------
            */

            if ($purchaseProofPath) {
                Storage::disk('local')
                    ->delete($purchaseProofPath);
            }

            /*
            |--------------------------------------------------------------------------
            | Store New Purchase Proof
            |--------------------------------------------------------------------------
            */

            $purchaseProofPath =
                $request->file('purchase_proof')
                ->store('purchase-proofs', 'local');
        }

        /*
        |--------------------------------------------------------------------------
        | Update Fulfillment
        |--------------------------------------------------------------------------
        */

        $order->update([
            'voucher' =>
            $validated['voucher'] ?? $order->voucher,

            'purchase_proof' =>
            $purchaseProofPath,

            'admin_notes' =>
            $validated['admin_notes']
                ?? $order->admin_notes,
        ]);

        return response()->json([
            'message' =>
            'Fulfillment details updated successfully.',

            'order' => $order->load([
                'items',
                'paymentMethod',
            ]),
        ]);
    }
}
