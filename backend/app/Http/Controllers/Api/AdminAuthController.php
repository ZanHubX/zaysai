<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    /**
     * Admin Login
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => [
                'required',
                'email',
            ],
            'password' => [
                'required',
                'string',
            ],
        ]);

        $admin = Admin::where(
            'email',
            $validated['email']
        )->first();

        if (!$admin) {
            throw ValidationException::withMessages([
                'email' => [
                    'Invalid admin credentials.',
                ],
            ]);
        }

        if (!$admin->is_active) {
            throw ValidationException::withMessages([
                'email' => [
                    'This admin account is inactive.',
                ],
            ]);
        }

        if (!Hash::check(
            $validated['password'],
            $admin->password
        )) {
            throw ValidationException::withMessages([
                'email' => [
                    'Invalid admin credentials.',
                ],
            ]);
        }

        $token = $admin->createToken(
            'admin-token'
        )->plainTextToken;

        return response()->json([
            'message' => 'Admin login successful.',

            'token' => $token,

            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'is_active' => $admin->is_active,
            ],
        ]);
    }

    /**
     * Get authenticated admin
     */
    public function me(Request $request)
    {
        $admin = $request->user();

        return response()->json([
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'is_active' => $admin->is_active,
            ],
        ]);
    }

    /**
     * Admin Logout
     */
    public function logout(Request $request)
    {
        $request->user()
            ->currentAccessToken()
            ->delete();

        return response()->json([
            'message' => 'Admin logged out successfully.',
        ]);
    }
}
