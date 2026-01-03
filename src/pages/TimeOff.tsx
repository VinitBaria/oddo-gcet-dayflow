import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Plus, 
  CalendarIcon, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  CalendarDays
} from "lucide-react";
import { mockLeaveRequests, mockLeaveBalances, mockEmployees } from "@/data/mockData";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";

export default function TimeOff() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [leaveType, setLeaveType] = useState<string>("");
  const [reason, setReason] = useState("");

  // Get leave data based on role
  const leaveRequests = isAdmin 
    ? mockLeaveRequests 
    : mockLeaveRequests.filter(r => r.userId === user?.id);

  const userBalance = user ? mockLeaveBalances[user.id] : null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/10 text-success border-success/20">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'paid':
        return <Badge variant="secondary">Paid Leave</Badge>;
      case 'sick':
        return <Badge variant="outline">Sick Leave</Badge>;
      case 'unpaid':
        return <Badge variant="outline" className="border-muted-foreground">Unpaid</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const handleSubmitRequest = () => {
    if (!dateRange?.from || !dateRange?.to || !leaveType || !reason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Request Submitted",
      description: "Your leave request has been submitted for approval.",
    });
    setIsDialogOpen(false);
    setDateRange(undefined);
    setLeaveType("");
    setReason("");
  };

  const handleApprove = (id: string) => {
    toast({
      title: "Request Approved",
      description: "The leave request has been approved.",
    });
  };

  const handleReject = (id: string) => {
    toast({
      title: "Request Rejected",
      description: "The leave request has been rejected.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Time Off</h1>
          <p className="text-muted-foreground">
            {isAdmin ? "Manage leave requests and allocations" : "Request and track your time off"}
          </p>
        </div>

        {!isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Request Time Off
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Request Time Off</DialogTitle>
                <DialogDescription>
                  Submit a new leave request for approval.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid Leave ({userBalance?.paid} days available)</SelectItem>
                      <SelectItem value="sick">Sick Leave ({userBalance?.sick} days available)</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          "Select dates"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea 
                    placeholder="Provide a reason for your leave request..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attachment (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to upload
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitRequest}>Submit Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Leave Balance Cards (Employee View) */}
      {!isAdmin && userBalance && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paid Leave
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{userBalance.paid} days</div>
              <p className="text-xs text-muted-foreground">Available balance</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sick Leave
              </CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{userBalance.sick} days</div>
              <p className="text-xs text-muted-foreground">Available balance</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unpaid Leave
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{userBalance.unpaid} days</div>
              <p className="text-xs text-muted-foreground">Used this year</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">
            {isAdmin ? "Leave Requests" : "My Requests"}
          </TabsTrigger>
          {isAdmin && <TabsTrigger value="allocation">Allocation</TabsTrigger>}
        </TabsList>

        <TabsContent value="requests">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>
                {isAdmin ? "All Leave Requests" : "Your Leave Requests"}
              </CardTitle>
              <CardDescription>
                {isAdmin 
                  ? "Review and manage employee leave requests" 
                  : "Track the status of your leave requests"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {isAdmin && <TableHead>Employee</TableHead>}
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((request) => (
                    <TableRow key={request.id} className="border-border">
                      {isAdmin && (
                        <TableCell className="font-medium">{request.userName}</TableCell>
                      )}
                      <TableCell>{getTypeBadge(request.type)}</TableCell>
                      <TableCell>{format(new Date(request.startDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{format(new Date(request.endDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      {isAdmin && (
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleReject(request.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-success hover:text-success hover:bg-success/10"
                                onClick={() => handleApprove(request.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="allocation">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Leave Allocation</CardTitle>
                <CardDescription>
                  View and manage leave balances for all employees
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Employee</TableHead>
                      <TableHead>Paid Leave</TableHead>
                      <TableHead>Sick Leave</TableHead>
                      <TableHead>Unpaid Leave</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockEmployees.map((employee) => {
                      const balance = mockLeaveBalances[employee.id];
                      return (
                        <TableRow key={employee.id} className="border-border">
                          <TableCell className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </TableCell>
                          <TableCell>{balance?.paid || 0} days</TableCell>
                          <TableCell>{balance?.sick || 0} days</TableCell>
                          <TableCell>{balance?.unpaid || 0} days</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
