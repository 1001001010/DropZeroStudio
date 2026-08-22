<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\{SecretVerifyRequest, VerifyToyCodeRequest};
use App\Models\Toy;
use Illuminate\Http\{JsonResponse, RedirectResponse, Request};
use Illuminate\Support\Facades\{Auth, Hash, Route};
use Inertia\{Inertia, Response};

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    public function code(VerifyToyCodeRequest $request): JsonResponse
    {
        $toy = Toy::where('code', $request->toy_code)->first();

        if (!$toy) {
            return response()->json([
                'success' => false,
                'message' => 'Фигурка с таким кодом не найдена.',
            ], 404);
        }

        if ($toy->status === 'activated') {
            return response()->json([
                'success' => false,
                'message' => 'Эта фигурка уже активирована.',
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Фигурка доступна для активации.',
        ]);
    }

    public function verify(SecretVerifyRequest $request): JsonResponse
    {
        $toy = Toy::where('code', $request->toy_code)->first();

        if (!$toy) {
            return response()->json([
                'success' => false,
                'message' => 'Фигурка с таким кодом не найдена.',
            ], 404);
        }

        if (!Hash::check($request->secret_key, $toy->secret_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'Неверный секретный ключ.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Секретный ключ верный.',
        ]);
    }
}
