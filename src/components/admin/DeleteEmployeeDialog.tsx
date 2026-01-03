import { useHR } from "@/context/HRContext";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

interface DeleteEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: User | null;
}

export function DeleteEmployeeDialog({ open, onOpenChange, employee }: DeleteEmployeeDialogProps) {
  const { deleteEmployee } = useHR();
  const { toast } = useToast();

  const handleDelete = () => {
    if (employee) {
      deleteEmployee(employee.id);
      toast({
        title: "Employee Deleted",
        description: `${employee.firstName} ${employee.lastName} has been removed from the system.`,
        variant: "destructive",
      });
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Employee</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{employee?.firstName} {employee?.lastName}</strong>? 
            This action cannot be undone. All associated data including attendance records and leave history will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Employee
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
