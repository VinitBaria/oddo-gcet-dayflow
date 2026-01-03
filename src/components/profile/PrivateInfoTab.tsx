import React, { useState, useEffect } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PrivateInfoTabProps {
    user: User;
    isEditing: boolean;
    onSave: (data: Partial<User>) => void;
    onCancel: () => void;
}

export const PrivateInfoTab: React.FC<PrivateInfoTabProps> = ({ user, isEditing, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        personalInfo: {
            dob: user.personalInfo?.dob || "",
            address: user.personalInfo?.address || "",
            nationality: user.personalInfo?.nationality || "",
            personalEmail: user.personalInfo?.personalEmail || "",
            gender: user.personalInfo?.gender || "male",
            maritalStatus: user.personalInfo?.maritalStatus || "single",
        },
        bankDetails: {
            accountNumber: user.bankDetails?.accountNumber || "",
            bankName: user.bankDetails?.bankName || "",
            ifscCode: user.bankDetails?.ifscCode || "",
            panNo: user.bankDetails?.panNo || "",
            uanNo: user.bankDetails?.uanNo || "",
        },
    });

    useEffect(() => {
        setFormData({
            personalInfo: {
                dob: user.personalInfo?.dob || "",
                address: user.personalInfo?.address || "",
                nationality: user.personalInfo?.nationality || "",
                personalEmail: user.personalInfo?.personalEmail || "",
                gender: user.personalInfo?.gender || "male",
                maritalStatus: user.personalInfo?.maritalStatus || "single",
            },
            bankDetails: {
                accountNumber: user.bankDetails?.accountNumber || "",
                bankName: user.bankDetails?.bankName || "",
                ifscCode: user.bankDetails?.ifscCode || "",
                panNo: user.bankDetails?.panNo || "",
                uanNo: user.bankDetails?.uanNo || "",
            },
        });
    }, [user]);

    const handleChange = (section: "personalInfo" | "bankDetails", field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const handleSave = () => {
        onSave(formData as unknown as Partial<User>);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                            id="dob"
                            type="date"
                            disabled={!isEditing}
                            value={formData.personalInfo.dob ? new Date(formData.personalInfo.dob).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleChange("personalInfo", "dob", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                            disabled={!isEditing}
                            value={formData.personalInfo.gender}
                            onValueChange={(value) => handleChange("personalInfo", "gender", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maritalStatus">Marital Status</Label>
                        <Select
                            disabled={!isEditing}
                            value={formData.personalInfo.maritalStatus}
                            onValueChange={(value) => handleChange("personalInfo", "maritalStatus", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="married">Married</SelectItem>
                                <SelectItem value="divorced">Divorced</SelectItem>
                                <SelectItem value="widowed">Widowed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nationality">Nationality</Label>
                        <Input
                            id="nationality"
                            disabled={!isEditing}
                            value={formData.personalInfo.nationality}
                            onChange={(e) => handleChange("personalInfo", "nationality", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="personalEmail">Personal Email</Label>
                        <Input
                            id="personalEmail"
                            type="email"
                            disabled={!isEditing}
                            value={formData.personalInfo.personalEmail}
                            onChange={(e) => handleChange("personalInfo", "personalEmail", e.target.value)}
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <Label htmlFor="address">Residing Address</Label>
                        <Input
                            id="address"
                            disabled={!isEditing}
                            value={formData.personalInfo.address}
                            onChange={(e) => handleChange("personalInfo", "address", e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Bank Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                            id="accountNumber"
                            disabled={!isEditing}
                            value={formData.bankDetails.accountNumber}
                            onChange={(e) => handleChange("bankDetails", "accountNumber", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                            id="bankName"
                            disabled={!isEditing}
                            value={formData.bankDetails.bankName}
                            onChange={(e) => handleChange("bankDetails", "bankName", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ifscCode">IFSC Code</Label>
                        <Input
                            id="ifscCode"
                            disabled={!isEditing}
                            value={formData.bankDetails.ifscCode}
                            onChange={(e) => handleChange("bankDetails", "ifscCode", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="panNo">PAN No</Label>
                        <Input
                            id="panNo"
                            disabled={!isEditing}
                            value={formData.bankDetails.panNo}
                            onChange={(e) => handleChange("bankDetails", "panNo", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="uanNo">UAN No</Label>
                        <Input
                            id="uanNo"
                            disabled={!isEditing}
                            value={formData.bankDetails.uanNo}
                            onChange={(e) => handleChange("bankDetails", "uanNo", e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {isEditing && (
                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            )}
        </div>
    );
};
