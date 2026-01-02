"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProgressStats({ userId }) {
  const [stats, setStats] = useState({
    coursesCompleted: 0,
    totalCourses: 0,
    certificatesEarned: 0,
    interviewsCompleted: 0,
    currentStreak: 0,
    totalLearningTime: 0,
    skillsLearned: 0,
    weeklyProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressStats();
  }, [userId]);

  const fetchProgressStats = async () => {
    try {
      const response = await fetch("/api/user/progress");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const completionRate =
    stats.totalCourses > 0
      ? Math.round((stats.coursesCompleted / stats.totalCourses) * 100)
      : 0;

  const statsCards = [
    {
      title: "Courses Completed",
      value: stats.coursesCompleted,
      total: stats.totalCourses,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Certificates Earned",
      value: stats.certificatesEarned,
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Current Streak",
      value: `${stats.currentStreak} days`,
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Interviews Done",
      value: stats.interviewsCompleted,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Progress</h2>
          <p className="text-muted-foreground">
            Track your learning journey and achievements
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <TrendingUp className="mr-2 h-4 w-4" />
          {stats.weeklyProgress}% this week
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {stat.value}
                      {stat.total && (
                        <span className="text-sm text-muted-foreground">
                          /{stat.total}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall Completion Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-semibold">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stats.coursesCompleted} of {stats.totalCourses} courses completed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Learning Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Learning Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {Math.floor(stats.totalLearningTime / 60)}
            </span>
            <span className="text-muted-foreground">hours</span>
            <span className="text-xl font-semibold ml-2">
              {stats.totalLearningTime % 60}
            </span>
            <span className="text-muted-foreground">minutes</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Total time invested in learning
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
