<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\QuoteMessage;
use App\Models\User;
use App\Notifications\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class QuoteController extends Controller
{
    /**
     * Listar todas as cotações (RFQs).
     */
    public function index()
    {
        $quotes = Quote::with(['user', 'items.product.images'])->orderBy('created_at', 'desc')->get();
        return response()->json($quotes);
    }

    /**
     * Listar cotações do usuário logado (Cliente B2B).
     */
    public function userIndex()
    {
        $user = Auth::user();
        $quotes = Quote::where('user_id', $user->id)
            ->with(['items.product.images', 'messages.user:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($quotes);
    }

    /**
     * Criar uma nova cotação (RFQ).
     */
    public function store(Request $request)
    {
        $request->validate([
            'empresa' => 'required|string|max:255',
            'nif' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request) {
            $user = Auth::user();
            
            // Gerar Quote Number único (Ex: RFQ-20240324-XXXX)
            $date = date('Ymd');
            $random = strtoupper(substr(uniqid(), -4));
            $quoteNumber = "RFQ-{$date}-{$random}";

            $quote = Quote::create([
                'quote_number' => $quoteNumber,
                'user_id' => $user->id,
                'company_name' => $request->empresa,
                'vat_number' => $request->nif,
                'contact_email' => $request->email,
                'status' => 'pending',
                'total_estimated_value' => 0,
                'admin_notes' => 'Cotação enviada via portal B2B.',
            ]);

            foreach ($request->items as $item) {
                QuoteItem::create([
                    'quote_id' => $quote->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'requested_price' => 0, // Será definido pelo admin
                ]);
            }

            // Notificar Admins
            $admins = User::where('role', 'admin')->get();
            $notificationData = [
                'type' => 'new_quote',
                'title' => 'Novo RFQ Recebido',
                'message' => "A empresa {$request->empresa} solicitou uma cotação.",
                'quote_id' => $quote->id,
                'user_name' => $user->name
            ];

            foreach ($admins as $admin) {
                $admin->notify(new Notification($notificationData));
            }

            return response()->json([
                'message' => 'Cotação enviada com sucesso',
                'quote' => $quote->load('items')
            ], 201);
        });
    }

    /**
     * Ver detalhes de uma cotação.
     */
    public function show($id)
    {
        $quote = Quote::with(['user', 'items.product.images'])->findOrFail($id);
        return response()->json($quote);
    }

    /**
     * Atualizar status e notas do admin em uma cotação e notificar/atualizar preços.
     */
    public function update(Request $request, $id)
    {
        try {
            $quote = Quote::findOrFail($id);
            $oldStatus = $quote->status;

            $validated = $request->validate([
                'status' => 'sometimes|string|in:pending,responded,approved,rejected,converted,payment_reported,completed',
                'admin_notes' => 'sometimes|nullable|string',
                'total_estimated_value' => 'sometimes|numeric',
                'expires_at' => 'sometimes|nullable|date',
                'delivery_info' => 'sometimes|nullable|string|max:255',
            ]);

            DB::transaction(function () use ($quote, $validated, $oldStatus) {
                $quote->update($validated);

                // Se o status mudou para convertido ou completed, criamos um pedido
                if (isset($validated['status']) && in_array($validated['status'], ['converted', 'completed']) && !in_array($oldStatus, ['converted', 'completed'])) {
                    $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
                    
                    $order = \App\Models\Order::create([
                        'order_number' => $orderNumber,
                        'user_id' => $quote->user_id,
                        'status' => 'pending_payment',
                        'total_amount' => $quote->total_estimated_value,
                    ]);

                    foreach ($quote->items as $item) {
                        \App\Models\OrderItem::create([
                            'order_id' => $order->id,
                            'product_id' => $item->product_id,
                            'quantity' => $item->quantity,
                            'price_at_time' => $item->approved_price ?? $item->requested_price ?? 0,
                        ]);
                    }
                }
            });

            return response()->json([
                'message' => 'Cotação atualizada com sucesso',
                'quote' => $quote->load(['user', 'items.product.images'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro interno do servidor',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }


    /**
     * Atualizar preços aprovados para itens individuais de uma cotação.
     */
    public function updateItems(Request $request, $id)
    {
        try {
            $request->validate([
                'items' => 'required|array',
                'items.*.id' => 'required|exists:quote_items,id',
                'items.*.approved_price' => 'nullable|numeric',
            ]);

            foreach ($request->items as $itemData) {
                $quoteItem = QuoteItem::where('quote_id', $id)->findOrFail($itemData['id']);
                $quoteItem->update(['approved_price' => $itemData['approved_price']]);
            }

            $quote = Quote::with(['user', 'items.product.images'])->findOrFail($id);

            // Recalcular total se necessário
            $total = 0;
            foreach ($quote->items as $item) {
                $total += floatval($item->approved_price ?? $item->requested_price ?? 0) * intval($item->quantity);
            }
            
            $quote->update(['total_estimated_value' => $total]);

            return response()->json([
                'message' => 'Itens da cotação atualizados com sucesso',
                'quote' => $quote
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao atualizar itens da cotação',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }


    /**
     * Listar mensagens do chat de uma cotação.
     */
    public function getMessages($id)
    {
        $messages = \App\Models\QuoteMessage::where('quote_id', $id)
            ->with('user:id,name')
            ->orderBy('created_at', 'asc')
            ->get();
            
        return response()->json($messages);
    }

    /**
     * Enviar uma mensagem para uma cotação.
     */
    public function sendMessage(\Illuminate\Http\Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string|max:1000'
        ]);

        $user = \Illuminate\Support\Facades\Auth::user();
        $isAdmin = $user->role === 'admin';

        $quote = \App\Models\Quote::findOrFail($id);

        $message = \App\Models\QuoteMessage::create([
            'quote_id' => $quote->id,
            'user_id' => $user->id,
            'message' => $request->message,
            'is_admin' => $isAdmin
        ]);

        return response()->json([
            'success' => true,
            'message' => $message->load('user:id,name')
        ], 201);
    }

    /**
     * Fazer upload de fatura/recibo para uma cotação.
     */
    public function uploadInvoice(\Illuminate\Http\Request $request, $id)
    {
        $request->validate([
            'invoice' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120' // max 5MB
        ]);

        $quote = \App\Models\Quote::findOrFail($id);

        if ($request->hasFile('invoice')) {
            $path = $request->file('invoice')->store('invoices', 'public');
            
            $quote->update([
                'invoice_path' => $path
            ]);

            // Create an automatic chat message from the system/admin saying invoice was uploaded
            \App\Models\QuoteMessage::create([
                'quote_id' => $quote->id,
                'user_id' => \Illuminate\Support\Facades\Auth::id(),
                'message' => 'A loja anexou uma Factura / Recibo para esta Negociação.',
                'is_admin' => true
            ]);

            return response()->json([
                'message' => 'Fatura anexada com sucesso!',
                'invoice_path' => $path
            ]);
        }

        return response()->json(['message' => 'Nenhum ficheiro fornecido.'], 400);
    }

    /**
     * Cliente reporta que o pagamento foi feito.
     */
    public function reportPayment($id)
    {
        $quote = Quote::where('user_id', Auth::id())->findOrFail($id);

        if ($quote->status !== 'approved') {
            return response()->json(['message' => 'Apenas cotações aprovadas podem ter o pagamento reportado.'], 400);
        }

        DB::transaction(function () use ($quote) {
            $quote->update(['status' => 'payment_reported']);

            // Mensagem automática do cliente
            QuoteMessage::create([
                'quote_id' => $quote->id,
                'user_id' => Auth::id(),
                'message' => '✅ Confirmei que o pagamento/transferência foi realizado.',
                'is_admin' => false
            ]);

            // Notify Admins
            $admins = User::where('role', 'admin')->get();
            $notificationData = [
                'type' => 'payment_reported',
                'title' => 'Pagamento Confirmado pelo Cliente',
                'message' => "O cliente " . Auth::user()->name . " confirmou o pagamento da cotação #" . $quote->quote_number,
                'quote_id' => $quote->id,
                'user_name' => Auth::user()->name
            ];

            foreach ($admins as $admin) {
                $admin->notify(new Notification($notificationData));
            }
        });

        return response()->json([
            'message' => 'Pagamento reportado com sucesso',
            'quote' => $quote->load(['items.product.images', 'messages'])
        ]);
    }
}
