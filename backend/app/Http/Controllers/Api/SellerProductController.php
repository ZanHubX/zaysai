<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class SellerProductController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Product Image URL
    |--------------------------------------------------------------------------
    */

    private function imageUrl(?string $image): ?string
    {
        if (!$image) {
            return null;
        }

        if (
            str_starts_with($image, "http://") ||
            str_starts_with($image, "https://") ||
            str_starts_with($image, "data:")
        ) {
            return $image;
        }

        return url(Storage::url($image));
    }


    /*
    |--------------------------------------------------------------------------
    | List Products
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $user = $request->user();

        $store = $user->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Get Current Subscription
        |--------------------------------------------------------------------------
        */

        $subscription = Subscription::with('plan')
            ->where('user_id', $user->id)
            ->latest()
            ->first();

        /*
        |--------------------------------------------------------------------------
        | Product List
        |--------------------------------------------------------------------------
        */

        $products = $store->products()
            ->latest()
            ->paginate(20);

        $products->getCollection()->transform(
            function ($product) {
                $product->image =
                    $this->imageUrl($product->image);

                return $product;
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Subscription Information
        |--------------------------------------------------------------------------
        */

        $subscriptionData = null;

        if ($subscription && $subscription->plan) {
            $plan = $subscription->plan;

            $maxProducts = (int) $plan->max_products;

            $currentProductCount = $store->products()->count();

            $remainingProducts = $maxProducts > 0
                ? max(
                    0,
                    $maxProducts - $currentProductCount
                )
                : null;

            $limitReached = $maxProducts > 0
                ? $currentProductCount >= $maxProducts
                : false;

            $subscriptionData = [
                'id' => $subscription->id,

                'status' => $subscription->status,

                'starts_at' => $subscription->starts_at,

                'ends_at' => $subscription->ends_at,

                'trial_ends_at' => $subscription->trial_ends_at,

                'plan' => [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'slug' => $plan->slug,
                    'price' => $plan->price,
                    'currency' => $plan->currency,
                    'billing_cycle' => $plan->billing_cycle,

                    'max_products' => $maxProducts,

                    'max_orders' => $plan->max_orders,

                    'custom_domain' => (bool) $plan->custom_domain,

                    'remove_branding' =>
                    (bool) $plan->remove_branding,

                    'advanced_analytics' =>
                    (bool) $plan->advanced_analytics,

                    'priority_support' =>
                    (bool) $plan->priority_support,
                ],

                'current_products' => $currentProductCount,

                'remaining_products' => $remainingProducts,

                'limit_reached' => $limitReached,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
            ],

            'subscription' => $subscriptionData,

            'products' => $products,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Create Product
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $user = $request->user();

        $store = $user->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Get Current Subscription
        |--------------------------------------------------------------------------
        */

        $subscription = Subscription::with('plan')
            ->where('user_id', $user->id)
            ->latest()
            ->first();

        /*
        |--------------------------------------------------------------------------
        | Subscription Check
        |--------------------------------------------------------------------------
        */

        if (!$subscription) {
            return response()->json([
                'message' =>
                'You do not have an active subscription plan.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Check Subscription Status
        |--------------------------------------------------------------------------
        */

        if ($subscription->status !== 'active') {
            return response()->json([
                'message' =>
                'Your subscription is not active.',

                'subscription_status' =>
                $subscription->status,
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Check Subscription Expiry
        |--------------------------------------------------------------------------
        */

        if (
            $subscription->ends_at &&
            now()->greaterThan($subscription->ends_at)
        ) {
            return response()->json([
                'message' =>
                'Your subscription has expired.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Check Trial Expiry
        |--------------------------------------------------------------------------
        */

        if (
            $subscription->trial_ends_at &&
            now()->greaterThan(
                $subscription->trial_ends_at
            ) &&
            !$subscription->ends_at
        ) {
            return response()->json([
                'message' =>
                'Your trial period has expired.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Check Plan
        |--------------------------------------------------------------------------
        */

        $plan = $subscription->plan;

        if (!$plan) {
            return response()->json([
                'message' =>
                'Your subscription plan could not be found.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Product Limit
        |--------------------------------------------------------------------------
        */

        $maxProducts = (int) $plan->max_products;

        $currentProductCount =
            $store->products()->count();

        if (
            $maxProducts > 0 &&
            $currentProductCount >= $maxProducts
        ) {
            return response()->json([
                'message' =>
                'You have reached your product limit.',

                'current_products' =>
                $currentProductCount,

                'max_products' =>
                $maxProducts,

                'remaining_products' => 0,

                'plan' => [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'slug' => $plan->slug,
                ],
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Product
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'currency' => [
                'nullable',
                'string',
                'max:10',
            ],

            'image' => [
                'nullable',
                'string',
                'max:2048',
            ],

            'image_file' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp,gif',
                'max:5120',
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Generate Unique Slug
        |--------------------------------------------------------------------------
        */

        $baseSlug = Str::slug(
            $validated['name']
        );

        if ($baseSlug === '') {
            $baseSlug = 'product';
        }

        $slug = $baseSlug;

        $counter = 2;

        while (
            $store->products()
            ->where('slug', $slug)
            ->exists()
        ) {
            $slug =
                $baseSlug . '-' . $counter;

            $counter++;
        }

        /*
        |--------------------------------------------------------------------------
        | Upload Product Image
        |--------------------------------------------------------------------------
        */

        $image =
            $validated['image'] ?? null;

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')
                ->store('products', 'public');

            $image = url(Storage::url($path));
        }


        /*
        |--------------------------------------------------------------------------
        | Create Product
        |--------------------------------------------------------------------------
        */

        $product = $store->products()->create([
            'name' =>
            $validated['name'],

            'slug' =>
            $slug,

            'description' =>
            $validated['description'] ?? null,

            'price' =>
            $validated['price'],

            'currency' =>
            $validated['currency'] ?? 'MMK',

            'image' =>
            $image,

            'is_active' =>
            $validated['is_active'] ?? true,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Updated Product Count
        |--------------------------------------------------------------------------
        */

        $newProductCount =
            $currentProductCount + 1;

        $remainingProducts =
            $maxProducts > 0
            ? max(
                0,
                $maxProducts - $newProductCount
            )
            : null;

        /*
        |--------------------------------------------------------------------------
        | Success Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' =>
            'Product created successfully.',

            'product' =>
            $product,

            'subscription' => [
                'plan' =>
                $plan->name,

                'max_products' =>
                $maxProducts,

                'current_products' =>
                $newProductCount,

                'remaining_products' =>
                $remainingProducts,

                'limit_reached' =>
                $maxProducts > 0
                    ? $newProductCount >= $maxProducts
                    : false,
            ],
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | Show Product
    |--------------------------------------------------------------------------
    */

    public function show(
        Request $request,
        int $id
    ) {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' =>
                'Seller store not found.',
            ], 403);
        }

        $product = $store->products()
            ->findOrFail($id);

        $product->image =
            $this->imageUrl($product->image);

        return response()->json([
            'product' => $product,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Update Product
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        int $id
    ) {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' =>
                'Seller store not found.',
            ], 403);
        }

        $product = $store->products()
            ->findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | Validate
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'price' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
            ],

            'currency' => [
                'sometimes',
                'required',
                'string',
                'max:10',
            ],

            'image' => [
                'nullable',
                'string',
                'max:2048',
            ],

            'image_file' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp,gif',
                'max:5120',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Upload Replacement Image
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('image_file')) {
            $oldImage = $product->image;

            $path = $request->file('image_file')
                ->store('products', 'public');

            $validated['image'] =
                url(Storage::url($path));

            if ($oldImage) {
                $oldPath =
                    parse_url($oldImage, PHP_URL_PATH);

                if ($oldPath) {
                    $oldPath =
                        ltrim($oldPath, '/');

                    if (str_starts_with($oldPath, 'storage/')) {
                        $oldPath =
                            substr($oldPath, strlen('storage/'));

                        Storage::disk('public')
                            ->delete($oldPath);
                    }
                }
            }
        }

        unset($validated['image_file']);


        /*
        |--------------------------------------------------------------------------
        | Update Slug If Name Changed
        |--------------------------------------------------------------------------
        */

        if (
            isset($validated['name']) &&
            $validated['name'] !== $product->name
        ) {
            $baseSlug =
                Str::slug(
                    $validated['name']
                );

            if ($baseSlug === '') {
                $baseSlug = 'product';
            }

            $slug = $baseSlug;

            $counter = 2;

            while (
                $store->products()
                ->where('slug', $slug)
                ->where(
                    'id',
                    '!=',
                    $product->id
                )
                ->exists()
            ) {
                $slug =
                    $baseSlug . '-' . $counter;

                $counter++;
            }

            $validated['slug'] = $slug;
        }

        /*
        |--------------------------------------------------------------------------
        | Save
        |--------------------------------------------------------------------------
        */

        $product->update(
            $validated
        );

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        $freshProduct = $product->fresh();

        $freshProduct->image =
            $this->imageUrl($freshProduct->image);

        return response()->json([
            'message' =>
            'Product updated successfully.',

            'product' =>
            $freshProduct,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Delete Product
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        int $id
    ) {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' =>
                'Seller store not found.',
            ], 403);
        }

        $product = $store->products()
            ->findOrFail($id);

        if ($product->image) {
            $imagePath =
                parse_url($product->image, PHP_URL_PATH);

            if ($imagePath) {
                $imagePath =
                    ltrim($imagePath, '/');

                if (str_starts_with($imagePath, 'storage/')) {
                    $imagePath =
                        substr($imagePath, strlen('storage/'));

                    Storage::disk('public')
                        ->delete($imagePath);
                }
            }
        }

        $product->delete();

        return response()->json([
            'message' =>
            'Product deleted successfully.',
        ]);
    }
}
