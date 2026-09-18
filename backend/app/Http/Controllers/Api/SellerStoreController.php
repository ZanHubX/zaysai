<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class SellerStoreController extends Controller
{
    public function show(Request $request)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Store not found.',
            ], 404);
        }

        return response()->json([
            'store' => $this->formatStore($store),
        ]);
    }

    public function update(Request $request)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'message' => 'Store not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:120',
            ],

            'slug' => [
                'required',
                'string',
                'max:120',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('stores', 'slug')
                    ->ignore($store->id),
            ],

            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'logo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Store Logo
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('logo')) {

            // Delete old logo if it was uploaded by ZaySai
            if (
                $store->logo &&
                str_starts_with(
                    $store->logo,
                    '/storage/store-logos/'
                )
            ) {
                $oldPath = str_replace(
                    '/storage/',
                    '',
                    $store->logo
                );

                Storage::disk('public')->delete(
                    $oldPath
                );
            }

            // Store new logo
            $logoPath = $request->file('logo')
                ->store('store-logos', 'public');

            $validated['logo'] = asset(
                'storage/' . $logoPath
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Update Store
        |--------------------------------------------------------------------------
        */

        $store->update($validated);

        return response()->json([
            'message' => 'Store updated successfully.',
            'store' => $this->formatStore(
                $store->fresh()
            ),
        ]);
    }

    private function formatStore($store)
    {
        return [
            'id' => $store->id,
            'user_id' => $store->user_id,
            'name' => $store->name,
            'slug' => $store->slug,
            'description' => $store->description,
            'phone' => $store->phone,
            'logo' => $store->logo,
            'status' => $store->status,
            'created_at' => $store->created_at,
            'updated_at' => $store->updated_at,
        ];
    }
}
