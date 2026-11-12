<?php

namespace App\Services\auth;

use App\Mail\ToyVerificationCode;
use App\Models\{Toy, User};
use Illuminate\Support\Facades\{Auth, Hash, Mail, Redis};
use App\Models\UserConsent;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
        string $code,
        bool $personalDataConsent,
        bool $termsAccepted,
        ?string $ipAddress = null,
        ?string $userAgent = null
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

        if (!$personalDataConsent || !$termsAccepted) {
            return $this->error(
                'Для регистрации необходимо принять обязательные документы.',
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

        try {
            $result = DB::transaction(function () use ($email, $toyCode, $ipAddress, $userAgent) {
                // Блокируем фигурку, чтобы исключить одновременную активацию.
                $toy = Toy::where('code', $toyCode)
                    ->lockForUpdate()
                    ->first();

                if (!$toy) {
                    throw ValidationException::withMessages([
                        'toy_code' => 'Игрушка с таким кодом не найдена.',
                    ]);
                }

                if ($toy->user_id !== null) {
                    throw ValidationException::withMessages([
                        'toy_code' => 'Эта игрушка уже привязана к пользователю.',
                    ]);
                }

                // Получаем опубликованные текущие редакции документов.
                $documentVersions = DB::table('legal_documents as documents')
                    ->join(
                        'legal_document_versions as versions',
                        'versions.id',
                        '=',
                        'documents.current_version_id'
                    )
                    ->whereIn('documents.slug', [
                        'personal-data-consent',
                        'terms',
                    ])
                    ->where('documents.is_active', true)
                    ->where('versions.status', 'published')
                    ->whereNotNull('versions.published_at')
                    ->select([
                        'documents.slug',
                        'versions.id',
                    ])
                    ->get()
                    ->keyBy('slug');

                $personalDataVersion = $documentVersions->get(
                    'personal-data-consent'
                );

                $termsVersion = $documentVersions->get('terms');

                if (!$personalDataVersion || !$termsVersion) {
                    throw ValidationException::withMessages([
                        'documents' => 'Не удалось найти опубликованные редакции обязательных документов.',
                    ]);
                }

                // Создаём пользователя.
                $user = $this->getOrCreateUser($email);

                // Привязываем фигурку.
                $this->attachToyToUser($toy, $user);

                // Сохраняем согласие на обработку персональных данных.
                UserConsent::create([
                    'user_id' => $user->id,
                    'document_version_id' => $personalDataVersion->id,
                    'source' => 'registration',
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent,
                    'accepted_at' => now(),
                ]);

                // Сохраняем принятие пользовательского соглашения.
                UserConsent::create([
                    'user_id' => $user->id,
                    'document_version_id' => $termsVersion->id,
                    'source' => 'registration',
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent,
                    'accepted_at' => now(),
                ]);

                return [
                    'user' => $user,
                    'toy' => [
                        'code' => $toy->code,
                        'number' => $toy->number,
                    ],
                ];
            });

            // Авторизуем только после успешного завершения транзакции.
            Auth::login($result['user']);

            // Удаляем временные данные регистрации.
            $this->forgetActivationData($email);

            return $this->success(
                'Email успешно подтверждён. Игрушка привязана к вашему аккаунту.',
                [
                    'toy' => $result['toy'],
                ]
            );
        } catch (ValidationException $exception) {
            return $this->error(
                collect($exception->errors())->flatten()->first()
                ?? 'Не удалось завершить регистрацию.',
                422
            );
        }
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