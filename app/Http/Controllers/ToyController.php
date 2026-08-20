<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreToyRequest;
use App\Http\Requests\UpdateToyRequest;
use App\Models\Toy;

class ToyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function store(StoreToyRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Toy $toy)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Toy $toy)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateToyRequest $request, Toy $toy)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Toy $toy)
    {
        //
    }
}
