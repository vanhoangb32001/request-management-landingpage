import React from "react";

const ICONS = {
	info: (
		<svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01"/></svg>
	),
	success: (
		<svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4"/></svg>
	),
	warning: (
		<svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01"/></svg>
	),
	error: (
		<svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01"/></svg>
	),
};

const COLORS = {
	info: "bg-blue-50 border-blue-400 text-blue-800",
	success: "bg-green-50 border-green-400 text-green-800",
	warning: "bg-yellow-50 border-yellow-400 text-yellow-800",
	error: "bg-red-50 border-red-400 text-red-800",
};

export type NotificationType = "info" | "success" | "warning" | "error";

interface NotificationProps {
	type?: NotificationType;
	title?: string;
	message: string;
	onClose?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
	type = "info",
	title,
	message,
	onClose,
}) => {
	return (
		<div className={`flex items-start gap-3 border-l-4 rounded-md p-4 shadow-md mb-2 ${COLORS[type]}`}> 
			<div className="mt-1">{ICONS[type]}</div>
			<div className="flex-1">
				{title && <div className="font-semibold mb-1">{title}</div>}
				<div>{message}</div>
			</div>
			{onClose && (
				<button
					onClick={onClose}
					className="ml-2 text-xl font-bold text-gray-400 hover:text-gray-700 focus:outline-none"
					aria-label="Đóng thông báo"
				>
					×
				</button>
			)}
		</div>
	);
};