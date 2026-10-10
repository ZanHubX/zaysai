<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;

class MaintenanceStatusController extends Controller
{
    /**
     * Get current maintenance status.
     */
    public function index()
    {
        $value = Setting::where(
            'key',
            'maintenance_mode'
        )->value('value');

        $maintenance = filter_var(
            $value,
            FILTER_VALIDATE_BOOLEAN
        );

        return response()->json([
            'maintenance' => $maintenance,
        ]);
    }
}
