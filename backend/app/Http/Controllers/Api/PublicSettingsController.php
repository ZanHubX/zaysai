<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;

class PublicSettingsController extends Controller
{
    public function contactAdmin()
    {
        $defaults = [
            'contact_platform' => 'Telegram',
            'contact_name' => '',
            'contact_username' => '',
            'contact_link' => '',
        ];

        $settings = Setting::whereIn('key', array_keys($defaults))
            ->pluck('value', 'key')
            ->toArray();

        $settings = array_merge($defaults, $settings);

        return response()->json([
            'settings' => [
                'contact_platform' => $settings['contact_platform'],
                'contact_name' => $settings['contact_name'],
                'contact_username' => $settings['contact_username'],
                'contact_link' => $settings['contact_link'],
            ],
        ]);
    }
}
