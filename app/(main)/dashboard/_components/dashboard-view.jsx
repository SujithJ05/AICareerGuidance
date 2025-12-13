"use client";

import React from "react";

import {
  BriefcaseIcon,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const DashboardView = ({ insights }) => {
  const salaryData = insights.salaryRanges.map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
  }));

  const getDemandLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMarketOutlookInfo = (outlook) => {
    switch (outlook.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-green-500" };
      case "neutral":
        return { icon: LineChart, color: "text-yellow-500" };
      case "negative":
        return { icon: TrendingDown, color: "text-red-500" };
      default:
        return { icon: LineChart, color: "text-gray-500" };
    }
  };

  const OutlookIcon = getMarketOutlookInfo(insights.marketOutlook).icon;
  const outlookColor = getMarketOutlookInfo(insights.marketOutlook).color;
  const nextUpdateDistace = formatDistanceToNow(new Date(insights.nextUpdate), {
    addSuffix: true,
  });

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08,
        type: "spring",
        stiffness: 80,
        damping: 15,
      },
    }),
    hover: {
      scale: 1.04,
      boxShadow: "0 8px 32px 0 rgba(80, 0, 200, 0.10)",
      transition: { type: "spring", stiffness: 200, damping: 12 },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Market Outlook",
            icon: <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />,
            content: (
              <div className="text-2xl font-bold">{insights.marketOutlook}</div>
            ),
          },
          {
            title: "Industry Growth",
            icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
            content: (
              <div className="text-2xl font-bold">
                {insights.growthRate.toFixed(1)}%
              </div>
            ),
          },
          {
            title: "Demand Level",
            icon: <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />,
            content: (
              <div className="text-2xl font-bold">
                {insights.demandLevel.toLowerCase()}{" "}
              </div>
            ),
          },
          {
            title: "Top Skills",
            icon: <Brain className="h-4 w-4 text-muted-foreground" />,
            content: (
              <div className="flex flex-wrap gap-1 w-full">
                {insights.topSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="whitespace-normal break-words max-w-full min-w-0"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            ),
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
            className="h-full"
          >
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>{card.content}</CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ------------trends--------------------------------------------------------------------------------------------------------------- */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Key Industry Trends</CardTitle>
            <CardDescription>
              Current trends shaping the industry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {insights.keyTrends.map((trend, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <span>{trend}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Skills</CardTitle>
            <CardDescription>Skills to consider developing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.recommendedSkills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardView;
