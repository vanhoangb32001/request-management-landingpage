import type { TicketStatus } from "@/lib/ticketApi";
import { cn } from "@/lib/utils";

const STYLES: Record<TicketStatus, { label: string; cls: string }> = {
  OPEN: { label: "Mới", cls: "bg-[hsl(var(--status-new)/0.15)] text-[hsl(var(--status-new))] border-[hsl(var(--status-new)/0.3)]" },
  IN_PROGRESS: { label: "Đang xử lý", cls: "bg-[hsl(var(--status-processing)/0.15)] text-[hsl(var(--status-processing))] border-[hsl(var(--status-processing)/0.3)]" },
  PENDING: { label: "Chờ xử lý", cls: "bg-[hsl(var(--status-cancelled)/0.15)] text-[hsl(var(--status-cancelled))] border-[hsl(var(--status-cancelled)/0.3)]" },
  RESOLVED: { label: "Đã giải quyết", cls: "bg-[hsl(var(--status-completed)/0.15)] text-[hsl(var(--status-completed))] border-[hsl(var(--status-completed)/0.3)]" },
  CLOSED: { label: "Đã đóng", cls: "bg-muted text-muted-foreground border-border" },
};

export const StatusBadge = ({ status }: { status: TicketStatus }) => {
  const s = STYLES[status] ?? { label: status, cls: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border", s.cls)}>
      {s.label}
    </span>
  );
};

export const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "OPEN", label: "Mới" },
  { value: "IN_PROGRESS", label: "Đang xử lý" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "RESOLVED", label: "Đã giải quyết" },
  { value: "CLOSED", label: "Đã đóng" },
];