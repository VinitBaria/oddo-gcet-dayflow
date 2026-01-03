import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHR } from "@/context/HRContext";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export const LeaveCalendar = () => {
    const { leaveRequests, employees } = useHR();
    const { user, isAdmin } = useAuth();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [departmentFilter, setDepartmentFilter] = useState<string>("all");

    // Get unique departments
    const departments = Array.from(new Set(employees.map(e => e.department)));

    // Filter requests based on role and filters
    const acceptedRequests = leaveRequests.filter(req => req.status === 'approved');

    const filteredRequests = acceptedRequests.filter(req => {
        // Role filter
        if (!isAdmin && req.userId !== user?.id) return false;

        // Department filter (Admin only)
        if (isAdmin && departmentFilter !== "all") {
            const employee = employees.find(e => e.id === req.userId);
            if (employee?.department !== departmentFilter) return false;
        }

        return true;
    });

    const hasLeave = (date: Date) => {
        return filteredRequests.some(req => {
            const start = new Date(req.startDate);
            const end = new Date(req.endDate);
            // Normalize time to compare just dates
            const d = new Date(date).setHours(0, 0, 0, 0);
            const s = new Date(start).setHours(0, 0, 0, 0);
            const e = new Date(end).setHours(0, 0, 0, 0);
            return d >= s && d <= e;
        });
    };

    const getLeaveTypeForDate = (date: Date) => {
        const req = filteredRequests.find(req => {
            const start = new Date(req.startDate);
            const end = new Date(req.endDate);
            const d = new Date(date).setHours(0, 0, 0, 0);
            const s = new Date(start).setHours(0, 0, 0, 0);
            const e = new Date(end).setHours(0, 0, 0, 0);
            return d >= s && d <= e;
        });
        return req?.type;
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
                <Card className="border-border shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Calendar View</CardTitle>
                            {isAdmin && (
                                <div className="w-[200px]">
                                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Departments" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Departments</SelectItem>
                                            {departments.map(dept => (
                                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border shadow p-4 w-full max-w-full"
                            classNames={{
                                month: "space-y-4 w-full",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex w-full justify-between",
                                row: "flex w-full mt-2 justify-between",
                                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-muted flex items-center justify-center transition-all rounded-md",
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                day_today: "bg-accent text-accent-foreground",
                            }}
                            modifiers={{
                                paid: (date) => getLeaveTypeForDate(date) === 'paid',
                                sick: (date) => getLeaveTypeForDate(date) === 'sick',
                                unpaid: (date) => getLeaveTypeForDate(date) === 'unpaid',
                            }}
                            modifiersClassNames={{
                                paid: "bg-green-100 text-green-900 font-bold hover:bg-green-200 rounded-md",
                                sick: "bg-red-100 text-red-900 font-bold hover:bg-red-200 rounded-md",
                                unpaid: "bg-blue-100 text-blue-900 font-bold hover:bg-blue-200 rounded-md",
                            }}
                        // Remove custom DayContent to let standard day render with our background styles
                        // We need to override the default 'day' class to allow full width/height filling if needed
                        // But usually, modifying the 'day' class in classNames matches the button.
                        // Let's ensure the button takes full space.
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="w-full lg:w-[350px] space-y-6">
                <Card className="h-full border-border shadow-md">
                    <CardHeader>
                        <CardTitle>
                            {date ? format(date, "MMMM d, yyyy") : "Select a date"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {date && (
                            <div className="space-y-4">
                                {filteredRequests.filter(req => {
                                    const start = new Date(req.startDate);
                                    const end = new Date(req.endDate);
                                    const d = new Date(date).setHours(0, 0, 0, 0);
                                    const s = new Date(start).setHours(0, 0, 0, 0);
                                    const e = new Date(end).setHours(0, 0, 0, 0);
                                    return d >= s && d <= e;
                                }).length > 0 ? (
                                    filteredRequests.filter(req => {
                                        const start = new Date(req.startDate);
                                        const end = new Date(req.endDate);
                                        const d = new Date(date).setHours(0, 0, 0, 0);
                                        const s = new Date(start).setHours(0, 0, 0, 0);
                                        const e = new Date(end).setHours(0, 0, 0, 0);
                                        return d >= s && d <= e;
                                    }).map(req => (
                                        <div key={req.id} className="flex flex-col gap-2 p-4 border rounded-lg bg-card/50 hover:bg-card transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="font-semibold text-lg">{req.userName}</div>
                                                <Badge variant={
                                                    req.type === 'sick' ? 'destructive' :
                                                        req.type === 'paid' ? 'default' : 'secondary'
                                                } className="capitalize">{req.type} Leave</Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                                "{req.reason}"
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <span className="inline-block w-2 h-2 rounded-full bg-primary/50"></span>
                                                {new Date(req.startDate).getDate() === new Date(req.endDate).getDate()
                                                    ? '1 Day'
                                                    : `${format(new Date(req.startDate), 'MMM d')} - ${format(new Date(req.endDate), 'MMM d')}`
                                                }
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground opacity-50">
                                        <span className="text-4xl mb-2">📅</span>
                                        <p>No leaves scheduled for this date.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {!date && (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground opacity-50">
                                <span className="text-4xl mb-2">👆</span>
                                <p>Select a date on the calendar to view details.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
