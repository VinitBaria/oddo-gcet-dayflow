import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building2, Mail, Edit, Loader2, Camera } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { User } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { PrivateInfoTab } from "@/components/profile/PrivateInfoTab";
import { SalaryInfoTab } from "@/components/profile/SalaryInfoTab";
import { CertificationsTab } from "@/components/profile/CertificationsTab";

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user: authUser } = useAuth();
  const { toast } = useToast();

  const [employee, setEmployee] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Determine if we show current user or specific employee
  const profileId = id || authUser?.id;
  const isOwnProfile = authUser?.id === employee?.id;
  const canEdit = isAdmin || isOwnProfile;

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!profileId) return;
      try {
        setLoading(true);
        const data = await api.getEmployee(profileId);
        setEmployee(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching profile",
          description: "Could not load employee data."
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [profileId, toast]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !employee) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);

    setUploadingAvatar(true);
    try {
      const updatedUser = await api.updateEmployee(employee.id, formData);
      setEmployee(updatedUser);
      toast({ title: "Profile picture updated" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Could not update profile picture."
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (data: Partial<User>) => {
    if (!employee) return;
    try {
      const updatedUser = await api.updateEmployee(employee.id, data);
      setEmployee(updatedUser);
      setIsEditing(false); // If we were in global edit mode
      toast({ title: "Profile updated successfully" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Could not save changes."
      });
    }
  };

  const handleAddCertificate = async (file: File, name: string) => {
    if (!employee) return;
    try {
      const updatedUser = await api.addCertificate(employee.id, file, name);
      setEmployee(updatedUser);
      toast({ title: "Certificate added" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add certificate",
        description: "Please try again."
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

  // Main UI
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
            <div className="relative">
              <Avatar className="h-32 w-32 ring-4 ring-background shadow-lg">
                <AvatarImage src={employee.avatar} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-semibold">
                  {getInitials(employee.firstName, employee.lastName)}
                </AvatarFallback>
              </Avatar>
              {canEdit && (
                <div className="absolute bottom-0 right-0 p-1 bg-background rounded-full shadow-sm border cursor-pointer hover:bg-muted transition-colors">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    {uploadingAvatar ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5 text-muted-foreground" />}
                  </Label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </div>
              )}
            </div>

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
              <Button
                variant={isEditing ? "default" : "outline"}
                className="gap-2 self-start sm:self-auto"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4" />
                {isEditing ? "Done Editing" : "Edit Profile"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="about" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="about">Resume</TabsTrigger>
          <TabsTrigger value="private">Private Info</TabsTrigger>
          <TabsTrigger value="salary">Salary Info</TabsTrigger>
          <TabsTrigger value="certification">Certification</TabsTrigger>
        </TabsList>

        {/* Resume/About Tab */}
        <TabsContent value="about" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label className="text-muted-foreground">What I love about my job</Label>
                    <Textarea
                      className="mt-2 resize-none"
                      placeholder="Share what you love..."
                      defaultValue={/* We might store this in DB later */ "I love solving problems."}
                      readOnly={!isEditing}
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground">My interests and hobbies</Label>
                    <Textarea
                      className="mt-2 resize-none"
                      placeholder="Share your interests..."
                      readOnly={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Skills? */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <Label className="font-semibold mb-2 block">Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">React</Badge>
                    <Badge variant="outline">TypeScript</Badge>
                    <Badge variant="outline">Node.js</Badge>
                    {isEditing && <Button variant="ghost" size="sm" className="h-6 text-xs">+ Add</Button>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Private Info Tab */}
        <TabsContent value="private">
          <PrivateInfoTab
            user={employee}
            isEditing={isEditing && isOwnProfile} // Only owner can edit personal info
            onSave={handleSaveProfile}
            onCancel={() => setIsEditing(false)}
          />
        </TabsContent>

        {/* Salary Info Tab */}
        <TabsContent value="salary">
          {(isAdmin || isOwnProfile) ? (
            <SalaryInfoTab
              user={employee}
              isEditing={isEditing}
              isAdmin={isAdmin} // SalaryTab handles "only admin can edit" internally using this prop
              onSave={handleSaveProfile}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                You do not have permission to view this section.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Certification Tab */}
        <TabsContent value="certification">
          <CertificationsTab
            user={employee}
            onAddCertificate={handleAddCertificate}
            isOwnerOrAdmin={canEdit}
          />
        </TabsContent>

      </Tabs>
    </div>
  );
}
