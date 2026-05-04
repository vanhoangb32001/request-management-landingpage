import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge, STATUS_OPTIONS } from "@/components/StatusBadge";
import { TicketDetailDialog } from "@/components/TicketDetailDialog";
import { auth, ticketApi } from "@/lib/ticketApi";
import type { Ticket, TicketStatus } from "@/lib/ticketApi";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  Trash2,
  Ticket as TicketIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";


const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const Dashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[2]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [websiteFilter, setWebsiteFilter] = useState<string>("all");
  const [websiteOptions, setWebsiteOptions] = useState<string[]>([]);
  const [active, setActive] = useState<Ticket | null>(null);
  const [deleting, setDeleting] = useState<Ticket | null>(null);
  const [deletingLoad, setDeletingLoad] = useState(false);
  const user = auth.getUser();

  useEffect(() => {
    if (!auth.getToken()) navigate("/login", { replace: true });
  }, [navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (websiteFilter !== "all") filters.website = websiteFilter;
      if (search) filters.full_name = { $like: `%${search}%` };

      const res = await ticketApi.list({
        filters,
        sortField: "created_at",
        sortOrder: "DESC",
        page,
        pageSize,
      });
      setTickets(res.responseData.rows);
      setCount(res.responseData.count);
      setWebsiteOptions((prev) => {
        const set = new Set(prev);
        res.responseData.rows.forEach((r) => r.website && set.add(r.website));
        return Array.from(set).sort();
      });
    } catch (err) {
      toast({
        title: "Không tải được dữ liệu",
        description: err instanceof Error ? err.message : "Lỗi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, websiteFilter]);

  useEffect(() => {
    load();
  }, [load, pageSize]);

  const onLogout = () => {
    auth.clear();
    navigate("/login", { replace: true });
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const onDelete = async () => {
    if (!deleting) return;
    setDeletingLoad(true);
    try {
      await ticketApi.remove(deleting.id);
      toast({ title: "Đã xóa ticket" });
      setDeleting(null);
      load();
    } catch (err) {
      toast({
        title: "Xóa thất bại",
        description: err instanceof Error ? err.message : "Lỗi",
        variant: "destructive",
      });
    } finally {
      setDeletingLoad(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <TicketIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold leading-tight">Quản lý Ticket</h1>
              <p className="text-xs text-muted-foreground">
                {user?.email || "Admin"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
          </Button>
        </div>
      </header>

      <section className="container mx-auto py-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Tổng" value={count} />
          <StatCard
            label="Mới"
            value={tickets.filter((t) => t.status === "OPEN").length}
            tone="new"
          />
          <StatCard
            label="Đang xử lý"
            value={tickets.filter((t) => t.status === "IN_PROGRESS").length}
            tone="processing"
          />
          <StatCard
            label="Đã giải quyết"
            value={tickets.filter((t) => t.status === "RESOLVED").length}
            tone="completed"
          />
        </div>

        <Card className="p-4">
          <form
            onSubmit={onSearch}
            className="flex flex-col md:flex-row gap-3 md:items-end"
          >
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Tìm theo tên
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Nguyễn Văn A..."
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5 md:w-48">
              <label className="text-xs font-medium text-muted-foreground">
                Website
              </label>
              <Select value={websiteFilter} onValueChange={(v) => { setWebsiteFilter(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {websiteOptions.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:w-48">
              <label className="text-xs font-medium text-muted-foreground">
                Trạng thái
              </label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">
              <Search className="w-4 h-4 mr-2" /> Lọc
            </Button>
            <Button type="button" variant="outline" onClick={() => load()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </form>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tạo lúc</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Không có ticket nào
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((t) => (
                    <TableRow
                      key={t.id}
                      className="cursor-pointer"
                      onClick={() => setActive(t)}
                    >
                      <TableCell className="font-medium">{t.full_name}</TableCell>
                      <TableCell className="text-sm">
                        <div>{t.phone_number}</div>
                        {t.email && <div className="text-muted-foreground text-xs">{t.email}</div>}
                      </TableCell>
                      <TableCell className="text-sm">{t.website}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {t.message}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={t.status as TicketStatus} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {t.created_at ? new Date(t.created_at).toLocaleString("vi-VN") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleting(t);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Trang {page}/{totalPages} · {count} ticket
            </p>
            <div className="flex gap-2 items-center">
              <span className="text-xs">Hiển thị:</span>
              <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-[80px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map(opt => (
                    <SelectItem key={opt} value={String(opt)}>{opt} / trang</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <TicketDetailDialog
        ticket={active}
        open={!!active}
        onClose={() => setActive(null)}
        onUpdated={load}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa ticket của <strong>{deleting?.full_name}</strong>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingLoad}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
              disabled={deletingLoad}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingLoad && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

const TONE: Record<string, string> = {
  new: "text-[hsl(var(--status-new))]",
  processing: "text-[hsl(var(--status-processing))]",
  completed: "text-[hsl(var(--status-completed))]",
};

const StatCard = ({ label, value, tone }: { label: string; value: number; tone?: string }) => (
  <Card className="p-4">
    <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={`text-2xl font-bold mt-1 ${tone ? TONE[tone] : ""}`}>{value}</p>
  </Card>
);

export default Dashboard;