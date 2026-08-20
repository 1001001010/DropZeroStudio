<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\VerifyToyCodeRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use App\Models\Toy;

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
}
