import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useHR } from "@/context/HRContext";
import { useAuth } from "@/context/AuthContext";
import { Clock, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export const CheckInTimer = () => {
    const { user } = useAuth();
    const { checkIn, checkOut, activeSession } = useHR();
    const [elapsedTime, setElapsedTime] = useState("00:00:00");

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (activeSession?.checkIn && !activeSession.checkOut) {
            // Calculate initial elapsed time directly relative to now
            const calculateTime = () => {
                const now = new Date();
                // Assumes activeSession.date is YYYY-MM-DD
                const checkInDate = new Date(`${activeSession.date}T${activeSession.checkIn}`);

                // Handle cases where system time might account for timezone differently or date parsing issues
                // If checkInDate is invalid, fallback
                if (isNaN(checkInDate.getTime())) return "00:00:00";

                const diff = now.getTime() - checkInDate.getTime();

                if (diff < 0) return "00:00:00"; // Should not happen ideally

                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);

                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            };

            // Update immediately
            setElapsedTime(calculateTime());

            interval = setInterval(() => {
                setElapsedTime(calculateTime());
            }, 1000);
        } else {
            setElapsedTime("00:00:00");
        }

        return () => clearInterval(interval);
    }, [activeSession]);

    if (!user) return null;

    const handleToggle = async () => {
        if (activeSession) {
            await checkOut(user.id);
        } else {
            await checkIn(user.id);
        }
    };

    return (
        <div className="flex items-center gap-2 mr-4">
            <div className={cn(
                "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border",
                activeSession ? "bg-green-50 border-green-200 text-green-700" : "bg-secondary text-muted-foreground"
            )}>
                <Clock className="h-4 w-4" />
                <span className="font-mono font-medium">{elapsedTime}</span>
            </div>

            <Button
                variant={activeSession ? "destructive" : "default"}
                size="sm"
                onClick={handleToggle}
                className={cn("gap-2", activeSession ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700")}
            >
                {activeSession ? (
                    <>
                        <Square className="h-3 w-3 fill-current" />
                        Check Out
                    </>
                ) : (
                    <>
                        <Play className="h-3 w-3 fill-current" />
                        Check In
                    </>
                )}
            </Button>
        </div>
    );
};
