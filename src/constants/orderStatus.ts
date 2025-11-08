import React from 'react';
import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react';

export type OrderStatus =
	| 'pending'
	| 'processing'
	| 'shipped'
	| 'cancelled'
	| 'completed';

export const ADMIN_ORDER_STATUSES: OrderStatus[] = [
	'pending',
	'processing',
	'shipped',
	'completed',
	'cancelled'
];

type IconType = React.ComponentType<{ className?: string }>

export const ORDER_STATUS_CONFIG: Record<
	OrderStatus,
	{ bg: string; text: string; icon: IconType; label: string }
> = {
	pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' },
	processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Package, label: 'Processing' },
	shipped: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Truck, label: 'Shipped' },
	completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Completed' },
	cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Cancelled' }
};

export const renderOrderStatusBadge = (status: string) => {
	let key = (status || 'pending') as OrderStatus;
	// Legacy compatibility: treat any 'delivered' string from old docs as 'completed'
	if (status === 'delivered') key = 'completed';
	const cfg = ORDER_STATUS_CONFIG[key] || ORDER_STATUS_CONFIG.pending;
	const Icon = cfg.icon;
	return React.createElement(
		'span',
		{ className: `px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 ${cfg.bg} ${cfg.text} w-fit` },
		React.createElement(Icon, { className: 'h-4 w-4' }),
		cfg.label
	);
};

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export const paymentStatusLabel = (status: string) => {
	const map: Record<string, string> = {
		pending: 'Belum dibayar',
		paid: 'Sudah dibayar',
		failed: 'Pesanan dibatalkan',
		refunded: 'Refund'
	};
	return map[status] || status;
};
