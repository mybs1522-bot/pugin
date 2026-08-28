"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Filter, Users, Clock, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ActivityStat {
  label: string;
  value: number;
  color: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatarUrl: string;
}

interface MarketingDashboardProps {
  title?: string;
  teamActivities?: {
    totalHours: number;
    stats: ActivityStat[];
  };
  team: {
    memberCount: number;
    members: TeamMember[];
    label?: string;
  };
  cta: {
    text: string;
    buttonText: string;
    onButtonClick: () => void;
  };
  onFilterClick?: () => void;
  className?: string;
}

const AnimatedNumber = ({
  value,
  integer = false,
}: {
  value: number;
  integer?: boolean;
}) => {
  const count = useMotionValue(0);
  const display = useTransform(count, (latest) =>
    integer
      ? Math.round(latest).toLocaleString()
      : String(Math.round(latest * 10) / 10)
  );

  React.useEffect(() => {
    const controls = animate(count, value, { duration: 0.9, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{display}</motion.span>;
};

export const MarketingDashboard = React.forwardRef<
  HTMLDivElement,
  MarketingDashboardProps
>(
  (
    {
      title = "Marketing Activities",
      teamActivities,
      team,
      cta,
      onFilterClick,
      className,
    },
    ref
  ) => {
    const teamLabel = team.label ?? "Team";
    const containerVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    };
    const itemVariants = {
      hidden: { opacity: 0, y: 15 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };
    const hoverTransition = {
      type: "spring" as const,
      stiffness: 300,
      damping: 15,
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "bg-card text-card-foreground w-full max-w-2xl rounded-xl border p-4 sm:rounded-2xl sm:p-6",
          className
        )}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="mb-4 flex items-center justify-between sm:mb-6"
        >
          <h2 className="text-base font-bold sm:text-2xl">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onFilterClick}
            aria-label="Filter activities"
          >
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div
          className={cn(
            "grid grid-cols-1 gap-3.5 sm:gap-4",
            teamActivities && "md:grid-cols-2"
          )}
        >
          {/* Team Activities Card — only rendered when data provided */}
          {teamActivities && (
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              transition={hoverTransition}
            >
              <Card className="h-full overflow-hidden rounded-xl p-3.5 sm:p-4">
                <CardContent className="p-1 sm:p-2">
                  <div className="mb-3 flex items-center justify-between sm:mb-4">
                    <p className="text-muted-foreground text-xs font-medium sm:text-sm">
                      Renders Created
                    </p>
                    <Clock className="text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="mb-3 sm:mb-4">
                    <span className="text-3xl font-bold sm:text-4xl">
                      <AnimatedNumber value={teamActivities.totalHours} />
                    </span>
                    <span className="text-muted-foreground ml-1 text-xs sm:text-sm">
                      k renders
                    </span>
                  </div>
                  <div className="bg-muted mb-2 flex h-2 w-full overflow-hidden rounded-full">
                    {teamActivities.stats.map((stat, index) => (
                      <motion.div
                        key={index}
                        className={cn("h-full", stat.color)}
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    ))}
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between text-[11px] sm:text-xs">
                    {teamActivities.stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="flex items-center gap-1.5"
                      >
                        <span
                          className={cn("h-2 w-2 rounded-full", stat.color)}
                        />
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Team Members Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            transition={hoverTransition}
          >
            <Card className="h-full overflow-hidden rounded-xl border-lime-200 bg-lime-50 p-3.5 sm:p-4 dark:border-lime-800 dark:bg-lime-900/30">
              <CardContent className="p-1 sm:p-2">
                <div className="mb-3 flex items-center justify-between sm:mb-4">
                  <p className="text-xs font-medium text-lime-900 sm:text-sm dark:text-lime-200">
                    {teamLabel}
                  </p>
                  <Users className="h-4 w-4 text-lime-900 sm:h-5 sm:w-5 dark:text-lime-200" />
                </div>
                <div className="mb-4 sm:mb-6">
                  <span className="text-3xl font-bold text-lime-950 sm:text-4xl dark:text-lime-50">
                    <AnimatedNumber value={team.memberCount} integer />
                  </span>
                  <span className="ml-1 text-xs text-lime-800 sm:text-sm dark:text-lime-300">
                    users
                  </span>
                </div>
                <div className="flex -space-x-2">
                  {team.members.slice(0, 4).map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.2, zIndex: 10, y: -2 }}
                    >
                      <Avatar className="h-7 w-7 border-2 border-lime-100 sm:h-8 sm:w-8 dark:border-lime-900">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* CTA Banner */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={hoverTransition}
          className="mt-3.5 sm:mt-4"
        >
          <div className="bg-muted/60 flex flex-col items-stretch gap-3 rounded-xl p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="bg-background shrink-0 rounded-full p-1.5 sm:p-2">
                <Zap className="text-foreground h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="text-muted-foreground text-xs font-medium sm:text-sm">
                {cta.text}
              </p>
            </div>
            <Button
              onClick={cta.onButtonClick}
              className="w-full shrink-0 text-xs sm:w-auto sm:text-sm"
            >
              {cta.buttonText}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 sm:ml-2 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }
);

MarketingDashboard.displayName = "MarketingDashboard";
