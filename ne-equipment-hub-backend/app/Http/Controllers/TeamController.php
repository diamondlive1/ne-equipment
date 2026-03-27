<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function index()
    {
        return response()->json(Team::withCount('users')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:teams',
            'description' => 'nullable|string|max:500',
        ]);

        $team = Team::create($request->all());

        return response()->json($team, 201);
    }

    public function update(Request $request, $id)
    {
        $team = Team::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255|unique:teams,name,' . $id,
            'description' => 'nullable|string|max:500',
        ]);

        $team->update($request->all());

        return response()->json($team);
    }

    public function destroy($id)
    {
        $team = Team::findOrFail($id);
        $team->delete();
        return response()->json(['message' => 'Equipa removida com sucesso.']);
    }
}
