import { useAuth } from "@/context/AuthContext";
import { LeaveCalendar } from "@/components/timeoff/LeaveCalendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalendarPage() {
    const { isAdmin } = useAuth();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-foreground">Company Calendar</h1>
                <p className="text-muted-foreground">
                    View approved leaves, holidays, and important dates across the organization.
                </p>
            </div>

            <Card className="border-border">
                <CardHeader>
                    <CardTitle>Leave & Schedule Overview</CardTitle>
                    <CardDescription>
                        {isAdmin
                            ? "Manage and view all employee leaves and schedules."
                            : "View your team's availability and your own schedule."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LeaveCalendar />
                </CardContent>
            </Card>
        </div>
    );
}
