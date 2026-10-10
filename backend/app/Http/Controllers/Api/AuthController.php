<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])
            ->with('store')
            ->first();

        /*
        |--------------------------------------------------------------------------
        | Check Credentials
        |--------------------------------------------------------------------------
        */

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Check Seller Account Status
        |--------------------------------------------------------------------------
        */

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => [
                    'Your seller account is inactive. Please contact ZaySai support.'
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Check Seller Store
        |--------------------------------------------------------------------------
        */

        if (!$user->store) {
            throw ValidationException::withMessages([
                'email' => [
                    'This account is not connected to a seller store.'
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Check Store Status
        |--------------------------------------------------------------------------
        */

        if ($user->store->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => [
                    'This store is currently inactive.'
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Remove Previous Tokens
        |--------------------------------------------------------------------------
        */

        $user->tokens()->delete();

        /*
        |--------------------------------------------------------------------------
        | Create New Seller Token
        |--------------------------------------------------------------------------
        */

        $token = $user
            ->createToken('seller-token')
            ->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',

            'token' => $token,

            'user' => $user,

            'store' => $user->store,
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => $user,
            'store' => $user->store,
        ]);
    }

    public function logout(Request $request)
    {
        $request
            ->user()
            ->currentAccessToken()
            ->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
