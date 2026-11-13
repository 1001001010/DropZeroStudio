<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDropRequest;
use App\Http\Requests\UpdateDropRequest;
use App\Models\Drop;
use App\Models\Skin;
use Inertia\{Inertia};
use Illuminate\Support\Facades\DB;
use App\Services\ToyCredentialGenerator;
use Illuminate\Support\Facades\Hash;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class DropController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $drops = Drop::withTrashed()
            ->with('skin')
            ->orderBy('name')
            ->get();

        $activeDrops = Drop::query()
            ->whereNotNull('sale_started_at')
            ->where('sale_started_at', '<=', now())
            ->where(function ($query) {
                $query->whereNull('sale_ended_at')
                    ->orWhere('sale_ended_at', '>=', now());
            });

        $stats = [
            'total' => Drop::count(),

            'active' => (clone $activeDrops)->count(),

            'totalQuantity' => Drop::sum('edition_size'),

            'potentialRevenue' => Drop::sum(
                DB::raw('edition_size * price')
            ),
        ];

        return Inertia::render(
            'admin/drops/index',
            [
                'skins' => Skin::get(),
                'drops' => $drops,
                'stats' => $stats,
            ]
        );
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

    public function store(
        StoreDropRequest $request,
        ToyCredentialGenerator $generator
    ) {
        $data = $request->validated();

        // Секреты будут существовать только в памяти во время создания.
        $generatedToys = [];

        $drop = DB::transaction(function () use ($data, $generator, &$generatedToys) {
            $drop = Drop::create($data);

            for ($number = 1; $number <= $drop->edition_size; $number++) {
                $code = $generator->generateCode();
                $secret = $generator->generateSecret();

                $drop->toys()->create([
                    'code' => $code,
                    'secret_hash' => Hash::make($secret),
                    'number' => $number,
                    'status' => 'produced',
                ]);

                $generatedToys[] = [
                    'number' => $number,
                    'code' => $code,
                    'secret' => $secret,
                ];
            }

            return $drop;
        });

        try {
            // Формируем PDF после успешного сохранения дропа и игрушек.
            $pdf = Pdf::loadView('pdf.toy-cards', [
                'toys' => $generatedToys,
                'editionSize' => $drop->edition_size,
            ])->setPaper('a4');

            $path = "private/drop-cards/drop-{$drop->id}.pdf";

            Storage::disk('local')->put($path, $pdf->output());

        } catch (\Throwable $exception) {
            // Не оставляем дроп без созданного файла карточек.
            DB::transaction(function () use ($drop) {
                $drop->toys()->forceDelete();
                $drop->forceDelete();
            });

            throw $exception;
        }

        return redirect()
            ->back()
            ->with('success', "Дроп создан. Игрушек: {$drop->edition_size}. Карточки сохранены.");
    }


    /**
     * Display the specified resource.
     */
    public function show(Drop $drop)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Drop $drop)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDropRequest $request, Drop $drop)
    {
        $drop->update($request->validated());

        return back()->with('success', 'Дроп успешно обновлён.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Drop $drop)
    {
        //
    }
}
