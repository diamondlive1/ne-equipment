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
        return response()->json(User::where('role', 'admin')->with(['team', 'assignedCategory', 'categories'])->get());
    }



    /**
     * Store a new user (Admin only)
     */
    public function store(Request $request)
    {
        // Administradores podem adicionar novos membros à equipa.
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Apenas administradores podem adicionar novos membros à equipa.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|string|in:admin,customer',
            'is_superadmin' => 'nullable|boolean',
            'password' => 'required|string|min:6',
            'assigned_category_id' => 'nullable|exists:categories,id',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
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

        if ($request->filled('category_ids')) {
            $user->categories()->sync($request->category_ids);
        }

        return response()->json([
            'message' => 'Utilizador criado com sucesso',
            'user' => $user->load(['assignedCategory', 'categories'])
        ], 201);
    }

    /**
     * Update an existing user (Admin only)
     */
    public function update(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Apenas administradores podem editar membros da equipa.'], 403);
        }

        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'is_superadmin' => 'nullable|boolean',
            'password' => 'nullable|string|min:6',
            'assigned_category_id' => 'nullable|exists:categories,id',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
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

        // Sync multiple categories
        $user->categories()->sync($request->category_ids ?? []);

        return response()->json([
            'message' => 'Utilizador atualizado com sucesso',
            'user' => $user->load(['assignedCategory', 'categories'])
        ]);
    }

    /**
     * Remove a user (Admin only)
     */
    public function destroy(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Apenas administradores podem remover membros da equipa.'], 403);
        }

        $user = User::findOrFail($id);
        
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Não pode remover a si próprio.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Utilizador removido com sucesso']);
    }
}
