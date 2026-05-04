import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, STATUS_OPTIONS } from "./StatusBadge";
import type { Ticket, TicketStatus } from "@/lib/ticketApi";
import { ticketApi } from "@/lib/ticketApi";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mail, Phone, Globe, Calendar } from "lucide-react";

interface Props {
  ticket: Ticket | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const ALLOWED: Record<TicketStatus, TicketStatus[]> = {
  New: ["New", "Processing", "Cancelled"],
  Processing: ["Processing", "Completed", "Cancelled"],
  Completed: ["Completed"],
  Cancelled: ["Cancelled"],
};

export const TicketDetailDialog = ({ ticket, open, onClose, onUpdated }: Props) => {
  const [status, setStatus] = useState<TicketStatus>("New");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ticket) setStatus(ticket.status);
  }, [ticket]);

  if (!ticket) return null;

  const allowed = ALLOWED[ticket.status];
  const isFinal = ticket.status === "Completed" || ticket.status === "Cancelled";

  const onSave = async () => {
    if (status === ticket.status) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await ticketApi.update(ticket.id, { status });
      toast({ title: "Đã cập nhật trạng thái" });
      onUpdated();
      onClose();
    } catch (err) {
      toast({
        title: "Cập nhật thất bại",
        description: err instanceof Error ? err.message : "Lỗi",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {ticket.full_name}
            <StatusBadge status={ticket.status} />
          </DialogTitle>
          <DialogDescription>Chi tiết yêu cầu #{ticket.id.slice(0, 8)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoRow icon={<Phone className="w-4 h-4" />} label="Điện thoại" value={ticket.phone_number} />
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={ticket.email || "—"} />
            <InfoRow icon={<Globe className="w-4 h-4" />} label="Website" value={ticket.website} />
            <InfoRow
              icon={<Calendar className="w-4 h-4" />}
              label="Tạo lúc"
              value={new Date(ticket.created_at).toLocaleString("vi-VN")}
            />
          </div>

          <div>
            <Label className="text-xs uppercase text-muted-foreground tracking-wider">Nội dung</Label>
            <div className="mt-1.5 p-4 rounded-lg bg-muted/60 text-sm whitespace-pre-wrap leading-relaxed">
              {ticket.message}
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase text-muted-foreground tracking-wider">Trạng thái</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as TicketStatus)}
              disabled={isFinal}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.filter((o) => allowed.includes(o.value)).map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isFinal && (
              <p className="text-xs text-muted-foreground mt-2">
                Trạng thái này là trạng thái cuối, không thể thay đổi.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={onSave} disabled={saving || isFinal || status === ticket.status}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div>
    <div className="flex items-center gap-1.5 text-xs uppercase text-muted-foreground tracking-wider">
      {icon}
      {label}
    </div>
    <div className="mt-1 font-medium break-words">{value}</div>
  </div>
);