<?php

namespace App\Http\Controllers;

use App\Http\Requests\{UpdateSkinRequest, StoreSkinRequest};
use App\Models\{Skin, Drop};
use Inertia\{Inertia};
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\RedirectResponse;
use App\Services\skin\SkinService;
class SkinController extends Controller
{
    public function __construct(
        private readonly SkinService $skinService,
    ) {
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $skins = Skin::withTrashed()->with('drops')->orderBy('name')->get();
        return Inertia::render('admin/skins/index', [
            'drops' => Drop::with('skin')->latest()->get(),
            'skins' => $skins,
            'stats' => [
                'total' => $skins->whereNull('deleted_at')->count(),
                'active' => $skins->whereNull('deleted_at')->where('is_active', true)->count(),
                'inactive' => $skins->whereNull('deleted_at')->where('is_active', false)->count(),
                'deleted' => $skins->whereNotNull('deleted_at')->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSkinRequest $request): RedirectResponse
    {
        $this->skinService->create($request->validated());

        return to_route('admin.skins.index')
            ->with('success', 'Скин успешно создан.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Skin $skin)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Skin $skin)
    {
        //
    }

    /**
     * Update the specified skin.
     */
    public function update(
        UpdateSkinRequest $request,
        Skin $skin,
    ): RedirectResponse {
        $this->authorize('update', $skin);

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
     * Мягкое удаление скина (коллекции).
     *
     * @param Skin $skin
     * @return RedirectResponse
     */
    public function destroy(Skin $skin): RedirectResponse
    {
        try {
            if ($skin->trashed()) {
                return redirect()
                    ->back()
                    ->with('error', 'Этот скин уже находится в корзине.');
            }

            $skin->delete();

            Log::info('Скин мягко удален (помещен в корзину)', [
                'skin_id' => $skin->id,
                'skin_name' => $skin->name,
                'user_id' => auth()->id(),
                'ip' => request()->ip()
            ]);

            return redirect()
                ->back()
                ->with('success', 'Скин «' . $skin->name . '» успешно перемещен в корзину.');

        } catch (\Exception $e) {
            Log::error('Ошибка при мягком удалении скина', [
                'skin_id' => $skin->id ?? null,
                'error' => $e->getMessage()
            ]);

            return redirect()
                ->back()
                ->with('error', 'Произошла ошибка при удалении: ' . $e->getMessage());
        }
    }

    /**
     * Восстанавливает скин из корзины.
     *
     * @param Skin $skin
     * @return RedirectResponse
     */
    public function restore(Skin $skin): RedirectResponse
    {
        try {
            if (!$skin->trashed()) {
                return redirect()
                    ->back()
                    ->with(
                        'error',
                        'Этот скин не находится в корзине.'
                    );
            }

            $skin->restore();

            Log::info('Скин восстановлен из корзины', [
                'skin_id' => $skin->id,
                'skin_name' => $skin->name,
                'user_id' => auth()->id(),
                'ip' => request()->ip(),
            ]);

            return redirect()
                ->back()
                ->with(
                    'success',
                    "Скин «{$skin->name}» успешно восстановлен."
                );
        } catch (\Exception $e) {
            Log::error('Ошибка при восстановлении скина', [
                'skin_id' => $skin->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->with(
                    'error',
                    'Произошла ошибка при восстановлении: ' .
                    $e->getMessage()
                );
        }
    }

}