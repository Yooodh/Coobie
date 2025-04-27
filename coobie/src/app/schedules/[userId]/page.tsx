"use client";
import { use } from "react";
import SchedulesViewerPage from "@/app/components/ScheduleViewerPage";

export default function ScheduleUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const resolvedParams = use(params);
  return <SchedulesViewerPage params={resolvedParams} />;
}
