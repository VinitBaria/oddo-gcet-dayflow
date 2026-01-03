import { useState } from "react";
import { useHR } from "@/context/HRContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { User, LeaveBalance } from "@/types";

interface LeaveBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: User | null;
}

export function LeaveBalanceDialog({ open, onOpenChange, employee }: LeaveBalanceDialogProps) {
  const { leaveBalances, updateLeaveBalance } = useHR();
  const { toast } = useToast();
  
  const currentBalance = employee ? leaveBalances[employee.id] : null;
  
  const [balance, setBalance] = useState<LeaveBalance>({
    paid: currentBalance?.paid || 0,
    sick: currentBalance?.sick || 0,
    unpaid: currentBalance?.unpaid || 0,
  });

  const handleSubmit = () => {
    if (employee) {
      updateLeaveBalance(employee.id, balance);
      toast({
        title: "Leave Balance Updated",
        description: `Leave balance for ${employee.firstName} ${employee.lastName} has been updated.`,
      });
      onOpenChange(false);
    }
  };

  // Update local state when dialog opens with new employee
  useState(() => {
    if (employee && leaveBalances[employee.id]) {
      setBalance(leaveBalances[employee.id]);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Leave Balance</DialogTitle>
          <DialogDescription>
            Update leave allocation for {employee?.firstName} {employee?.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="paid">Paid Leave (days)</Label>
            <Input
              id="paid"
              type="number"
              min="0"
              value={balance.paid}
              onChange={(e) => setBalance(prev => ({ ...prev, paid: parseInt(e.target.value) || 0 }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sick">Sick Leave (days)</Label>
            <Input
              id="sick"
              type="number"
              min="0"
              value={balance.sick}
              onChange={(e) => setBalance(prev => ({ ...prev, sick: parseInt(e.target.value) || 0 }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unpaid">Unpaid Leave Used (days)</Label>
            <Input
              id="unpaid"
              type="number"
              min="0"
              value={balance.unpaid}
              onChange={(e) => setBalance(prev => ({ ...prev, unpaid: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
