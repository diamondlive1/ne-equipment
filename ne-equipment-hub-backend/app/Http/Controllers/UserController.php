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
        return response()->json(User::where('role', 'admin')->with(['team', 'assignedCategory'])->get());
    }



    /**
     * Store a new user (Admin only)
     */
    public function store(Request $request)
    {
        // Apenas o Admin principal (is_superadmin = true) pode criar novos funcionários/admins
        if (!$request->user() || !$request->user()->is_superadmin) {
            return response()->json(['message' => 'Apenas o administrador principal pode adicionar novos membros à equipa.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|string|in:admin,customer',
            'is_superadmin' => 'nullable|boolean',
            'password' => 'required|string|min:6',
            'assigned_category_id' => 'nullable|exists:categories,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'is_superadmin' => $request->is_superadmin ?? false,
            'password' => Hash::make($request->password),
            'is_active' => true,
            'assigned_category_id' => $request->assigned_category_id,
        ]);

        return response()->json([
            'message' => 'Utilizador criado com sucesso',
            'user' => $user->load('assignedCategory')
        ], 201);
    }

    /**
     * Update an existing user (Admin only)
     */
    public function update(Request $request, $id)
    {
        if (!$request->user() || !$request->user()->is_superadmin) {
            return response()->json(['message' => 'Apenas o administrador principal pode editar membros da equipa.'], 403);
        }

        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'is_superadmin' => 'nullable|boolean',
            'password' => 'nullable|string|min:6',
            'assigned_category_id' => 'nullable|exists:categories,id',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'is_superadmin' => $request->is_superadmin ?? $user->is_superadmin,
            'assigned_category_id' => $request->assigned_category_id,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Utilizador atualizado com sucesso',
            'user' => $user->load('assignedCategory')
        ]);
    }

    /**
     * Remove a user (Admin only)
     */
    public function destroy(Request $request, $id)
    {
        if (!$request->user() || !$request->user()->is_superadmin) {
            return response()->json(['message' => 'Apenas o administrador principal pode remover membros da equipa.'], 403);
        }

        $user = User::findOrFail($id);
        
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Não pode remover a si próprio.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Utilizador removido com sucesso']);
    }
}
