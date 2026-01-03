import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter,
  Plane,
  UserX
} from "lucide-react";
import { mockEmployees } from "@/data/mockData";
import { User, AttendanceStatus } from "@/types";
import { useState } from "react";

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

const EmployeeCard = ({ employee, onClick }: { employee: User; onClick: () => void }) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <Card 
      className="group cursor-pointer border-border transition-all hover:shadow-md hover:border-primary/30"
      onClick={onClick}
    >
      <CardContent className="relative p-6">
        <StatusIndicator status={employee.status} />
        
        <div className="flex flex-col items-center text-center">
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
  );
};

export default function Employees() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'all'>('all');

  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = 
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: mockEmployees.length,
    present: mockEmployees.filter(e => e.status === 'present').length,
    on_leave: mockEmployees.filter(e => e.status === 'on_leave').length,
    absent: mockEmployees.filter(e => e.status === 'absent').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employee Directory</h1>
          <p className="text-muted-foreground">
            Manage and view all team members
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
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

      {/* Employee Grid */}
      {filteredEmployees.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onClick={() => navigate(`/employees/${employee.id}`)}
            />
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <UserX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">No employees found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
