<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Quote;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // 1. KPIs
        $startOfCurrentMonth = Carbon::now()->startOfMonth();
        $startOfPreviousMonth = Carbon::now()->subMonth()->startOfMonth();

        // Receita Total Atual
        $totalRevenueCurrent = Order::whereIn('status', ['paid', 'processing', 'shipped', 'delivered'])
            ->where('created_at', '>=', $startOfCurrentMonth)
            ->sum('total_amount');

        // Receita Total Anterior
        $totalRevenuePrevious = Order::whereIn('status', ['paid', 'processing', 'shipped', 'delivered'])
            ->whereBetween('created_at', [$startOfPreviousMonth, clone $startOfCurrentMonth])
            ->sum('total_amount');

        $revenueChange = $totalRevenuePrevious > 0 
            ? (($totalRevenueCurrent - $totalRevenuePrevious) / $totalRevenuePrevious) * 100 
            : 0;

        $quotesCountCurrent = Quote::where('created_at', '>=', $startOfCurrentMonth)->count();
        $quotesCountPrevious = Quote::whereBetween('created_at', [$startOfPreviousMonth, clone $startOfCurrentMonth])->count();
        $quotesChange = $quotesCountPrevious > 0 
            ? (($quotesCountCurrent - $quotesCountPrevious) / $quotesCountPrevious) * 100 
            : 0;

        $activeProductsCount = Product::count();
        $pendingOrdersCount = Order::where('status', 'pending_payment')->count();
        
        $kpis = [
            [
                'label' => 'Receita do Mês (MZN)',
                'value' => number_format($totalRevenueCurrent, 0, ',', '.'),
                'change' => ($revenueChange >= 0 ? '+' : '') . number_format($revenueChange, 1) . '%',
                'trend' => $revenueChange >= 0 ? 'up' : 'down',
                'icon' => 'DollarSign',
                'color' => 'text-whatsapp',
            ],
            [
                'label' => 'RFQs do Mês',
                'value' => (string)$quotesCountCurrent,
                'change' => ($quotesChange >= 0 ? '+' : '') . number_format($quotesChange, 1) . '%',
                'trend' => $quotesChange >= 0 ? 'up' : 'down',
                'icon' => 'FileText',
                'color' => 'text-primary',
            ],
            [
                'label' => 'Produtos no Catálogo',
                'value' => (string)$activeProductsCount,
                'change' => 'Total',
                'trend' => 'up',
                'icon' => 'Package',
                'color' => 'text-accent',
            ],
            [
                'label' => 'Pedidos Pendentes (Sempre)',
                'value' => (string)$pendingOrdersCount,
                'change' => 'Ação Necessária',
                'trend' => 'down',
                'icon' => 'ShoppingCart',
                'color' => 'text-orange',
            ],
        ];

        // 2. Revenue Data (Last 6 months)
        $revenueData = [];
        for ($i = 5; $i >= 0; $i--) {
            $currentDate = Carbon::now()->subMonths($i);
            $monthName = $currentDate->shortMonthName;
            
            $monthRevenue = Order::whereIn('status', ['paid', 'processing', 'shipped', 'delivered'])
                ->whereMonth('created_at', $currentDate->month)
                ->whereYear('created_at', $currentDate->year)
                ->sum('total_amount');

            // Find equivalent previous month revenue (e.g., month last year? no, let's just do previous month to compare)
            $previousDate = $currentDate->copy()->subMonth();
            $prevMonthRevenue = Order::whereIn('status', ['paid', 'processing', 'shipped', 'delivered'])
                ->whereMonth('created_at', $previousDate->month)
                ->whereYear('created_at', $previousDate->year)
                ->sum('total_amount');
            
            $revenueData[] = [
                'month' => $monthName,
                'atual' => (float)$monthRevenue,
                'anterior' => (float)$prevMonthRevenue
            ];
        }

        // 3. Status Distribution
        $statusCounts = Order::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();
        
        $statusLabels = [
            'pending_payment' => 'Pag. Pendente',
            'paid' => 'Pago',
            'processing' => 'Processando',
            'shipped' => 'Enviado',
            'delivered' => 'Entregue',
            'cancelled' => 'Cancelado'
        ];

        $statusColors = [
            'pending_payment' => 'hsl(0, 84%, 60%)',
            'paid' => 'hsl(142, 70%, 45%)',
            'processing' => 'hsl(24, 95%, 53%)',
            'shipped' => 'hsl(210, 100%, 20%)',
            'delivered' => 'hsl(142, 70%, 30%)',
            'cancelled' => 'hsl(0, 0%, 50%)'
        ];

        $statusDistribution = $statusCounts->map(function($item) use ($statusLabels, $statusColors) {
            return [
                'name' => $statusLabels[$item->status] ?? $item->status,
                'value' => $item->total,
                'color' => $statusColors[$item->status] ?? 'hsl(0,0%,80%)'
            ];
        });

        // 4. Funnel Data
        $funnelData = [
            ['stage' => 'RFQs Totais', 'value' => Quote::count()],
            ['stage' => 'Cotações Aprovadas', 'value' => Quote::where('status', 'approved')->count()],
            ['stage' => 'Pedidos Convertidos', 'value' => Order::count()],
        ];

        // 5. Recent Orders
        $recentOrders = Order::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($order) {
                return [
                    'id' => $order->order_number,
                    'client' => $order->user->name,
                    'nuit' => $order->user->nuit ?? 'N/A',
                    'value' => number_format($order->total_amount, 0, ',', '.'),
                    'status' => $order->status,
                ];
            });

        // 6. Alerts
        $alerts = $request->user()->unreadNotifications()->limit(5)->get()->map(function($notif) {
            $type = 'info';
            if (isset($notif->data['type'])) {
                if ($notif->data['type'] === 'new_quote') $type = 'warning';
                if ($notif->data['type'] === 'order_paid') $type = 'success';
            }
            return [
                'type' => $type,
                'message' => $notif->data['message'] ?? 'Nova notificação',
                'time' => $notif->created_at->diffForHumans()
            ];
        });

        return response()->json([
            'kpis' => $kpis,
            'revenueData' => $revenueData,
            'statusDistribution' => $statusDistribution,
            'funnelData' => $funnelData,
            'recentOrders' => $recentOrders,
            'alerts' => $alerts
        ]);
    }
}
