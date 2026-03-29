<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\NewsletterController;

// Rotas abertas (não requerem token)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe']);

Route::get('/products', [ProductController::class, 'index']);

Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/settings', [SettingController::class, 'index']);

// Rota de saúde para debug
// Rota de saúde extremamente simples para o Railway
Route::get('/health-check', function() {
    return response()->json(['status' => 'ok', 'message' => 'API is reachable']);
});

// Outra rota para debug completo (opcional)
Route::get('/debug-check', function() {
    try {
        return [
            'status' => 'ok',
            'database' => DB::connection()->getDatabaseName(),
            'user_count' => \App\Models\User::count(),
        ];
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// Rotas Protegidas (requerem Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Gestão de Produtos
    Route::post('/products', [ProductController::class, 'store']);
    Route::post('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Cotações (Criação/Listagem pelo Cliente)
    Route::get('/quotes', [QuoteController::class, 'userIndex']);
    Route::post('/quotes', [QuoteController::class, 'store']);
    Route::get('/quotes/{id}/messages', [QuoteController::class, 'getMessages']);
    Route::post('/quotes/{id}/messages', [QuoteController::class, 'sendMessage']);
    Route::post('/quotes/{id}/report-payment', [QuoteController::class, 'reportPayment']);

    // Gestão de Categorias
    Route::apiResource('categories', CategoryController::class)->except(['index']);

    // Admin: Gestão de Negociações (Quotes/RFQs)
    Route::get('/admin/quotes', [QuoteController::class, 'index']);
    Route::get('/admin/quotes/{id}', [QuoteController::class, 'show']);
    Route::put('/admin/quotes/{id}', [QuoteController::class, 'update']);
    Route::put('/admin/quotes/{id}/items', [QuoteController::class, 'updateItems']);
    Route::get('/admin/quotes/{id}/messages', [QuoteController::class, 'getMessages']); // Admin can view messages
    Route::post('/admin/quotes/{id}/messages', [QuoteController::class, 'sendMessage']); // Admin can send messages
    Route::post('/admin/quotes/{id}/upload-invoice', [QuoteController::class, 'uploadInvoice']); // Admin can upload invoice

    // Admin: Gestão de Pedidos
    Route::get('/admin/orders', [OrderController::class, 'index']);
    Route::get('/admin/orders/{id}', [OrderController::class, 'show']);
    Route::put('/admin/orders/{id}', [OrderController::class, 'update']);

    // Admin: Dashboard
    Route::get('/admin/dashboard', [DashboardController::class, 'index']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Admin: Gestão de Utilizadores
    Route::get('/admin/users', [UserController::class, 'index']);
    Route::post('/admin/users', [UserController::class, 'store']);

    // Admin: Gestão de Equipas
    Route::apiResource('/admin/teams', TeamController::class);

    // Admin Settings


    Route::put('/admin/settings', [SettingController::class, 'update']);
});
