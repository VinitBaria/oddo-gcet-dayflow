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
  Download
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Attendance() {
  const { isAdmin, user } = useAuth();
  const { employees, attendanceRecords } = useHR();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  // Get attendance records - admin sees all, employee sees their own
  const filteredRecords = isAdmin 
    ? attendanceRecords 
    : attendanceRecords.filter(r => r.userId === user?.id);

  // Join with employee data and filter
  const recordsWithEmployees = filteredRecords.map(record => {
    const employee = employees.find(e => e.id === record.userId);
    return { ...record, employee };
  }).filter(r => {
    if (!searchQuery) return true;
    const fullName = `${r.employee?.firstName} ${r.employee?.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Calculate stats
  const totalRecords = filteredRecords.length;
  const presentCount = filteredRecords.filter(r => r.status === 'present').length;
  const onLeaveCount = filteredRecords.filter(r => r.status === 'on_leave').length;
  const absentCount = filteredRecords.filter(r => r.status === 'absent').length;

  // Calculate total hours worked
  const totalHoursWorked = filteredRecords.reduce((acc, r) => acc + (r.workHours || 0), 0);
  const totalOvertime = filteredRecords.reduce((acc, r) => acc + (r.extraHours || 0), 0);

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
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
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
              Present
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{presentCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0}% attendance
            </p>
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
              {recordsWithEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-muted-foreground">
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                recordsWithEmployees.map((record) => (
                  <TableRow key={record.id} className="border-border">
                    {isAdmin && (
                      <TableCell className="font-medium">
                        {record.employee?.firstName} {record.employee?.lastName}
                      </TableCell>
                    )}
                    <TableCell>{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{record.checkIn || '-'}</TableCell>
                    <TableCell>{record.checkOut || '-'}</TableCell>
                    <TableCell>{record.workHours ? `${record.workHours}h` : '-'}</TableCell>
                    <TableCell className={record.extraHours && record.extraHours > 0 ? 'text-success font-medium' : ''}>
                      {record.extraHours ? `+${record.extraHours}h` : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
