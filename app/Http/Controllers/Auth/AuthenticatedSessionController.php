<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\{
    EmailCodeRequest,
    SecretVerifyRequest,
    ToyLoginCodeRequest,
    VerifyToyCodeRequest
};
use App\Services\auth\LoginService;
use Illuminate\Http\{
    JsonResponse,
    RedirectResponse,
    Request
};
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthenticatedSessionController extends Controller
{
    public function __construct(
        protected LoginService $toyRegistrationService
    ) {
    }

    /**
     * Отображение страницы авторизации.
     *
     * @return \Inertia\Response|RedirectResponse
     */
    public function login()
    {
        if (!Auth::check()) {
            return Inertia::render('auth/login');
        }

        $toyCode = session('toy_code');

        if (!$toyCode) {
            return Inertia::render('auth/login');
        }

        return redirect("/toy/{$toyCode}");
    }

    /**
     * Выход пользователя из аккаунта.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect(route('home'));
    }

    /**
     * Проверка кода игрушки и определение способа авторизации.
     *
     * @param VerifyToyCodeRequest $request
     * @return JsonResponse
     */
    public function code(VerifyToyCodeRequest $request): JsonResponse
    {
        $result = $this->toyRegistrationService->checkToyCode(
            $request->validated('toy_code')
        );

        return response()->json(
            $result,
            $result['status'] ?? 200
        );
    }

    /**
     * Проверка секретного ключа и отправка кода подтверждения.
     *
     * @param SecretVerifyRequest $request
     * @return JsonResponse
     */
    public function verify(SecretVerifyRequest $request): JsonResponse
    {
        $result = $this->toyRegistrationService->verify(
            $request->validated('toy_code'),
            $request->validated('email'),
            $request->validated('secret_key')
        );

        return response()->json(
            $result,
            $result['status'] ?? 200
        );
    }

    /**
     * Подтверждение кода активации игрушки.
     *
     * @param EmailCodeRequest $request
     * @return JsonResponse
     */
    public function confirm(EmailCodeRequest $request): JsonResponse
    {
        $result = $this->toyRegistrationService->confirm(
            $request->validated('email'),
            $request->validated('code')
        );

        if ($result['success']) {
            $request->session()->regenerate();

            $request->session()->put(
                'toy_code',
                $result['toy']['code']
            );
        }

        return response()->json(
            $result,
            $result['status'] ?? 200
        );
    }

    /**
     * Отправка кода для входа по активированной игрушке.
     *
     * @param ToyLoginCodeRequest $request
     * @return JsonResponse
     */
    public function toyLoginCode(
        ToyLoginCodeRequest $request
    ): JsonResponse {
        $result = $this->toyRegistrationService->sendToyLoginCode(
            $request->validated('toy_code')
        );

        return response()->json(
            $result,
            $result['status'] ?? 200
        );
    }

    /**
     * Подтверждение кода входа по игрушке.
     *
     * @param ToyLoginCodeRequest $request
     * @return JsonResponse
     */
    public function confirmToyLogin(
        ToyLoginCodeRequest $request
    ): JsonResponse {
        $result = $this->toyRegistrationService->confirmToyLogin(
            $request->validated('toy_code'),
            $request->validated('code')
        );

        if ($result['success']) {
            $request->session()->regenerate();

            $request->session()->put(
                'toy_code',
                $result['toy']['code']
            );
        }

        return response()->json(
            $result,
            $result['status'] ?? 200
        );
    }
}
