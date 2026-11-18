<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSkinRequest;
use App\Http\Requests\UpdateSkinRequest;
use App\Models\Drop;
use App\Models\Skin;
use App\Services\Skin\SkinService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SkinController extends Controller
{
    /**
     * Создаёт экземпляр контроллера и внедряет сервис управления скинами.
     *
     * SkinService отвечает за бизнес-логику создания и обновления скинов,
     * включая сохранение файлов моделей и изображений.
     *
     * @param SkinService $skinService Сервис для управления скинами.
     */
    public function __construct(
        private readonly SkinService $skinService,
    ) {
    }

    /**
     * Отображает страницу управления скинами в административной панели.
     *
     * Перед получением данных проверяется право пользователя на просмотр
     * списка скинов. Затем загружаются:
     *
     * - Все скины, включая записи, находящиеся в корзине.
     * - Связанные с каждым скином коллекции Drops.
     * - Список Drops с предварительно загруженными связанными скинами.
     * - Статистика по общему количеству, активности и удалённым скинам.
     *
     * Статистические показатели рассчитываются непосредственно средствами
     * базы данных, чтобы не загружать все записи для подсчёта в PHP.
     *
     * @return Response Inertia-ответ со страницей admin/skins/index
     *                   и данными для её отображения.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     *         Если у пользователя отсутствуют права на просмотр списка.
     */
    public function index(): Response
    {
        // Проверяем разрешение на просмотр списка скинов.
        $this->authorize('viewAny', Skin::class);

        // Загружаем все скины, включая мягко удалённые записи,
        // вместе со связанными коллекциями Drops.
        $skins = Skin::withTrashed()
            ->with('drops')
            ->orderBy('name')
            ->get();

        // Рассчитываем статистику непосредственно в базе данных.
        $stats = [
            'total' => Skin::count(),
            'active' => Skin::where('is_active', true)->count(),
            'inactive' => Skin::where('is_active', false)->count(),
            'deleted' => Skin::onlyTrashed()->count(),
        ];

        return Inertia::render('admin/skins/index', [
            'skins' => $skins,
            'drops' => Drop::with('skin')
                ->latest()
                ->get(),
            'stats' => $stats,
        ]);
    }

    /**
     * Создаёт новый скин на основании проверенных входных данных.
     *
     * Перед выполнением операции проверяется право пользователя
     * на создание скинов. Валидация входных данных выполняется
     * классом StoreSkinRequest.
     *
     * Создание записи и сохранение связанных файлов делегируются
     * SkinService, чтобы не размещать бизнес-логику в контроллере.
     *
     * @param StoreSkinRequest $request HTTP-запрос с валидированными
     *                                  данными нового скина.
     *
     * @return RedirectResponse Перенаправление на страницу списка скинов
     *                          с сообщением об успешном создании.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     *         Если пользователь не имеет права создавать скины.
     * @throws \Throwable Если во время создания скина произошла ошибка.
     */
    public function store(StoreSkinRequest $request): RedirectResponse
    {
        // Проверяем разрешение на создание нового скина.
        $this->authorize('create', Skin::class);

        // Передаём проверенные данные сервису управления скинами.
        $this->skinService->create($request->validated());

        return to_route('admin.skins.index')
            ->with('success', 'Скин успешно создан.');
    }

    /**
     * Обновляет существующий скин на основании проверенных входных данных.
     *
     * Скин определяется автоматически через неявное связывание
     * параметров маршрута (Route Model Binding).
     *
     * Перед обновлением проверяется право пользователя изменять
     * переданный экземпляр скина. Входные данные валидируются
     * классом UpdateSkinRequest.
     *
     * Фактическое обновление записи и связанных файлов выполняется
     * через SkinService.
     *
     * @param UpdateSkinRequest $request HTTP-запрос с валидированными
     *                                   данными для обновления.
     * @param Skin $skin Экземпляр скина, полученный через Route Model Binding.
     *
     * @return RedirectResponse Перенаправление на предыдущую страницу
     *                          с сообщением об успешном обновлении.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     *         Если пользователь не имеет права изменять скин.
     * @throws \Throwable Если во время обновления произошла ошибка.
     */
    public function update(
        UpdateSkinRequest $request,
        Skin $skin,
    ): RedirectResponse {
        // Проверяем разрешение на изменение конкретного скина.
        $this->authorize('update', $skin);

        // Передаём скин и проверенные данные сервису.
        $this->skinService->update(
            $skin,
            $request->validated(),
        );

        return back()->with(
            'success',
            'Скин успешно обновлён.',
        );
    }

    /**
     * Перемещает скин в корзину посредством мягкого удаления.
     *
     * Перед удалением проверяется право пользователя на выполнение
     * операции. Если запись уже удалена, возвращается сообщение об ошибке.
     *
     * После успешного удаления в журнал приложения записываются
     * идентификатор и название скина, идентификатор пользователя
     * и IP-адрес источника запроса.
     *
     * @param Skin $skin Экземпляр скина, полученный через Route Model Binding.
     *
     * @return RedirectResponse Перенаправление на предыдущую страницу
     *                          с результатом операции.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     *         Если пользователь не имеет права удалять скин.
     */
    public function destroy(Skin $skin): RedirectResponse
    {
        // Проверяем разрешение на мягкое удаление скина.
        $this->authorize('delete', $skin);

        // Не допускаем повторного перемещения записи в корзину.
        if ($skin->trashed()) {
            return back()->with(
                'error',
                'Этот скин уже находится в корзине.',
            );
        }

        // Выполняем мягкое удаление записи.
        $skin->delete();

        // Сохраняем информацию об операции для последующего аудита.
        Log::info('Скин перемещён в корзину.', [
            'skin_id' => $skin->id,
            'skin_name' => $skin->name,
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
        ]);

        return back()->with(
            'success',
            "Скин «{$skin->name}» успешно перемещён в корзину.",
        );
    }

    /**
     * Восстанавливает ранее удалённый скин из корзины.
     *
     * Перед восстановлением проверяется право пользователя на выполнение
     * операции. Если запись не находится в корзине, операция не выполняется.
     *
     * После успешного восстановления в журнал приложения записывается
     * информация о скине, пользователе и IP-адресе источника запроса.
     *
     * @param Skin $skin Экземпляр скина, включая мягко удалённые записи,
     *                   полученный через Route Model Binding.
     *
     * @return RedirectResponse Перенаправление на предыдущую страницу
     *                          с сообщением о результате восстановления.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     *         Если пользователь не имеет права восстанавливать скин.
     */
    public function restore(Skin $skin): RedirectResponse
    {
        // Проверяем разрешение на восстановление скина.
        $this->authorize('restore', $skin);

        // Проверяем, что запись действительно находится в корзине.
        if (!$skin->trashed()) {
            return back()->with(
                'error',
                'Этот скин не находится в корзине.',
            );
        }

        // Восстанавливаем запись без создания нового экземпляра.
        $skin->restore();

        // Сохраняем информацию о восстановлении для последующего аудита.
        Log::info('Скин восстановлен из корзины.', [
            'skin_id' => $skin->id,
            'skin_name' => $skin->name,
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
        ]);

        return back()->with(
            'success',
            "Скин «{$skin->name}» успешно восстановлен.",
        );
    }
}