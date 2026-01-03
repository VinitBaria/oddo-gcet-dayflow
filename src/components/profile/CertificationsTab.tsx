import React, { useState } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";

interface CertificationsTabProps {
    user: User;
    onAddCertificate: (file: File, name: string) => Promise<void>;
    isOwnerOrAdmin: boolean;
}

export const CertificationsTab: React.FC<CertificationsTabProps> = ({ user, onAddCertificate, isOwnerOrAdmin }) => {
    const [newCertName, setNewCertName] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (!selectedFile || !newCertName) return;

        setUploading(true);
        try {
            await onAddCertificate(selectedFile, newCertName);
            setNewCertName("");
            setSelectedFile(null);
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.certificates?.map((cert, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{cert.name}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(cert.uploadDate).toLocaleDateString()}</p>
                                </div>
                                <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="sm">View</Button>
                                </a>
                            </div>
                        ))}

                        {(!user.certificates || user.certificates.length === 0) && (
                            <p className="text-muted-foreground col-span-2 text-center py-4">No certifications added yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {isOwnerOrAdmin && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add Certification</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="space-y-2 flex-1">
                                <Label htmlFor="certName">Certificate Name</Label>
                                <Input
                                    id="certName"
                                    value={newCertName}
                                    onChange={(e) => setNewCertName(e.target.value)}
                                    placeholder="e.g. React Native Expert"
                                />
                            </div>
                            <div className="space-y-2 flex-1">
                                <Label htmlFor="certFile">Upload Document</Label>
                                <Input
                                    id="certFile"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                />
                            </div>
                            <Button onClick={handleUpload} disabled={!selectedFile || !newCertName || uploading}>
                                {uploading ? "Uploading..." : "Add Certificate"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
