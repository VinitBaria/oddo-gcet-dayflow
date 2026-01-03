import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHR } from "@/context/HRContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserX,
  LayoutGrid,
  List,
  Plane
} from "lucide-react";
import { User, AttendanceStatus } from "@/types";
import { EmployeeDialog } from "@/components/admin/EmployeeDialog";
import { DeleteEmployeeDialog } from "@/components/admin/DeleteEmployeeDialog";
import { format } from "date-fns";

const StatusBadge = ({ status }: { status: AttendanceStatus }) => {
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

const StatusIndicator = ({ status }: { status: AttendanceStatus }) => {
  switch (status) {
    case 'present':
      return (
        <div className="absolute top-3 right-3">
          <div className="h-3 w-3 rounded-full bg-success shadow-sm" title="Present" />
        </div>
      );
    case 'on_leave':
      return (
        <div className="absolute top-3 right-3">
          <div className="h-6 w-6 rounded-full bg-info/20 flex items-center justify-center" title="On Leave">
            <Plane className="h-3 w-3 text-info" />
          </div>
        </div>
      );
    case 'absent':
      return (
        <div className="absolute top-3 right-3">
          <div className="h-3 w-3 rounded-full bg-warning shadow-sm" title="Absent" />
        </div>
      );
    default:
      return null;
  }
};

export default function Employees() {
  const navigate = useNavigate();
  const { employees } = useHR();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: employees.length,
    present: employees.filter(e => e.status === 'present').length,
    on_leave: employees.filter(e => e.status === 'on_leave').length,
    absent: employees.filter(e => e.status === 'absent').length,
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleEdit = (employee: User) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (employee: User) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employee Directory</h1>
          <p className="text-muted-foreground">
            Manage and view all team members ({employees.length} total)
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, ID, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {(['all', 'present', 'on_leave', 'absent'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
                <Badge 
                  variant="secondary" 
                  className={`ml-2 ${statusFilter === status ? 'bg-primary-foreground/20 text-primary-foreground' : ''}`}
                >
                  {statusCounts[status]}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 border border-border rounded-lg p-1">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'ghost'} 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'table' ? 'default' : 'ghost'} 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Employee List */}
      {filteredEmployees.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEmployees.map((employee) => (
              <Card 
                key={employee.id}
                className="group cursor-pointer border-border transition-all hover:shadow-md hover:border-primary/30"
              >
                <CardContent className="relative p-6">
                  <StatusIndicator status={employee.status} />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 left-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => navigate(`/employees/${employee.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(employee)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(employee)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <div 
                    className="flex flex-col items-center text-center"
                    onClick={() => navigate(`/employees/${employee.id}`)}
                  >
                    <Avatar className="h-20 w-20 mb-4 ring-2 ring-border group-hover:ring-primary/30 transition-all">
                      <AvatarImage src={employee.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                        {getInitials(employee.firstName, employee.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {employee.jobTitle}
                    </p>
                    
                    <Badge variant="secondary" className="mt-3">
                      {employee.department}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(employee.firstName, employee.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                            <p className="text-sm text-muted-foreground">{employee.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{employee.employeeId}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.jobTitle}</TableCell>
                      <TableCell>{format(new Date(employee.joinDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell><StatusBadge status={employee.status} /></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/employees/${employee.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(employee)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(employee)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      ) : (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <UserX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">No employees found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Employee
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <EmployeeDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        mode="add" 
      />
      
      <EmployeeDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        employee={selectedEmployee || undefined}
        mode="edit" 
      />
      
      <DeleteEmployeeDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        employee={selectedEmployee}
      />
    </div>
  );
}
