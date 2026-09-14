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
    public function store(Request $request, string $slug)
    {
        $store = Store::where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'notes' => ['nullable', 'string'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $productIds = collect($validated['items'])
            ->pluck('product_id')
            ->unique();

        $products = $store->products()
            ->whereIn('id', $productIds)
            ->where('is_active', true)
            ->get()
            ->keyBy('id');

        if ($products->count() !== $productIds->count()) {
            throw ValidationException::withMessages([
                'items' => 'One or more products are invalid or unavailable.',
            ]);
        }

        $currency = $products->first()->currency;

        foreach ($products as $product) {
            if ($product->currency !== $currency) {
                throw ValidationException::withMessages([
                    'items' => 'Products with different currencies cannot be ordered together.',
                ]);
            }
        }

        $order = DB::transaction(function () use (
            $validated,
            $store,
            $products,
            $currency
        ) {
            $totalCents = 0;
            $items = [];

            foreach ($validated['items'] as $item) {
                $product = $products[$item['product_id']];
                $quantity = $item['quantity'];

                $priceCents = (int) round(((float) $product->price) * 100);
                $subtotalCents = $priceCents * $quantity;

                $totalCents += $subtotalCents;

                $items[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $priceCents / 100,
                    'quantity' => $quantity,
                    'subtotal' => $subtotalCents / 100,
                ];
            }

            do {
                $orderNumber =
                    'ZS-' .
                    now()->format('Ymd') .
                    '-' .
                    Str::upper(Str::random(6));
            } while (Order::where('order_number', $orderNumber)->exists());

            $order = Order::create([
                'store_id' => $store->id,
                'order_number' => $orderNumber,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'customer_email' => $validated['customer_email'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'total' => $totalCents / 100,
                'currency' => $currency,
                'status' => 'pending',
                'payment_status' => 'unpaid',
            ]);

            $order->items()->createMany($items);

            return $order;
        });

        return response()->json([
            'message' => 'Order placed successfully.',
            'order' => $order->load('items'),
        ], 201);
    }
}
