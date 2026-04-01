<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
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
        // Administradores têm permissão para adicionar novos membros à equipa.
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Apenas utilizadores com privilégios de administrador podem adicionar membros.'], 403);
        }

        try {
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

            $userData = [
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'role' => $request->role,
                'password' => Hash::make($request->password),
            ];

            // Proteção contra colunas que podem não existir ainda no banco de dados do Railway
            if (Schema::hasColumn('users', 'is_superadmin')) {
                $userData['is_superadmin'] = $request->is_superadmin ?? false;
            }
            if (Schema::hasColumn('users', 'is_active')) {
                $userData['is_active'] = true;
            }
            if (Schema::hasColumn('users', 'assigned_category_id')) {
                $userData['assigned_category_id'] = $request->assigned_category_id;
            }

            $user = User::create($userData);

            if ($request->filled('category_ids') && method_exists($user, 'categories')) {
                // Verificar se a tabela intermédia existe no Railway antes de sincronizar
                if (Schema::hasTable('user_categories')) {
                    $user->categories()->sync($request->category_ids);
                }
            }

            return response()->json([
                'message' => 'Utilizador criado com sucesso',
                'user' => $user->load(['assignedCategory', 'categories'])
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Erro ao criar funcionário: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao criar funcionário',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing user (Admin only)
     */
    public function update(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Apenas utilizadores com privilégios de administrador podem editar membros.'], 403);
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
            return response()->json(['message' => 'Apenas utilizadores com privilégios de administrador podem remover membros.'], 403);
        }

        $user = User::findOrFail($id);
        
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Não pode remover a si próprio.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Utilizador removido com sucesso']);
    }
}
