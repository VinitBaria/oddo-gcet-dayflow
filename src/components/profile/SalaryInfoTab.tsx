import React, { useState, useEffect } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SalaryInfoTabProps {
    user: User;
    isEditing: boolean;
    isAdmin: boolean; // Only admin can edit
    onSave: (data: Partial<User>) => void;
    onCancel: () => void;
}

export const SalaryInfoTab: React.FC<SalaryInfoTabProps> = ({ user, isEditing, isAdmin, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        wageType: user.salaryInfo?.wageType || "monthly",
        monthlyWage: user.salaryInfo?.monthlyWage || 0,
        basicSalary: user.salaryInfo?.basicSalary || 0,
        hra: user.salaryInfo?.hra || 0,
        standardAllowance: user.salaryInfo?.standardAllowance || 0,
        performanceBonus: user.salaryInfo?.performanceBonus || 0,
        leaveTravelAllowance: user.salaryInfo?.leaveTravelAllowance || 0,
        fixedAllowance: user.salaryInfo?.fixedAllowance || 0,
        pfEmployee: user.salaryInfo?.pfEmployee || 0,
        pfEmployer: user.salaryInfo?.pfEmployer || 0,
        professionalTax: user.salaryInfo?.professionalTax || 0,
    });

    useEffect(() => {
        setFormData({
            wageType: user.salaryInfo?.wageType || "monthly",
            monthlyWage: user.salaryInfo?.monthlyWage || 0,
            basicSalary: user.salaryInfo?.basicSalary || 0,
            hra: user.salaryInfo?.hra || 0,
            standardAllowance: user.salaryInfo?.standardAllowance || 0,
            performanceBonus: user.salaryInfo?.performanceBonus || 0,
            leaveTravelAllowance: user.salaryInfo?.leaveTravelAllowance || 0,
            fixedAllowance: user.salaryInfo?.fixedAllowance || 0,
            pfEmployee: user.salaryInfo?.pfEmployee || 0,
            pfEmployer: user.salaryInfo?.pfEmployer || 0,
            professionalTax: user.salaryInfo?.professionalTax || 0,
        });
    }, [user]);

    // Auto-calculation logic
    useEffect(() => {
        if (isEditing && isAdmin) {
            const wage = Number(formData.monthlyWage);

            // Basic = 50% of Wage
            const basic = wage * 0.5;
            // HRA = 50% of Basic
            const hra = basic * 0.5;
            // Standard Allowance = ~16.67% of Basic (or fixed logic) - let's use fixed logic from sketch if possible
            // Sketch says: Standard Allowance 4167 (16.67%), Performance Bonus 2082 (8.33%), etc.
            // Let's implement dynamic percentages based on Basic or Wage.

            // Using sketch percentages based on BASIC or WAGE? Sketch says "50% of Basic for HRA".

            const standardAllowance = wage * 0.0833; // Approx
            const performanceBonus = wage * 0.0416;
            const lta = wage * 0.0416;
            const fixedAllowance = wage * 0.05; // Balancing figure

            // PF = 12% of Basic
            const pf = basic * 0.12;

            // Avoid infinite loops by checking values, but for now we set them if wage changes?
            // Actually, we should only update derived values if Wage changes, but React state updates can be tricky.
            // Instead, we calculate these when Wage changes.
        }
    }, [formData.monthlyWage, isEditing, isAdmin]);

    const handleWageChange = (value: string) => {
        const wage = Number(value);
        const basic = wage * 0.5;

        setFormData(prev => ({
            ...prev,
            monthlyWage: wage,
            basicSalary: basic,
            hra: basic * 0.5,
            standardAllowance: basic * 0.1667, // Assuming 1/6
            performanceBonus: basic * 0.0833,
            leaveTravelAllowance: basic * 0.0833,
            fixedAllowance: wage - (basic + (basic * 0.5) + (basic * 0.1667) + (basic * 0.0833) + (basic * 0.0833)), // Remaining
            pfEmployee: basic * 0.12,
            pfEmployer: basic * 0.12,
            professionalTax: 200 // Fixed
        }));
    };

    const handleSave = () => {
        onSave({ salaryInfo: formData } as unknown as Partial<User>);
    };

    // If not admin, isEditing should be false for this tab, or we force disabled.
    const canEdit = isEditing && isAdmin;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Salary Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Wage Type</Label>
                            <Select
                                disabled={!canEdit}
                                value={formData.wageType}
                                onValueChange={(v) => setFormData(prev => ({ ...prev, wageType: v as any }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="hourly">Hourly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Monthly Wage / Rate</Label>
                            <Input
                                type="number"
                                disabled={!canEdit}
                                value={formData.monthlyWage}
                                onChange={(e) => handleWageChange(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold">Salary Components</h3>
                        <div className="grid grid-cols-2 gap-4">

                            <div className="space-y-1">
                                <Label>Basic Salary</Label>
                                <Input disabled value={formData.basicSalary.toFixed(2)} />
                                <p className="text-xs text-muted-foreground">50% of Wage</p>
                            </div>

                            <div className="space-y-1">
                                <Label>HRA</Label>
                                <Input disabled value={formData.hra.toFixed(2)} />
                                <p className="text-xs text-muted-foreground">50% of Basic</p>
                            </div>

                            <div className="space-y-1">
                                <Label>Standard Allowance</Label>
                                <Input disabled value={formData.standardAllowance.toFixed(2)} />
                            </div>

                            <div className="space-y-1">
                                <Label>Performance Bonus</Label>
                                <Input disabled value={formData.performanceBonus.toFixed(2)} />
                            </div>

                            <div className="space-y-1">
                                <Label>LTA</Label>
                                <Input disabled value={formData.leaveTravelAllowance.toFixed(2)} />
                            </div>

                            <div className="space-y-1">
                                <Label>Fixed Allowance</Label>
                                <Input disabled value={formData.fixedAllowance.toFixed(2)} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold">Deductions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>PF (Employee)</Label>
                                <Input disabled value={formData.pfEmployee.toFixed(2)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Professional Tax</Label>
                                <Input disabled value={formData.professionalTax.toFixed(2)} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {canEdit && (
                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            )}
        </div>
    );
};
