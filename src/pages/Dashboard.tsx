import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
  Briefcase
} from "lucide-react";
import { mockEmployees, mockLeaveRequests, mockLeaveBalances } from "@/data/mockData";
import { format } from "date-fns";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  // Calculate stats
  const totalEmployees = mockEmployees.length;
  const onLeaveToday = mockEmployees.filter(e => e.status === 'on_leave').length;
  const pendingRequests = mockLeaveRequests.filter(r => r.status === 'pending').length;
  const presentToday = mockEmployees.filter(e => e.status === 'present').length;
  
  const userLeaveBalance = user ? mockLeaveBalances[user.id] : null;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCheckedIn && checkInTime) {
      interval = setInterval(() => {
        const diff = new Date().getTime() - checkInTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime]);

  const handleCheckInOut = () => {
    if (isCheckedIn) {
      setIsCheckedIn(false);
      setCheckInTime(null);
      setElapsedTime("00:00:00");
      toast({
        title: "Checked Out",
        description: `You have successfully checked out at ${format(new Date(), 'hh:mm a')}`,
      });
    } else {
      setIsCheckedIn(true);
      setCheckInTime(new Date());
      toast({
        title: "Welcome back!",
        description: `Check-in recorded at ${format(new Date(), 'hh:mm a')}`,
      });
    }
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
                {isCheckedIn ? "You're currently working" : "Ready to start your day?"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Elapsed Time</p>
                  <p className="text-4xl font-mono font-bold text-foreground">{elapsedTime}</p>
                </div>
                {checkInTime && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Checked In At</p>
                    <p className="text-lg font-medium text-foreground">
                      {format(checkInTime, 'hh:mm a')}
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
              className={`h-24 w-32 flex-col gap-2 rounded-xl font-medium transition-all ${
                isCheckedIn 
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
                  : 'bg-success hover:bg-success/90 text-success-foreground'
              }`}
            >
              {isCheckedIn ? (
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
                  {Math.round((presentToday / totalEmployees) * 100)}% attendance rate
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
                <div className="text-2xl font-bold text-foreground">{pendingRequests}</div>
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

      {/* Recent Activity / Pending Requests */}
      {isAdmin && pendingRequests > 0 && (
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
              {mockLeaveRequests
                .filter(r => r.status === 'pending')
                .map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {request.userName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{request.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="capitalize">
                        {request.type}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                          Reject
                        </Button>
                        <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground">
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
    </div>
  );
}
