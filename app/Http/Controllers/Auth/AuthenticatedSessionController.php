<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\SecretVerifyRequest;
use App\Http\Requests\VerifyToyCodeRequest;
use App\Http\Requests\EmailCodeRequest;
use App\Http\Requests\ToyLoginCodeRequest;
use App\Models\Toy;
use App\Models\User;
use App\Mail\ToyVerificationCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redis;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
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
    // Получение кода от пользователя
    public function code(VerifyToyCodeRequest $request): JsonResponse
    {
        $toy = Toy::where('code', $request->toy_code)->first();

        if (!$toy) {
            return response()->json([
                'success' => false,
                'message' => 'Фигурка с таким кодом не найдена.',
            ], 404);
        }

        if ($toy->user_id !== null) {
            $this->sendLoginCode($toy);

            return response()->json([
                'success' => true,
                'mode' => 'login',
                'message' => 'Код для входа отправлен на email.',
            ]);
        }

        return response()->json([
            'success' => true,
            'mode' => 'registration',
            'message' => 'Фигурка доступна для активации.',
        ]);
    }

    // Отправвляем код на почту для привзяки пользователя к игрушке
    public function verify(SecretVerifyRequest $request): JsonResponse
    {
        $toy = $this->findToy($request->toy_code);

        if (!$toy) {
            return $this->error(
                'Фигурка с таким кодом не найдена.',
                404
            );
        }

        if ($toy->user_id !== null) {
            return $this->error(
                'Эта фигурка уже активирована.',
                409
            );
        }

        if (!Hash::check($request->secret_key, $toy->secret_hash)) {
            return $this->error(
                'Неверный секретный ключ.',
                422
            );
        }

        $this->saveActivationData(
            $request->email,
            $request->toy_code
        );

        $this->sendEmailCode(
            $request->email,
            $this->getActivationCode($request->email)
        );

        return $this->success(
            'Код подтверждения отправлен на email.'
        );
    }

    public function confirm(
        EmailCodeRequest $request
    ): JsonResponse {
        $savedCode = $this->getRedisCode(
            $this->activationCodeKey($request->email)
        );

        if (!$savedCode) {
            return $this->error(
                'Код истёк или не был отправлен.',
                422
            );
        }

        if (!hash_equals($savedCode, $request->code)) {
            return $this->error(
                'Неверный код подтверждения.',
                422
            );
        }

        $verification = $this->getActivationData(
            $request->email
        );

        if (!$verification) {
            return $this->error(
                'Данные активации истекли. Начните регистрацию заново.',
                422
            );
        }

        $toyCode = $verification['toy_code'] ?? null;

        if (!$toyCode) {
            return $this->error(
                'Не удалось определить игрушку.',
                422
            );
        }

        $toy = $this->findToy($toyCode);

        if (!$toy) {
            return $this->error(
                'Игрушка с таким кодом не найдена.',
                404
            );
        }

        if ($toy->user_id !== null) {
            return $this->error(
                'Эта игрушка уже привязана к пользователю.',
                409
            );
        }

        $user = $this->getOrCreateUser($request->email);

        $this->attachToyToUser($toy, $user);

        Auth::login($user);

        $request->session()->regenerate();

        $this->forgetActivationData($request->email);

        return $this->success(
            'Email успешно подтверждён. Игрушка привязана к вашему аккаунту.',
            [
                'toy' => [
                    'code' => $toy->code,
                    'number' => $toy->number,
                ],
            ]
        );
    }

    public function toyLoginCode(
        ToyLoginCodeRequest $request
    ): JsonResponse {
        $toy = $this->findToy($request->toy_code);

        if (!$toy) {
            return $this->error(
                'Фигурка с таким кодом не найдена.',
                404
            );
        }

        if ($toy->user_id === null) {
            return $this->error(
                'Эта фигурка ещё не активирована.',
                409
            );
        }

        $this->sendLoginCode($toy);

        return $this->success(
            'Код для входа отправлен на email.'
        );
    }

    public function confirmToyLogin(
        ToyLoginCodeRequest $request
    ): JsonResponse {
        $toy = $this->findToy($request->toy_code);

        if (!$toy) {
            return $this->error(
                'Фигурка с таким кодом не найдена.',
                404
            );
        }

        if ($toy->user_id === null) {
            return $this->error(
                'Эта фигурка ещё не активирована.',
                409
            );
        }

        $key = $this->loginCodeKey($toy->id);

        $savedCode = $this->getRedisCode($key);

        if (!$savedCode) {
            return $this->error(
                'Код истёк или не был отправлен.',
                422
            );
        }

        if (!hash_equals($savedCode, $request->code)) {
            return $this->error(
                'Неверный код подтверждения.',
                422
            );
        }

        $user = User::find($toy->user_id);

        if (!$user) {
            return $this->error(
                'Пользователь фигурки не найден.',
                404
            );
        }

        Auth::login($user);

        $request->session()->regenerate();

        $request->session()->put('toy_code', $toy->code);

        Redis::del($key);

        return $this->success(
            'Вход выполнен успешно.',
            [
                'toy' => [
                    'code' => $toy->code,
                    'number' => $toy->number,
                ],
            ]
        );
    }

    private function findToy(string $code): ?Toy
    {
        return Toy::where('code', $code)->first();
    }

    private function getOrCreateUser(string $email): User
    {
        $user = User::firstOrCreate(
            ['email' => $email],
            ['email_verified_at' => now()]
        );

        if (!$user->email_verified_at) {
            $user->update([
                'email_verified_at' => now(),
            ]);
        }

        return $user;
    }

    private function attachToyToUser(
        Toy $toy,
        User $user
    ): void {
        $toy->update([
            'user_id' => $user->id,
            'claimed_at' => now(),
        ]);
    }

    private function sendEmailCode(
        string $email,
        string $code
    ): void {
        Mail::to($email)->send(
            new ToyVerificationCode($code)
        );
    }

    private function sendLoginCode(Toy $toy): void
    {
        $code = $this->generateCode();

        Redis::setex(
            $this->loginCodeKey($toy->id),
            300,
            $code
        );

        $this->sendEmailCode(
            $toy->user->email,
            $code
        );
    }

    private function generateCode(): string
    {
        return (string) random_int(100000, 999999);
    }

    private function activationCodeKey(string $email): string
    {
        return "toy_verify:{$email}";
    }

    private function activationDataKey(string $email): string
    {
        return "toy_verify_data:{$email}";
    }

    private function loginCodeKey(int|string $toyId): string
    {
        return "toy_login:{$toyId}";
    }

    private function saveActivationData(
        string $email,
        string $toyCode
    ): void {
        Redis::setex(
            $this->activationDataKey($email),
            300,
            json_encode([
                'toy_code' => $toyCode,
            ])
        );
    }

    private function getActivationData(
        string $email
    ): ?array {
        $data = Redis::get(
            $this->activationDataKey($email)
        );

        if (!$data) {
            return null;
        }

        return json_decode($data, true);
    }

    private function getActivationCode(
        string $email
    ): string {
        $code = $this->generateCode();

        Redis::setex(
            $this->activationCodeKey($email),
            300,
            $code
        );

        return $code;
    }

    private function getRedisCode(string $key): ?string
    {
        $code = Redis::get($key);

        return $code !== null
            ? (string) $code
            : null;
    }

    private function forgetActivationData(string $email): void
    {
        Redis::del(
            $this->activationCodeKey($email)
        );

        Redis::del(
            $this->activationDataKey($email)
        );
    }

    private function success(
        string $message,
        array $data = []
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            ...$data,
        ]);
    }

    private function error(
        string $message,
        int $status
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], $status);
    }
}
