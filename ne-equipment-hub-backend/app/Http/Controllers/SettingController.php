<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Listar todas as configurações públicas.
     */
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    /**
     * Atualizar ou criar configurações (Admin).
     */
    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($request->settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return response()->json(['message' => 'Configurações atualizadas com sucesso']);
    }
}
