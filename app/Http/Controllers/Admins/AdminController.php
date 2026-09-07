<?php

namespace App\Http\Controllers\Admins;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/index');
    }

}