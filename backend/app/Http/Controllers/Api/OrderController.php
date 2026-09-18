<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Place Order
    |--------------------------------------------------------------------------
    */

    public function store(Request $request, string $slug)
    {
        /*
        |--------------------------------------------------------------------------
        | Find Active Store
        |--------------------------------------------------------------------------
        */

        $store = Store::where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | Validate Customer Order
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'customer_name' => [
                'required',
                'string',
                'max:255',
            ],

            'customer_phone' => [
                'required',
                'string',
                'max:30',
            ],

            'customer_email' => [
                'nullable',
                'email',
                'max:255',
            ],

            /*
            |--------------------------------------------------------------------------
            | Contact Account
            |--------------------------------------------------------------------------
            */

            'contact_platform' => [
                'nullable',
                'string',
                'max:50',
            ],

            'contact_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'contact_username' => [
                'nullable',
                'string',
                'max:255',
            ],

            'contact_link' => [
                'nullable',
                'url',
                'max:500',
            ],

            'notes' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Payment Method
            |--------------------------------------------------------------------------
            */

            'payment_method_id' => [
                'required',
                'integer',
            ],

            /*
            |--------------------------------------------------------------------------
            | Payment Screenshot
            |--------------------------------------------------------------------------
            */

            'payment_proof' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            /*
            |--------------------------------------------------------------------------
            | Products
            |--------------------------------------------------------------------------
            */

            'items' => [
                'required',
                'array',
                'min:1',
            ],

            'items.*.product_id' => [
                'required',
                'integer',
            ],

            'items.*.quantity' => [
                'required',
                'integer',
                'min:1',
                'max:99',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Validate Payment Method
        |--------------------------------------------------------------------------
        */

        $paymentMethod = $store->paymentMethods()
            ->where('id', $validated['payment_method_id'])
            ->where('is_active', true)
            ->first();

        if (!$paymentMethod) {
            throw ValidationException::withMessages([
                'payment_method_id' =>
                'The selected payment method is invalid or unavailable.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Get Products From This Store
        |--------------------------------------------------------------------------
        */

        $productIds = collect($validated['items'])
            ->pluck('product_id')
            ->unique();

        $products = $store->products()
            ->whereIn('id', $productIds)
            ->where('is_active', true)
            ->get()
            ->keyBy('id');

        /*
        |--------------------------------------------------------------------------
        | Validate Products
        |--------------------------------------------------------------------------
        */

        if ($products->count() !== $productIds->count()) {
            throw ValidationException::withMessages([
                'items' =>
                'One or more products are invalid or unavailable.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Currency
        |--------------------------------------------------------------------------
        */

        $currency = $products->first()->currency;

        foreach ($products as $product) {
            if ($product->currency !== $currency) {
                throw ValidationException::withMessages([
                    'items' =>
                    'Products with different currencies cannot be ordered together.',
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Create Order
        |--------------------------------------------------------------------------
        */

        $order = DB::transaction(function () use (
            $validated,
            $store,
            $products,
            $currency,
            $paymentMethod
        ) {
            $totalCents = 0;
            $items = [];

            /*
            |--------------------------------------------------------------------------
            | Calculate Total From Database Prices
            |--------------------------------------------------------------------------
            */

            foreach ($validated['items'] as $item) {
                $product = $products[$item['product_id']];

                $quantity = $item['quantity'];

                $priceCents = (int) round(
                    ((float) $product->price) * 100
                );

                $subtotalCents = $priceCents * $quantity;

                $totalCents += $subtotalCents;

                /*
                |--------------------------------------------------------------------------
                | Order Item Snapshot
                |--------------------------------------------------------------------------
                */

                $items[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $priceCents / 100,
                    'quantity' => $quantity,
                    'subtotal' => $subtotalCents / 100,
                ];
            }

            /*
            |--------------------------------------------------------------------------
            | Generate Unique Order Number
            |--------------------------------------------------------------------------
            */

            do {
                $orderNumber =
                    'ZS-' .
                    now()->format('Ymd') .
                    '-' .
                    Str::upper(
                        Str::random(6)
                    );
            } while (
                Order::where(
                    'order_number',
                    $orderNumber
                )->exists()
            );

            /*
            |--------------------------------------------------------------------------
            | Store Payment Screenshot
            |--------------------------------------------------------------------------
            */

            $paymentProofPath = $validated['payment_proof']
                ->store('payment-proofs', 'local');

            /*
            |--------------------------------------------------------------------------
            | Create Order
            |--------------------------------------------------------------------------
            */

            $order = Order::create([
                'store_id' =>
                $store->id,

                'payment_method_id' =>
                $paymentMethod->id,

                'payment_proof' =>
                $paymentProofPath,

                'order_number' =>
                $orderNumber,

                'customer_name' =>
                $validated['customer_name'],

                'customer_phone' =>
                $validated['customer_phone'],

                'customer_email' =>
                $validated['customer_email'] ?? null,

                /*
                |--------------------------------------------------------------------------
                | Contact Account
                |--------------------------------------------------------------------------
                */

                'contact_platform' =>
                $validated['contact_platform'] ?? null,

                'contact_name' =>
                $validated['contact_name'] ?? null,

                'contact_username' =>
                $validated['contact_username'] ?? null,

                'contact_link' =>
                $validated['contact_link'] ?? null,

                'notes' =>
                $validated['notes'] ?? null,

                'total' =>
                $totalCents / 100,

                'currency' =>
                $currency,

                'status' =>
                'pending',

                'payment_status' =>
                'unpaid',

                /*
                |--------------------------------------------------------------------------
                | Fulfillment
                |--------------------------------------------------------------------------
                */

                'fulfillment_type' =>
                'manual',

                'fulfillment_status' =>
                'pending',
            ]);

            /*
            |--------------------------------------------------------------------------
            | Create Order Items
            |--------------------------------------------------------------------------
            */

            $order->items()->createMany(
                $items
            );

            return $order;
        });

        /*
        |--------------------------------------------------------------------------
        | Return Order
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' =>
            'Order placed successfully.',

            'order' =>
            $order->load([
                'items',
                'paymentMethod',
            ]),
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Customer Order Tracking
    |--------------------------------------------------------------------------
    |
    | Customer can check an order using:
    |
    | Order Number + Customer Phone
    |
    */

    public function track(Request $request, string $orderNumber)
    {
        /*
        |--------------------------------------------------------------------------
        | Validate Customer Phone
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'phone' => [
                'required',
                'string',
                'max:30',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Find Order
        |--------------------------------------------------------------------------
        |
        | We match BOTH:
        |
        | 1. Order Number
        | 2. Customer Phone
        |
        | This prevents someone from accessing an order
        | with only the order number.
        |
        */

        $order = Order::where(
            'order_number',
            $orderNumber
        )
            ->where(
                'customer_phone',
                $validated['phone']
            )
            ->with([
                'items',
                'paymentMethod',
                'store',
            ])
            ->first();

        /*
        |--------------------------------------------------------------------------
        | Order Not Found
        |--------------------------------------------------------------------------
        */

        if (!$order) {
            return response()->json([
                'message' =>
                'Order not found. Please check your order number and phone number.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Customer Tracking Response
        |--------------------------------------------------------------------------
        |
        | Do NOT expose admin_notes to customers.
        |
        */

        return response()->json([
            'message' =>
            'Order found successfully.',

            'order' => [
                'id' =>
                $order->id,

                'order_number' =>
                $order->order_number,

                'store' => [
                    'id' =>
                    $order->store?->id,

                    'name' =>
                    $order->store?->name,

                    'slug' =>
                    $order->store?->slug,
                ],

                'customer_name' =>
                $order->customer_name,

                'total' =>
                $order->total,

                'currency' =>
                $order->currency,

                /*
                |--------------------------------------------------------------------------
                | Order Status
                |--------------------------------------------------------------------------
                */

                'status' =>
                $order->status,

                /*
                |--------------------------------------------------------------------------
                | Payment Status
                |--------------------------------------------------------------------------
                */

                'payment_status' =>
                $order->payment_status,

                /*
                |--------------------------------------------------------------------------
                | Fulfillment
                |--------------------------------------------------------------------------
                */

                'fulfillment_type' =>
                $order->fulfillment_type,

                'fulfillment_status' =>
                $order->fulfillment_status,

                'voucher' =>
                $order->voucher,

                'has_purchase_proof' =>
                !empty($order->purchase_proof),

                /*
                |--------------------------------------------------------------------------
                | Order Items
                |--------------------------------------------------------------------------
                */

                'items' =>
                $order->items,

                'created_at' =>
                $order->created_at,

                'updated_at' =>
                $order->updated_at,
            ],
        ]);
    }
}
