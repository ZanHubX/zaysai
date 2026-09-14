<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SellerProductController extends Controller
{
    public function index(Request $request)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $products = $store->products()
            ->latest()
            ->paginate(20);

        return response()->json([
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
            ],
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'image' => ['nullable', 'string', 'max:2048'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $baseSlug = Str::slug($validated['name']);

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
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        $product = $store->products()->create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'currency' => $validated['currency'] ?? 'MMK',
            'image' => $validated['image'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Product created successfully.',
            'product' => $product,
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $product = $store->products()
            ->findOrFail($id);

        return response()->json([
            'product' => $product,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $product = $store->products()
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'required', 'string', 'max:10'],
            'image' => ['nullable', 'string', 'max:2048'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['name']) && $validated['name'] !== $product->name) {
            $baseSlug = Str::slug($validated['name']);

            if ($baseSlug === '') {
                $baseSlug = 'product';
            }

            $slug = $baseSlug;
            $counter = 2;

            while (
                $store->products()
                ->where('slug', $slug)
                ->where('id', '!=', $product->id)
                ->exists()
            ) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }

            $validated['slug'] = $slug;
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully.',
            'product' => $product->fresh(),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Seller store not found.',
            ], 403);
        }

        $product = $store->products()
            ->findOrFail($id);

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }
}
