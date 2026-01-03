import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Building2,
  Briefcase,
  MapPin,
  CreditCard,
  Shield,
  Heart,
  Edit
} from "lucide-react";
import { mockEmployees } from "@/data/mockData";
import { format } from "date-fns";

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  
  // Find the employee - if no ID, show current user's profile
  const employee = id 
    ? mockEmployees.find(e => e.id === id) 
    : mockEmployees.find(e => e.id === user?.id);

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-muted-foreground">Employee not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const isOwnProfile = user?.id === employee.id;
  const canEdit = isAdmin || isOwnProfile;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {id && (
        <Button 
          variant="ghost" 
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Button>
      )}

      {/* Profile Header */}
      <Card className="border-border overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent" />
        <CardContent className="relative pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16">
            <Avatar className="h-32 w-32 ring-4 ring-background shadow-lg">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-semibold">
                {getInitials(employee.firstName, employee.lastName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 sm:mb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-2xl font-bold text-foreground">
                  {employee.firstName} {employee.lastName}
                </h1>
                <Badge variant="secondary" className="w-fit capitalize">
                  {employee.role}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">{employee.jobTitle}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {employee.department}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {employee.email}
                </span>
              </div>
            </div>

            {canEdit && (
              <Button variant="outline" className="gap-2 self-start sm:self-auto">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="about" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="private">Private Info</TabsTrigger>
          {(isAdmin || isOwnProfile) && (
            <TabsTrigger value="salary">Salary Info</TabsTrigger>
          )}
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Work Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Employee ID</Label>
                    <p className="font-medium text-foreground">{employee.employeeId}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Department</Label>
                    <p className="font-medium text-foreground">{employee.department}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Job Title</Label>
                    <p className="font-medium text-foreground">{employee.jobTitle}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Join Date</Label>
                    <p className="font-medium text-foreground">
                      {format(new Date(employee.joinDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">What I love about my job</Label>
                  <Textarea 
                    className="mt-2 resize-none" 
                    placeholder="Share what you love about your work..."
                    defaultValue="I enjoy collaborating with my team and solving complex problems together."
                    readOnly={!canEdit}
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">My Interests</Label>
                  <Textarea 
                    className="mt-2 resize-none" 
                    placeholder="Share your interests..."
                    defaultValue="Photography, hiking, and learning new technologies."
                    readOnly={!canEdit}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Private Info Tab */}
        <TabsContent value="private" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue={employee.phone} readOnly={!canEdit} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue={employee.email} readOnly={!canEdit} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Home Address</Label>
                  <Textarea 
                    id="address" 
                    defaultValue="123 Main Street, Apt 4B, New York, NY 10001"
                    readOnly={!canEdit}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency-name">Contact Name</Label>
                  <Input id="emergency-name" defaultValue="Jane Doe" readOnly={!canEdit} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency-relation">Relationship</Label>
                  <Input id="emergency-relation" defaultValue="Spouse" readOnly={!canEdit} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency-phone">Phone Number</Label>
                  <Input id="emergency-phone" defaultValue="+1 (555) 000-1234" readOnly={!canEdit} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Salary Info Tab - Only for Admin or Own Profile */}
        {(isAdmin || isOwnProfile) && (
          <TabsContent value="salary" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Salary Structure
                </CardTitle>
                <CardDescription>
                  {isAdmin ? "Manage employee compensation" : "View your compensation details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="basic">Basic Salary</Label>
                    <Input 
                      id="basic" 
                      type="number" 
                      defaultValue="5000" 
                      readOnly={!isAdmin}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hra">HRA (50% of Basic)</Label>
                    <Input 
                      id="hra" 
                      type="number" 
                      defaultValue="2500" 
                      readOnly
                      className="font-mono bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allowances">Allowances</Label>
                    <Input 
                      id="allowances" 
                      type="number" 
                      defaultValue="1000" 
                      readOnly={!isAdmin}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pf">PF Contribution (12%)</Label>
                    <Input 
                      id="pf" 
                      type="number" 
                      defaultValue="600" 
                      readOnly
                      className="font-mono bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wage-type">Wage Type</Label>
                    <Input 
                      id="wage-type" 
                      defaultValue="Monthly" 
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gross">Gross Salary</Label>
                    <Input 
                      id="gross" 
                      type="number" 
                      defaultValue="7900" 
                      readOnly
                      className="font-mono bg-muted font-semibold"
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h4 className="font-medium text-foreground mb-4">Bank Details</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bank">Bank Name</Label>
                      <Input id="bank" defaultValue="Chase Bank" readOnly={!canEdit} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account">Account Number</Label>
                      <Input id="account" defaultValue="****4567" readOnly={!canEdit} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Account Security
              </CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isOwnProfile && (
                <div className="max-w-md space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" placeholder="Enter current password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" placeholder="Enter new password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                  </div>
                  <Button>Update Password</Button>
                </div>
              )}

              {isAdmin && !isOwnProfile && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Role</Label>
                    <p className="font-medium text-foreground capitalize mt-1">{employee.role}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Account Status</Label>
                    <div className="mt-1">
                      <Badge className="bg-success text-success-foreground">Active</Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button variant="outline">Reset Password</Button>
                    <Button variant="destructive">Deactivate Account</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
