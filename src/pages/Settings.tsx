import { useState } from "react";
import { useHR } from "@/context/HRContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Building2, 
  Clock, 
  Calendar,
  Bell,
  Shield,
  Plus,
  Trash2,
  Save,
  Users
} from "lucide-react";

export default function Settings() {
  const { settings, updateSettings, departments, addDepartment, removeDepartment, employees } = useHR();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [localSettings, setLocalSettings] = useState(settings);
  const [newDepartment, setNewDepartment] = useState("");
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    updateSettings(localSettings);
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const handleAddDepartment = () => {
    if (newDepartment.trim()) {
      if (departments.includes(newDepartment.trim())) {
        toast({
          title: "Department Exists",
          description: "This department already exists.",
          variant: "destructive",
        });
        return;
      }
      addDepartment(newDepartment.trim());
      setNewDepartment("");
      setIsDeptDialogOpen(false);
      toast({
        title: "Department Added",
        description: `${newDepartment} has been added successfully.`,
      });
    }
  };

  const handleRemoveDepartment = (dept: string) => {
    const employeesInDept = employees.filter(e => e.department === dept);
    if (employeesInDept.length > 0) {
      toast({
        title: "Cannot Delete",
        description: `${employeesInDept.length} employees are assigned to this department.`,
        variant: "destructive",
      });
      return;
    }
    removeDepartment(dept);
    toast({
      title: "Department Removed",
      description: `${dept} has been removed.`,
    });
  };

  const getDepartmentCount = (dept: string) => {
    return employees.filter(e => e.department === dept).length;
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground">Only administrators can access settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage system configuration and company policies
          </p>
        </div>
        <Button onClick={handleSaveSettings} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave Policies</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Company Information
              </CardTitle>
              <CardDescription>
                Basic company details and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-md space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={localSettings.companyName}
                  onChange={(e) => handleSettingChange('companyName', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                System Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{employees.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Departments</p>
                  <p className="text-2xl font-bold">{departments.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold">{employees.filter(e => e.role === 'admin').length}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Active Today</p>
                  <p className="text-2xl font-bold">{employees.filter(e => e.status === 'present').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments */}
        <TabsContent value="departments" className="space-y-6">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Department Management
                </CardTitle>
                <CardDescription>
                  Manage company departments and team structure
                </CardDescription>
              </div>
              <Button onClick={() => setIsDeptDialogOpen(true)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Department
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Department Name</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept} className="border-border">
                      <TableCell className="font-medium">{dept}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getDepartmentCount(dept)} employees</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveDepartment(dept)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Settings */}
        <TabsContent value="attendance" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Working Hours
              </CardTitle>
              <CardDescription>
                Configure standard working hours and overtime policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="workingHours">Working Hours Per Day</Label>
                  <Input
                    id="workingHours"
                    type="number"
                    min="1"
                    max="24"
                    value={localSettings.workingHoursPerDay}
                    onChange={(e) => handleSettingChange('workingHoursPerDay', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overtime">Overtime Multiplier</Label>
                  <Input
                    id="overtime"
                    type="number"
                    step="0.1"
                    min="1"
                    max="3"
                    value={localSettings.overtimeMultiplier}
                    onChange={(e) => handleSettingChange('overtimeMultiplier', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Policies */}
        <TabsContent value="leave" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Leave Allocation
              </CardTitle>
              <CardDescription>
                Default leave allocation for new employees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="paidLeave">Default Paid Leave (days/year)</Label>
                  <Input
                    id="paidLeave"
                    type="number"
                    min="0"
                    value={localSettings.defaultPaidLeave}
                    onChange={(e) => handleSettingChange('defaultPaidLeave', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sickLeave">Default Sick Leave (days/year)</Label>
                  <Input
                    id="sickLeave"
                    type="number"
                    min="0"
                    value={localSettings.defaultSickLeave}
                    onChange={(e) => handleSettingChange('defaultSickLeave', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between max-w-xl">
                <div className="space-y-0.5">
                  <Label>Auto-Approve Leave Requests</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve all leave requests without admin review
                  </p>
                </div>
                <Switch
                  checked={localSettings.autoApproveLeave}
                  onCheckedChange={(checked) => handleSettingChange('autoApproveLeave', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between max-w-xl">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for leave requests, attendance, and approvals
                  </p>
                </div>
                <Switch
                  checked={localSettings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Department Dialog */}
      <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
            <DialogDescription>
              Create a new department for your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deptName">Department Name</Label>
              <Input
                id="deptName"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="e.g. Sales, Support, Legal..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeptDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDepartment}>
              Add Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
