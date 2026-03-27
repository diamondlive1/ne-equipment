<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    /**
     * List all users (Admin only)
     */
    public function index()
    {
        return response()->json(User::where('role', 'admin')->with('team')->get());
    }



    /**
     * Store a new user (Admin only)
     */
    public function store(Request $request)
    {
        // Apenas o Superadmin pode criar novos funcionários/admins
        if (!$request->user() || !$request->user()->is_superadmin) {
            return response()->json(['message' => 'Apenas o administrador principal pode adicionar novos membros à equipa.'], 403);
        }

        $request->validate([

            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|string|in:admin,customer',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'password' => Hash::make($request->password),
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Utilizador criado com sucesso',
            'user' => $user
        ], 201);
    }
}
