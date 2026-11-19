<?php

namespace App\Http\Controllers;

use App\Models\{Toy, Skin, Drop};
use Illuminate\Http\Request;
use Inertia\Inertia;

class ToyController extends Controller
{

    public function welcome()
    {
        $stats = [
            [
                'value' => Toy::where('status', 'sold')->count(),
                'label' => 'Коллекционеров',
            ],
            [
                'value' => Skin::count(),
                'label' => 'Дизайнов',
            ],
            [
                'value' => '100%',
                'label' => 'Уникальные персонажи',
            ],
        ];
        return Inertia::render('welcome', [
            'stats' => $stats,
        ]);
    }

    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:all,produced,available,sold,deleted'],
            'drop_id' => ['nullable', 'integer', 'exists:drops,id'],
        ]);

        $status = $filters['status'] ?? 'all';

        $query = $status === 'deleted'
            ? Toy::onlyTrashed()
            : Toy::query();

        $query->with([
            'drop.skin',
            'user',
        ]);

        $query
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%");

                    if (ctype_digit($search)) {
                        $q->orWhere('id', (int) $search);
                    }
                });
            })
            ->when(
                !empty($filters['drop_id']),
                fn($query) => $query->where('drop_id', $filters['drop_id'])
            )
            ->when(
                $status !== 'all' && $status !== 'deleted',
                fn($query) => $query->where('status', $status)
            );

        $toys = $query
            ->orderBy('drop_id')
            ->orderBy('number')
            ->paginate(20)
            ->withQueryString()
            ->through(function (Toy $toy) {
                return [
                    'id' => $toy->id,
                    'dropId' => $toy->drop_id,
                    'dropName' => $toy->drop?->name ?? 'Удалённый дроп',
                    'skinName' => $toy->drop?->skin?->name,
                    'userId' => $toy->user_id,
                    'userName' => $toy->user?->name,
                    'code' => $toy->code,
                    'number' => $toy->number,
                    'status' => $toy->status,
                    'claimedAt' => $toy->claimed_at?->toDateTimeString(),
                    'deletedAt' => $toy->deleted_at?->toDateTimeString(),
                    'toyPhoto' => $toy->drop->skin->preview_image,
                ];
            });

        $stats = [
            'total' => Toy::count(),
            'produced' => Toy::where('status', 'produced')->count(),
            'available' => Toy::where('status', 'available')->count(),
            'sold' => Toy::where('status', 'sold')->count(),
            'deleted' => Toy::onlyTrashed()->count(),
        ];

        $drops = Drop::query()
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'edition_size']);

        return Inertia::render('admin/toys/index', [
            'toys' => $toys,
            'stats' => $stats,
            'drops' => $drops,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $status,
                'drop_id' => $filters['drop_id'] ?? 'all',
            ],
        ]);
    }

    public function destroy(Toy $toy)
    {
        $toy->delete();

        return back()->with('success', 'Игрушка перемещена в удалённые.');
    }

    public function restore(int $toy)
    {
        $toy = Toy::onlyTrashed()->findOrFail($toy);
        $toy->restore();

        return back()->with('success', 'Игрушка восстановлена.');
    }
}