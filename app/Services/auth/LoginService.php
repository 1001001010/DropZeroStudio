<?php

namespace App\Services\auth;

use App\Mail\ToyVerificationCode;
use App\Models\{Toy, User};
use Illuminate\Support\Facades\{Auth, Hash, Mail, Redis};

class LoginService
{
    /**
     * Получение игрушки по её коду.
     *
     * @param string $code
     * @return Toy|null
     */
    private function findToy(string $code): ?Toy
    {
        return Toy::where('code', $code)->first();
    }

    /**
     * Проверка кода игрушки и определение режима авторизации.
     *
     * @param string $toyCode
     * @return array
     */
    public function checkToyCode(string $toyCode): array
    {
        $toy = $this->findToy($toyCode);

        if (!$toy) {
            return [
                'success' => false,
                'message' => 'Фигурка с таким кодом не найдена.',
                'status' => 404,
            ];
        }

        if ($toy->user_id !== null) {
            $this->sendLoginCode($toy);

            return [
                'success' => true,
                'mode' => 'login',
                'message' => 'Код для входа отправлен на email.',
            ];
        }

        return [
            'success' => true,
            'mode' => 'registration',
            'message' => 'Фигурка доступна для активации.',
        ];
    }

    /**
     * Проверка секретного ключа игрушки и отправка кода подтверждения.
     *
     * @param string $toyCode
     * @param string $email
     * @param string $secretKey
     * @return array
     */
    public function verify(
        string $toyCode,
        string $email,
        string $secretKey
    ): array {
        $toy = $this->findToy($toyCode);

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

        if (!Hash::check($secretKey, $toy->secret_hash)) {
            return $this->error(
                'Неверный секретный ключ.',
                422
            );
        }

        $this->saveActivationData(
            $email,
            $toyCode
        );

        $code = $this->generateCode();

        $this->saveActivationCode(
            $email,
            $code
        );

        $this->sendEmailCode(
            $email,
            $code
        );

        return $this->success(
            'Код подтверждения отправлен на email.'
        );
    }

    /**
     * Подтверждение email-кода и активация игрушки.
     *
     * @param string $email
     * @param string $code
     * @return array
     */
    public function confirm(
        string $email,
        string $code
    ): array {
        $savedCode = $this->getRedisCode(
            $this->activationCodeKey($email)
        );

        if (!$savedCode) {
            return $this->error(
                'Код истёк или не был отправлен.',
                422
            );
        }

        if (!hash_equals($savedCode, $code)) {
            return $this->error(
                'Неверный код подтверждения.',
                422
            );
        }

        $verification = $this->getActivationData($email);

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

        $user = $this->getOrCreateUser($email);

        $this->attachToyToUser($toy, $user);

        Auth::login($user);

        $this->forgetActivationData($email);

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

    /**
     * Отправка кода для входа по активированной игрушке.
     *
     * @param string $toyCode
     * @return array
     */
    public function sendToyLoginCode(string $toyCode): array
    {
        $toy = $this->findToy($toyCode);

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

    /**
     * Подтверждение кода входа по игрушке.
     *
     * @param string $toyCode
     * @param string $code
     * @return array
     */
    public function confirmToyLogin(
        string $toyCode,
        string $code
    ): array {
        $toy = $this->findToy($toyCode);

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

        if (!hash_equals($savedCode, $code)) {
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

    /**
     * Получение или создание пользователя по email.
     *
     * @param string $email
     * @return User
     */
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

    /**
     * Привязка игрушки к пользователю.
     *
     * @param Toy $toy
     * @param User $user
     * @return void
     */
    private function attachToyToUser(
        Toy $toy,
        User $user
    ): void {
        $toy->update([
            'user_id' => $user->id,
            'claimed_at' => now(),
        ]);
    }

    /**
     * Отправка кода подтверждения на email.
     *
     * @param string $email
     * @param string $code
     * @return void
     */
    private function sendEmailCode(
        string $email,
        string $code
    ): void {
        Mail::to($email)->send(
            new ToyVerificationCode($code)
        );
    }

    /**
     * Генерация и отправка кода для входа по игрушке.
     *
     * @param Toy $toy
     * @return void
     */
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

    /**
     * Генерация шестизначного кода.
     *
     * @return string
     */
    private function generateCode(): string
    {
        return (string) random_int(100000, 999999);
    }

    /**
     * Получение Redis-ключа кода активации.
     *
     * @param string $email
     * @return string
     */
    private function activationCodeKey(string $email): string
    {
        return "toy_verify:{$email}";
    }

    /**
     * Получение Redis-ключа данных активации.
     *
     * @param string $email
     * @return string
     */
    private function activationDataKey(string $email): string
    {
        return "toy_verify_data:{$email}";
    }

    /**
     * Получение Redis-ключа кода авторизации игрушки.
     *
     * @param int|string $toyId
     * @return string
     */
    private function loginCodeKey(int|string $toyId): string
    {
        return "toy_login:{$toyId}";
    }

    /**
     * Сохранение кода активации в Redis.
     *
     * @param string $email
     * @param string $code
     * @return void
     */
    private function saveActivationCode(
        string $email,
        string $code
    ): void {
        Redis::setex(
            $this->activationCodeKey($email),
            300,
            $code
        );
    }

    /**
     * Сохранение временных данных активации в Redis.
     *
     * @param string $email
     * @param string $toyCode
     * @return void
     */
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

    /**
     * Получение временных данных активации из Redis.
     *
     * @param string $email
     * @return array|null
     */
    private function getActivationData(string $email): ?array
    {
        $data = Redis::get(
            $this->activationDataKey($email)
        );

        if (!$data) {
            return null;
        }

        return json_decode($data, true);
    }

    /**
     * Получение кода из Redis.
     *
     * @param string $key
     * @return string|null
     */
    private function getRedisCode(string $key): ?string
    {
        $code = Redis::get($key);

        return $code !== null
            ? (string) $code
            : null;
    }

    /**
     * Удаление временных данных активации.
     *
     * @param string $email
     * @return void
     */
    private function forgetActivationData(string $email): void
    {
        Redis::del(
            $this->activationCodeKey($email)
        );

        Redis::del(
            $this->activationDataKey($email)
        );
    }

    /**
     * Формирование успешного результата операции.
     *
     * @param string $message
     * @param array $data
     * @return array
     */
    private function success(
        string $message,
        array $data = []
    ): array {
        return [
            'success' => true,
            'message' => $message,
            ...$data,
        ];
    }

    /**
     * Формирование результата с ошибкой.
     *
     * @param string $message
     * @param int $status
     * @return array
     */
    private function error(
        string $message,
        int $status
    ): array {
        return [
            'success' => false,
            'message' => $message,
            'status' => $status,
        ];
    }
}