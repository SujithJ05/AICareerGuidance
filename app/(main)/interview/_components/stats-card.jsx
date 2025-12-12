"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const StatsCard = ({ assessments }) => {
  const getAverageScore = () => {
    if (!assessments?.length) return 0;
    const total = assessments.reduce(
      (sum, assessment) => sum + assessment.quizScore,
      0
    );
    return (total / assessments.length).toFixed(1);
  };

  const getLatestAssessment = () => {
    if (!assessments?.length) return null;
    return assessments[0];
  };
  const getTotalQuestions = () => {
    if (!assessments?.length) return 0;
    return assessments.reduce(
      (sum, assessment) => sum + assessment.questions.length,
      0
    );
  };
  const cardData = [
    {
      key: "average",
      content: (
        <>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageScore()}%</div>
            <p className="text-xs text-muted-foreground">
              Across all assessments
            </p>
          </CardContent>
        </>
      ),
    },
    {
      key: "latest",
      content: (
        <>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const latest = getLatestAssessment();
              if (!latest) {
                return (
                  <>
                    <div className="text-2xl font-bold">–</div>
                    <p className="text-xs text-muted-foreground">
                      No assessments yet
                    </p>
                  </>
                );
              }
              return (
                <>
                  <div className="text-2xl font-bold">{latest.quizScore}%</div>
                  <p className="text-xs text-muted-foreground">
                    on {new Date(latest.createdAt).toLocaleDateString()}
                  </p>
                </>
              );
            })()}
          </CardContent>
        </>
      ),
    },
    {
      key: "total",
      content: (
        <>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalQuestions()}</div>
          </CardContent>
        </>
      ),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cardData.map((card, i) => (
        <motion.div
          key={card.key}
          custom={i}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: {
              delay: i * 0.08,
              type: "spring",
              stiffness: 80,
              damping: 15,
            },
          }}
          whileHover={{
            scale: 1.03,
            boxShadow: "0 8px 32px 0 rgba(80, 0, 200, 0.10)",
            transition: { type: "spring", stiffness: 200, damping: 12 },
          }}
          viewport={{ once: true, amount: 0.2 }}
          className="h-full"
        >
          <Card className="h-full">{card.content}</Card>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCard;
