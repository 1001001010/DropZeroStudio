<?php

namespace App\Http\Controllers\Admins;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderPayment;
use App\Models\Toy;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Главная страница административной панели.
     */
    public function index(): Response
    {
        $now = now();

        $currentMonthStart = $now->copy()->startOfMonth();
        $previousMonthStart = $currentMonthStart->copy()->subMonth();
        $previousMonthEnd = $currentMonthStart->copy()->subSecond();

        $paidStatus = PaymentStatus::Paid->value;

        // Общие показатели магазина.
        $totalToys = Toy::query()->count();
        $activatedToys = Toy::query()
            ->whereNotNull('user_id')
            ->count();

        $totalUsers = User::query()->count();

        $paidOrders = Order::query()
            ->whereNotNull('paid_at');

        $totalPaidOrders = (clone $paidOrders)->count();

        // Выручка учитывает только успешно оплаченные платежи.
        $totalRevenue = OrderPayment::query()
            ->where('status', $paidStatus)
            ->sum('amount');

        // Показатели текущего месяца.
        $monthRevenue = OrderPayment::query()
            ->where('status', $paidStatus)
            ->whereBetween('paid_at', [
                $currentMonthStart,
                $now,
            ])
            ->sum('amount');

        $previousMonthRevenue = OrderPayment::query()
            ->where('status', $paidStatus)
            ->whereBetween('paid_at', [
                $previousMonthStart,
                $previousMonthEnd,
            ])
            ->sum('amount');

        $monthOrders = (clone $paidOrders)
            ->whereBetween('paid_at', [
                $currentMonthStart,
                $now,
            ])
            ->count();

        $previousMonthOrders = (clone $paidOrders)
            ->whereBetween('paid_at', [
                $previousMonthStart,
                $previousMonthEnd,
            ])
            ->count();

        $monthUsers = User::query()
            ->whereBetween('created_at', [
                $currentMonthStart,
                $now,
            ])
            ->count();

        $previousMonthUsers = User::query()
            ->whereBetween('created_at', [
                $previousMonthStart,
                $previousMonthEnd,
            ])
            ->count();

        // Формируем динамику продаж за последние семь дней.
        $salesStart = $now->copy()->subDays(6)->startOfDay();

        $salesByDate = Order::query()
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [
                $salesStart,
                $now,
            ])
            ->selectRaw('DATE(paid_at) as date, COUNT(*) as total')
            ->groupBy('date')
            ->pluck('total', 'date');

        $sales = collect(range(0, 6))
            ->map(function (int $day) use ($salesStart, $salesByDate): array {
                $date = $salesStart->copy()->addDays($day);

                return [
                    'date' => $date->toDateString(),
                    'day' => $date->translatedFormat('D'),
                    'value' => (int) ($salesByDate[$date->toDateString()] ?? 0),
                ];
            })
            ->values();

        // Последние заказы с позициями и платежами.
        $recentOrders = Order::query()
            ->with([
                'items',
                'payment',
            ])
            ->latest()
            ->limit(5)
            ->get();

        // Популярные дропы по оплаченным заказам.
        $topDrops = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->leftJoin('drops', 'drops.id', '=', 'order_items.drop_id')
            ->whereNotNull('orders.paid_at')
            ->selectRaw('
        COALESCE(
            order_items.drop_name,
            drops.name,
            order_items.product_name
        ) as name,
        SUM(order_items.quantity) as sold,
        SUM(order_items.total_price) as revenue
    ')
            ->groupByRaw('
        COALESCE(
            order_items.drop_name,
            drops.name,
            order_items.product_name
        )
    ')
            ->orderByDesc('sold')
            ->limit(5)
            ->get();

        // Вычисляем процент изменения относительно предыдущего периода.
        $calculateChange = static function (int|float $current, int|float $previous, ): float {
            if ($previous == 0) {
                return $current > 0 ? 100 : 0;
            }

            return round((($current - $previous) / $previous) * 100, 1);
        };

        // Определяем валюту для отображения денежных показателей.
        $currency = Order::query()
            ->whereNotNull('currency')
            ->latest()
            ->value('currency') ?? 'RUB';

        $averageOrder = (clone $paidOrders)->avg('total');

        $activationRate = $totalToys > 0
            ? round(($activatedToys / $totalToys) * 100, 1)
            : 0;

        return Inertia::render('admin/index', [
            'metrics' => [
                'averageOrder' => (float) ($averageOrder ?? 0),
                'activationRate' => $activationRate,
            ],
            'stats' => [
                'toys' => [
                    'total' => $totalToys,
                    'activated' => $activatedToys,
                    'notActivated' => max(0, $totalToys - $activatedToys),
                ],

                'users' => [
                    'total' => $totalUsers,
                    'change' => $calculateChange(
                        $monthUsers,
                        $previousMonthUsers,
                    ),
                ],

                'orders' => [
                    'total' => $totalPaidOrders,
                    'month' => $monthOrders,
                    'change' => $calculateChange(
                        $monthOrders,
                        $previousMonthOrders,
                    ),
                ],

                'revenue' => [
                    'total' => (float) $totalRevenue,
                    'month' => (float) $monthRevenue,
                    'change' => $calculateChange(
                        $monthRevenue,
                        $previousMonthRevenue,
                    ),
                ],
            ],

            'sales' => $sales,
            'recentOrders' => $recentOrders,
            'topDrops' => $topDrops,
            'currency' => $currency,
        ]);
    }
}