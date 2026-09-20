<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class AdminSettingsController extends Controller
{
    public function index(Request $request)
    {
        $defaults = [
            'platform_name' => 'ZaySai',
            'platform_description' => 'Digital Seller Storefront Platform',
            'support_email' => '',
            'support_telegram' => '',
            'currency' => 'MMK',
            'seller_registration' => 'true',
            'maintenance_mode' => 'false',
        ];

        $settings = Setting::whereIn('key', array_keys($defaults))
            ->pluck('value', 'key')
            ->toArray();

        $settings = array_merge($defaults, $settings);

        return response()->json([
            'settings' => [
                'platform_name' => $settings['platform_name'],
                'platform_description' => $settings['platform_description'],
                'support_email' => $settings['support_email'],
                'support_telegram' => $settings['support_telegram'],
                'currency' => $settings['currency'],
                'seller_registration' =>
                filter_var(
                    $settings['seller_registration'],
                    FILTER_VALIDATE_BOOLEAN
                ),
                'maintenance_mode' =>
                filter_var(
                    $settings['maintenance_mode'],
                    FILTER_VALIDATE_BOOLEAN
                ),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'platform_name' => [
                'required',
                'string',
                'max:100',
            ],

            'platform_description' => [
                'nullable',
                'string',
                'max:500',
            ],

            'support_email' => [
                'nullable',
                'email',
                'max:150',
            ],

            'support_telegram' => [
                'nullable',
                'string',
                'max:150',
            ],

            'currency' => [
                'required',
                'string',
                'max:10',
            ],

            'seller_registration' => [
                'required',
                'boolean',
            ],

            'maintenance_mode' => [
                'required',
                'boolean',
            ],
        ]);

        $settings = [
            'platform_name' => $validated['platform_name'],
            'platform_description' =>
            $validated['platform_description'] ?? '',
            'support_email' =>
            $validated['support_email'] ?? '',
            'support_telegram' =>
            $validated['support_telegram'] ?? '',
            'currency' => $validated['currency'],
            'seller_registration' =>
            $validated['seller_registration']
                ? 'true'
                : 'false',
            'maintenance_mode' =>
            $validated['maintenance_mode']
                ? 'true'
                : 'false',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return response()->json([
            'message' => 'Settings updated successfully.',
            'settings' => [
                'platform_name' => $settings['platform_name'],
                'platform_description' =>
                $settings['platform_description'],
                'support_email' =>
                $settings['support_email'],
                'support_telegram' =>
                $settings['support_telegram'],
                'currency' => $settings['currency'],
                'seller_registration' =>
                $validated['seller_registration'],
                'maintenance_mode' =>
                $validated['maintenance_mode'],
            ],
        ]);
    }
}
