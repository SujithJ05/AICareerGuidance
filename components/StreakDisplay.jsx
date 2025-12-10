"use client";
import { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function StreakDisplay() {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await fetch("/api/streak");
        if (res.ok) {
          const data = await res.json();
          setStreak(data);
        }
      } catch (error) {
        console.error("Error fetching streak:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStreak();
  }, []);

  if (loading || !streak) {
    return null;
  }

  const getStreakColor = (count) => {
    if (count >= 30) return "text-purple-500";
    if (count >= 14) return "text-orange-500";
    if (count >= 7) return "text-yellow-500";
    if (count >= 3) return "text-orange-400";
    return "text-gray-400";
  };

  const getFlameAnimation = (count) => {
    if (count >= 7) return "animate-pulse";
    return "";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full cursor-default">
            <Flame
              className={`w-4 h-4 ${getStreakColor(
                streak.currentStreak
              )} ${getFlameAnimation(streak.currentStreak)}`}
              fill={streak.currentStreak > 0 ? "currentColor" : "none"}
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {streak.currentStreak}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-3">
          <div className="text-center">
            <p className="font-semibold text-sm">
              🔥 {streak.currentStreak} Day Streak
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Longest: {streak.longestStreak} days
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
