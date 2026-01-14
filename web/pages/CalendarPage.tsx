import React from "react";
import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarItem,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
  Feature
} from "../components/ui/calendar";
import {
  addMonths,
  endOfMonth,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";

const today = new Date();

const statusColors = {
  Scheduled: "#6B7280",
  Active: "#10B981",
  Completed: "#F59E0B"
};

// Mock data adapted for Quizzes
const exampleQuizzes: Feature[] = [
  {
    id: "1",
    name: "Intro to Physics Midterm",
    startAt: startOfMonth(today),
    endAt: subDays(endOfMonth(today), 5),
    status: { id: "1", name: "Completed", color: statusColors.Completed },
  },
  {
    id: "2",
    name: "Calculus 101 Quiz",
    startAt: startOfMonth(subMonths(today, 1)),
    endAt: today,
    status: { id: "2", name: "Active", color: statusColors.Active },
  },
  {
    id: "3",
    name: "History Final Exam",
    startAt: today,
    endAt: addMonths(today, 1),
    status: { id: "3", name: "Scheduled", color: statusColors.Scheduled },
  },
  {
    id: "4",
    name: "Chemistry Lab Safety",
    startAt: addMonths(today, 1),
    endAt: endOfMonth(addMonths(today, 1)),
    status: { id: "3", name: "Scheduled", color: statusColors.Scheduled },
  },
  {
    id: "5",
    name: "Literature Review",
    startAt: subMonths(today, 2),
    endAt: subMonths(today, 1),
    status: { id: "1", name: "Completed", color: statusColors.Completed },
  }
];

const earliestYear = new Date().getFullYear() - 1;
const latestYear = new Date().getFullYear() + 2;

const CalendarPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col p-6 overflow-hidden max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col gap-2 mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold text-foreground font-heading">Calendar</h1>
          <p className="text-muted-foreground">Schedule and track your upcoming quizzes.</p>
      </div>
      
      <div className="flex-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0">
        <CalendarProvider className="h-full flex flex-col">
            <CalendarDate>
                <CalendarDatePicker>
                    <CalendarMonthPicker className="w-40" />
                    <CalendarYearPicker start={earliestYear} end={latestYear} className="w-32" />
                </CalendarDatePicker>
                <CalendarDatePagination />
            </CalendarDate>
            <CalendarHeader />
            <CalendarBody features={exampleQuizzes} children={({ feature }) => <CalendarItem key={feature.id} feature={feature} />} />
        </CalendarProvider>
      </div>
    </div>
  );
};

export default CalendarPage;