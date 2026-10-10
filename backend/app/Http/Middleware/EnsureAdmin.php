<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(
        Request $request,
        Closure $next
    ): Response {

        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | Must be authenticated
        |--------------------------------------------------------------------------
        */

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }


        /*
        |--------------------------------------------------------------------------
        | Must be Admin
        |--------------------------------------------------------------------------
        */

        if (!$user instanceof Admin) {
            return response()->json([
                'message' => 'Admin access required.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Admin must be active
        |--------------------------------------------------------------------------
        */

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Admin account is inactive.',
            ], 403);
        }


        return $next($request);
    }
}
