import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHR } from "@/context/HRContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  Users,
  Calendar,
  AlertCircle,
  LogIn,
  LogOut,
  TrendingUp,
  Briefcase,
  CheckCircle,
  XCircle
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const {
    employees,
    leaveRequests,
    leaveBalances,
    checkIn,
    checkOut,
    activeSession, // Use activeSession from context
    approveLeaveRequest,
    rejectLeaveRequest
  } = useHR();
  const { toast } = useToast();
  // Removed local isCheckedIn and checkInTime state
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  // Calculate stats
  const totalEmployees = employees.length;
  const onLeaveToday = employees.filter(e => e.status === 'on_leave').length;
  const pendingRequests = leaveRequests.filter(r => r.status === 'pending');
  const presentToday = employees.filter(e => e.status === 'present').length;

  const userLeaveBalance = user ? leaveBalances[user.id] : null;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Check if there is an active session
    if (activeSession?.checkIn && !activeSession.checkOut) {
      const calculateTime = () => {
        // Assumes activeSession.date is YYYY-MM-DD
        // We need to parse correctly ensuring we don't get Invalid Date issues
        const now = new Date();
        const checkInDate = new Date(`${activeSession.date}T${activeSession.checkIn}`);

        if (isNaN(checkInDate.getTime())) return "00:00:00";

        const diff = now.getTime() - checkInDate.getTime();
        if (diff < 0) return "00:00:00"; // Should not happen ideally

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      };

      setElapsedTime(calculateTime()); // update immediately

      interval = setInterval(() => {
        setElapsedTime(calculateTime());
      }, 1000);
    } else {
      setElapsedTime("00:00:00");
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  // Sync state with attendance records on load - NO LONGER NEEDED as we use activeSession directly
  // Removed the useEffect that set local IsCheckedIn state based on attendanceRecords

  const handleCheckInOut = async () => {
    if (!user) return;

    if (activeSession) {
      await checkOut(user.id);
      // setIsCheckedIn(false); // No longer needed
      // setCheckInTime(null); // No longer needed
      setElapsedTime("00:00:00");
      toast({
        title: "Checked Out",
        description: `You have successfully checked out at ${format(new Date(), 'hh:mm a')}`,
      });
    } else {
      await checkIn(user.id);
      // setIsCheckedIn(true); // No longer needed
      // setCheckInTime(new Date()); // No longer needed
      toast({
        title: "Welcome back!",
        description: `Check-in recorded at ${format(new Date(), 'hh:mm a')}`,
      });
    }
  };

  const handleApprove = (id: string, userName: string) => {
    approveLeaveRequest(id);
    toast({
      title: "Request Approved",
      description: `Leave request for ${userName} has been approved.`,
    });
  };

  const handleReject = (id: string, userName: string) => {
    rejectLeaveRequest(id);
    toast({
      title: "Request Rejected",
      description: `Leave request for ${userName} has been rejected.`,
      variant: "destructive",
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* Check In/Out Card */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Time Tracking
              </CardTitle>
              <CardDescription>
                {activeSession ? "You're currently working" : "Ready to start your day?"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Elapsed Time</p>
                  <p className="text-4xl font-mono font-bold text-foreground">{elapsedTime}</p>
                </div>
                {activeSession && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Checked In At</p>
                    <p className="text-lg font-medium text-foreground">
                      {(() => {
                        if (!activeSession.checkIn) return '-';
                        try {
                          const [h, m] = activeSession.checkIn.split(':');
                          const d = new Date();
                          d.setHours(parseInt(h), parseInt(m));
                          return format(d, 'hh:mm a');
                        } catch { return activeSession.checkIn; }
                      })()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </div>
          <div className="flex items-center justify-center p-6 border-t md:border-t-0 md:border-l border-border bg-muted/30">
            <Button
              size="lg"
              onClick={handleCheckInOut}
              className={`h-24 w-32 flex-col gap-2 rounded-xl font-medium transition-all ${activeSession
                ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                : 'bg-success hover:bg-success/90 text-success-foreground'
                }`}
            >
              {activeSession ? (
                <>
                  <LogOut className="h-6 w-6" />
                  Check Out
                </>
              ) : (
                <>
                  <LogIn className="h-6 w-6" />
                  Check In
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isAdmin ? (
          <>
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Employees
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground">Active team members</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Present Today
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{presentToday}</div>
                <p className="text-xs text-muted-foreground">
                  {totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0}% attendance rate
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  On Leave Today
                </CardTitle>
                <Calendar className="h-4 w-4 text-info" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{onLeaveToday}</div>
                <p className="text-xs text-muted-foreground">Approved time off</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Requests
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{pendingRequests.length}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Paid Leave
                </CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {userLeaveBalance?.paid || 0} days
                </div>
                <p className="text-xs text-muted-foreground">Available balance</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sick Leave
                </CardTitle>
                <Calendar className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {userLeaveBalance?.sick || 0} days
                </div>
                <p className="text-xs text-muted-foreground">Available balance</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Working Days
                </CardTitle>
                <Briefcase className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">22</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Days Worked
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-info" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">18</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Pending Leave Requests (Admin View) */}
      {isAdmin && pendingRequests.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Pending Leave Requests
            </CardTitle>
            <CardDescription>Review and approve employee leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {request.userName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{request.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <Badge variant="secondary" className="capitalize">
                      {request.type}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleReject(request.id, request.userName)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90 text-success-foreground"
                        onClick={() => handleApprove(request.id, request.userName)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions for Admin */}
      {isAdmin && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border cursor-pointer hover:border-primary/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Manage Employees</p>
                <p className="text-sm text-muted-foreground">Add, edit, or remove team members</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border cursor-pointer hover:border-primary/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="font-medium text-foreground">Time Off Requests</p>
                <p className="text-sm text-muted-foreground">{pendingRequests.length} pending approvals</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border cursor-pointer hover:border-primary/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Attendance Reports</p>
                <p className="text-sm text-muted-foreground">View attendance analytics</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
