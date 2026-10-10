<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MaintenanceMode
{
    /**
     * Handle an incoming request.
     */
    public function handle(
        Request $request,
        Closure $next
    ): Response {

        /*
        |--------------------------------------------------------------------------
        | Always Allow Admin Routes
        |--------------------------------------------------------------------------
        |
        | Admin must be able to enter Settings and turn
        | Maintenance Mode OFF.
        |
        */

        if (
            $request->is('api/admin') ||
            $request->is('api/admin/*')
        ) {
            return $next($request);
        }


        /*
        |--------------------------------------------------------------------------
        | Always Allow Maintenance Status Endpoint
        |--------------------------------------------------------------------------
        |
        | maintenance.html uses this endpoint to check
        | whether maintenance mode has been turned OFF.
        |
        */

        if (
            $request->is('api/maintenance-status')
        ) {
            return $next($request);
        }


        /*
        |--------------------------------------------------------------------------
        | Get Maintenance Setting
        |--------------------------------------------------------------------------
        */

        $maintenanceMode = Setting::where(
            'key',
            'maintenance_mode'
        )->value('value');


        /*
        |--------------------------------------------------------------------------
        | Convert Setting To Boolean
        |--------------------------------------------------------------------------
        */

        $isMaintenance = filter_var(
            $maintenanceMode,
            FILTER_VALIDATE_BOOLEAN
        );


        /*
        |--------------------------------------------------------------------------
        | Maintenance Enabled
        |--------------------------------------------------------------------------
        */

        if ($isMaintenance) {
            return response()->json([
                'message' =>
                'ZaySai is currently under maintenance.',

                'maintenance' => true,
            ], 503);
        }


        /*
        |--------------------------------------------------------------------------
        | Normal Mode
        |--------------------------------------------------------------------------
        */

        return $next($request);
    }
}
