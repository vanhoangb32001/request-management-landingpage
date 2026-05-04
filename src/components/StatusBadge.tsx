import type { TicketStatus } from "@/lib/ticketApi";
import { cn } from "@/lib/utils";

const STYLES: Record<TicketStatus, { label: string; cls: string }> = {
  New: { label: "Mới", cls: "bg-[hsl(var(--status-new)/0.15)] text-[hsl(var(--status-new))] border-[hsl(var(--status-new)/0.3)]" },
  Processing: { label: "Đang xử lý", cls: "bg-[hsl(var(--status-processing)/0.15)] text-[hsl(var(--status-processing))] border-[hsl(var(--status-processing)/0.3)]" },
  Completed: { label: "Hoàn thành", cls: "bg-[hsl(var(--status-completed)/0.15)] text-[hsl(var(--status-completed))] border-[hsl(var(--status-completed)/0.3)]" },
  Cancelled: { label: "Đã hủy", cls: "bg-[hsl(var(--status-cancelled)/0.15)] text-[hsl(var(--status-cancelled))] border-[hsl(var(--status-cancelled)/0.3)]" },
};

export const StatusBadge = ({ status }: { status: TicketStatus }) => {
  const s = STYLES[status];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border", s.cls)}>
      {s.label}
    </span>
  );
};

export const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "New", label: "Mới" },
  { value: "Processing", label: "Đang xử lý" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Cancelled", label: "Đã hủy" },
];