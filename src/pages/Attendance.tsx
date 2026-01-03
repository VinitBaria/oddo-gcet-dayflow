import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHR } from "@/context/HRContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Search,
  Clock,
  TrendingUp,
  Calendar as CalendarCheck,
  AlertCircle,
  Download,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { EmployeeDialog } from "@/components/admin/EmployeeDialog";
import { AttendanceRecord, User } from "@/types";

interface DailyAttendanceRowProps {
  date: string;
  employee: User;
  records: AttendanceRecord[];
  isAdmin: boolean;
}

const DailyAttendanceRow = ({ date, employee, records, isAdmin }: DailyAttendanceRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Aggregate data
  const earliestCheckIn = records.reduce((earliest, r) => {
    if (!r.checkIn) return earliest;
    return !earliest || r.checkIn < earliest ? r.checkIn : earliest;
  }, '' as string);

  const latestCheckOut = records.reduce((latest, r) => {
    if (!r.checkOut) return latest;
    return !latest || r.checkOut > latest ? r.checkOut : latest;
  }, '' as string);

  const totalWorkHours = records.reduce((sum, r) => sum + (r.workHours || 0), 0);
  const totalExtraHours = records.reduce((sum, r) => sum + (r.extraHours || 0), 0);

  const lastRecord = records[records.length - 1];
  // If "latestCheckOut" exists, use it. If not, and we have active record, show active
  const isActive = records.some(r => !r.checkOut);
  const displayCheckOut = isActive ? 'Active' : (latestCheckOut || '-');

  const status = isActive ? 'present' : (records.length > 0 ? 'present' : 'absent');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-success/10 text-success border-success/20">Present</Badge>;
      case 'on_leave':
        return <Badge className="bg-info/10 text-info border-info/20">On Leave</Badge>;
      case 'absent':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Absent</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <TableRow
        className={cn("border-border hover:bg-muted/50 cursor-pointer", isExpanded && "bg-muted/50")}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isAdmin && (
          <TableCell className="font-medium">
            {employee.firstName} {employee.lastName}
          </TableCell>
        )}
        <TableCell className="flex items-center gap-2">
          {records.length > 1 && (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
          {format(new Date(date), 'MMM d, yyyy')}
        </TableCell>
        <TableCell>{earliestCheckIn || '-'}</TableCell>
        <TableCell>{displayCheckOut}</TableCell>
        <TableCell>{totalWorkHours > 0 ? `${totalWorkHours.toFixed(2)}h` : '-'}</TableCell>
        <TableCell className={totalExtraHours > 0 ? 'text-success font-medium' : ''}>
          {totalExtraHours > 0 ? `+${totalExtraHours.toFixed(2)}h` : '-'}
        </TableCell>
        <TableCell>{getStatusBadge(status)}</TableCell>
      </TableRow>
      {isExpanded && records.map((record, idx) => (
        <TableRow key={record.id} className="bg-muted/30 hover:bg-muted/30 border-0">
          {isAdmin && <TableCell></TableCell>}
          <TableCell className="pl-8 text-xs text-muted-foreground">Session {idx + 1}</TableCell>
          <TableCell className="text-xs text-muted-foreground">{record.checkIn}</TableCell>
          <TableCell className="text-xs text-muted-foreground">{record.checkOut || 'Active'}</TableCell>
          <TableCell className="text-xs text-muted-foreground">{record.workHours ? `${record.workHours}h` : '-'}</TableCell>
          <TableCell className="text-xs text-muted-foreground">{record.extraHours ? `+${record.extraHours}h` : '-'}</TableCell>
          <TableCell></TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default function Attendance() {
  const { isAdmin, user } = useAuth();
  const { employees, attendanceRecords, manualAttendance } = useHR();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  // Manual Attendance State
  const [isManualAttendanceOpen, setIsManualAttendanceOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [manualUserId, setManualUserId] = useState("");
  const [manualDate, setManualDate] = useState("");
  const [manualCheckIn, setManualCheckIn] = useState("");
  const [manualCheckOut, setManualCheckOut] = useState("");

  const handleManualAttendance = async () => {
    if (!manualUserId || !manualDate || !manualCheckIn) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill in all required fields." });
      return;
    }

    try {
      // Calculate hours if checkout is present
      let workHours = 0;
      let extraHours = 0;

      if (manualCheckOut) {
        const start = new Date(`2000-01-01T${manualCheckIn}`);
        const end = new Date(`2000-01-01T${manualCheckOut}`);
        workHours = (end.getTime() - start.getTime()) / 3600000;
        extraHours = Math.max(0, workHours - 8);
      }

      await manualAttendance({
        userId: manualUserId,
        date: manualDate,
        checkIn: manualCheckIn,
        checkOut: manualCheckOut,
        workHours: parseFloat(workHours.toFixed(2)),
        extraHours: parseFloat(extraHours.toFixed(2)),
        status: manualCheckOut ? 'present' : 'present',
      });

      toast({ title: "Attendance recorded" });
      setIsManualAttendanceOpen(false);
      // Reset form
      setManualUserId("");
      setManualDate("");
      setManualCheckIn("");
      setManualCheckOut("");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save attendance." });
    }
  };

  // Filter Records
  const filteredRecords = isAdmin
    ? attendanceRecords
    : attendanceRecords.filter(r => r.userId === user?.id);

  const filteredEmployees = employees.filter(employee => {
    if (!searchQuery) return true;
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Calculate stats
  const totalRecords = filteredRecords.length; // Counts sessions, maybe we want unique days?
  // Let's keep it simple for now or aggregate by unique days per user? 
  // For the stats cards, counting total sessions is fine or unique check-ins.

  const presentCount = new Set(filteredRecords.filter(r => r.status === 'present').map(r => `${r.userId}-${r.date}`)).size;
  // const onLeaveCount = ... (This logic needs to come from Leaves not just Attendance records if we want true 'On Leave' status not just marked in attendance)
  // But assuming we mark attendance with 'on_leave' manually or via system:
  // const onLeaveCount = filteredRecords.filter(r => r.status === 'on_leave').length;

  const totalHoursWorked = filteredRecords.reduce((acc, r) => acc + (r.workHours || 0), 0);
  const totalOvertime = filteredRecords.reduce((acc, r) => acc + (r.extraHours || 0), 0);

  // Grouping Logic for Table
  // We want to show 1 row per Employee + Date combination.
  // If a date is selected, we filter by that date.
  // If no date is selected, we show history? Usually attendance defaults to Today or a Range.
  // The current UI has a single date picker.

  // Implementation:
  // Iterate through filteredEmployees.
  // For each employee, if date selected -> show that date row (even if empty? Yes, to show absent).
  // If no date selected -> show all dates they have records for? Or just recent?
  // Let's stick to the current behavior:
  // If date selected: show 1 row per employee for that date.
  // If NO date selected: Show all history? That might be too much.
  // Current code: `date ? new Date(r.date)... === ... : true`

  // Let's refine: 
  // If date is selected, we iterate employees and show their status for that day.
  // If NO date is selected, we iterate all unique (userId, date) pairs in history?
  // Or just show recent records.
  // Let's replicate the existing logic but grouped.

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isAdmin ? "Attendance Management" : "My Attendance"}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? "Track and manage employee attendance" : "View your attendance history"}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={() => setIsManualAttendanceOpen(true)} className="gap-2">
              <Clock className="h-4 w-4" />
              Add Attendance
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Records
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalRecords}</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Present (Days)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{presentCount}</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Hours Worked
            </CardTitle>
            <Clock className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalHoursWorked.toFixed(1)}h</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overtime Hours
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalOvertime.toFixed(1)}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {isAdmin && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Clear Date Button */}
        {date && (
          <Button variant="ghost" onClick={() => setDate(undefined)}>
            Clear Date
          </Button>
        )}
      </div>

      {/* Attendance Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {isAdmin && <TableHead>Employee</TableHead>}
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Work Hours</TableHead>
                <TableHead>Overtime</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => {
                  // Logic: 
                  // If Date Selected: Show 1 row for that date.
                  // If NO Date Selected: Show all dates available for this user?
                  // The previous logic was: map employees -> map filteredRecords (by date if present).

                  if (date) {
                    const dateString = format(date, 'yyyy-MM-dd');
                    const dayRecords = filteredRecords.filter(r =>
                      r.userId === employee.id && r.date === dateString
                    );

                    return (
                      <DailyAttendanceRow
                        key={`${employee.id}-${dateString}`}
                        date={dateString}
                        employee={employee}
                        records={dayRecords}
                        isAdmin={isAdmin}
                      />
                    );
                  } else {
                    // If no date selected, we should ideally show a list of recent days?
                    // Or just show all available records grouped by date?
                    // Let's get unique dates for this employee from records
                    const employeeRecords = filteredRecords.filter(r => r.userId === employee.id);
                    const uniqueDates = [...new Set(employeeRecords.map(r => r.date))].sort((a, b) => b.localeCompare(a)); // Descending

                    if (uniqueDates.length === 0) {
                      // Show empty row if no history? Or just skip? 
                      // If isAdmin, we might want to see emptiness.
                      return null;
                    }

                    return uniqueDates.map(d => (
                      <DailyAttendanceRow
                        key={`${employee.id}-${d}`}
                        date={d}
                        employee={employee}
                        records={employeeRecords.filter(r => r.date === d)}
                        isAdmin={isAdmin}
                      />
                    ));
                  }
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <EmployeeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode="add"
      />

      {/* Manual Attendance Dialog */}
      <Dialog open={isManualAttendanceOpen} onOpenChange={setIsManualAttendanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Attendance Record</DialogTitle>
            <DialogDescription>Manually add an attendance record for an employee.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Employee</Label>
              <Select onValueChange={setManualUserId} value={manualUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input type="date" value={manualDate} onChange={e => setManualDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Check In</Label>
                <Input type="time" value={manualCheckIn} onChange={e => setManualCheckIn(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Check Out</Label>
                <Input type="time" value={manualCheckOut} onChange={e => setManualCheckOut(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManualAttendanceOpen(false)}>Cancel</Button>
            <Button onClick={handleManualAttendance}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
