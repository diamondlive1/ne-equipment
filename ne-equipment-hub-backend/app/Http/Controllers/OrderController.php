<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Notifications\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    /**
     * Listar todos os pedidos.
     */
    public function index()
    {
        $user = Auth::user();
        $query = Order::with(['user', 'items.product', 'deliveryAddress'])->orderBy('created_at', 'desc');

        // Se o admin tiver uma categoria atribuída e for filtrado (removido para acesso total)
        /*
        if ($user && !$user->is_superadmin && $user->assigned_category_id) {
            $categoryId = $user->assigned_category_id;
            $query->whereHas('items.product', function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            });
        }
        */

        return response()->json($query->get());
    }

    /**
     * Ver detalhes de um pedido.
     */
    public function show($id)
    {
        $order = Order::with(['user', 'items.product', 'deliveryAddress'])->findOrFail($id);
        return response()->json($order);
    }

    /**
     * Atualizar o status de um pedido.
     */
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:pending_payment,paid,processing,shipped,delivered,cancelled',
        ]);

        $oldStatus = $order->status;
        $order->update($validated);

        if ($oldStatus !== $order->status) {
            $admins = User::where('role', 'admin')->get();
            $notificationData = [
                'type' => 'order_update',
                'title' => 'Status de Pedido Alterado',
                'message' => "O pedido #{$order->id} foi movido para: " . strtoupper($order->status),
                'order_id' => $order->id,
                'status' => $order->status
            ];

            foreach ($admins as $admin) {
                $admin->notify(new Notification($notificationData));
            }

            // Notificar Cliente
            $order->user->notify(new Notification([
                'type' => 'order_status_updated',
                'title' => 'Atualização no seu Pedido',
                'message' => "O status do seu pedido #{$order->order_number} foi alterado para: " . strtoupper($order->status),
                'order_id' => $order->id,
                'status' => $order->status
            ]));
        }

        return response()->json([
            'message' => 'Status do pedido atualizado com sucesso',
            'order' => $order->load(['user', 'items.product', 'deliveryAddress'])
        ]);
    }
}
