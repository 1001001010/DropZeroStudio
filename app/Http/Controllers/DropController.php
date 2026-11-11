<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDropRequest;
use App\Http\Requests\UpdateDropRequest;
use App\Models\Drop;
use App\Models\Skin;
use Inertia\{Inertia};
use Illuminate\Support\Facades\DB;


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
    public function store(StoreDropRequest $request)
    {
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Drop $drop)
    {
        //
    }
}