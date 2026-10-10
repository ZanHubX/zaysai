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

            'contact_platform' => [
                'required',
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

            'logo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Telegram Contact Link
        |--------------------------------------------------------------------------
        |
        | If the seller enters only a Telegram username, generate the
        | public Telegram URL automatically.
        |
        */

        $contactUsername = trim(
            $validated['contact_username'] ?? ''
        );

        if (
            $validated['contact_platform'] === 'Telegram' &&
            $contactUsername !== '' &&
            empty($validated['contact_link'])
        ) {
            $contactUsername = ltrim(
                $contactUsername,
                '@'
            );

            $validated['contact_username'] =
                '@' . $contactUsername;

            $validated['contact_link'] =
                'https://t.me/' . $contactUsername;
        }

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

            'contact_platform' =>
            $store->contact_platform,

            'contact_name' =>
            $store->contact_name,

            'contact_username' =>
            $store->contact_username,

            'contact_link' =>
            $store->contact_link,

            'logo' => $store->logo,
            'status' => $store->status,
            'created_at' => $store->created_at,
            'updated_at' => $store->updated_at,
        ];
    }
}
