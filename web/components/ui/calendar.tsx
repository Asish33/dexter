'use client';

import React, { type ReactNode, createContext, useContext, useState } from 'react';
import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import { cn } from '../../lib/utils';
import { getDay, getDaysInMonth, isSameDay } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, ChevronUpDownIcon } from '../Icons';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type CalendarState = {
  month: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  year: number;
  setMonth: (month: CalendarState['month']) => void;
  setYear: (year: CalendarState['year']) => void;
};

export const useCalendar = create<CalendarState>()(
  devtools((set) => ({
    month: new Date().getMonth() as CalendarState['month'],
    year: new Date().getFullYear(),
    setMonth: (month: CalendarState['month']) => set(() => ({ month })),
    setYear: (year: CalendarState['year']) => set(() => ({ year })),
  }))
);

type CalendarContextProps = {
  locale: Intl.LocalesArgument;
  startDay: number;
};

const CalendarContext = createContext<CalendarContextProps>({
  locale: 'en-US',
  startDay: 0,
});

export type Status = {
  id: string;
  name: string;
  color: string;
};

export type Feature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: Status;
};

type ComboboxProps = {
  value: string;
  setValue: (value: string) => void;
  data: {
    value: string;
    label: string;
  }[];
  labels: {
    button: string;
    empty: string;
    search: string;
  };
  className?: string;
};

export const monthsForLocale = (
  localeName: Intl.LocalesArgument,
  monthFormat: Intl.DateTimeFormatOptions['month'] = 'long'
) => {
  const format = new Intl.DateTimeFormat(localeName, { month: monthFormat })
    .format;

  return [...new Array(12).keys()].map((m) =>
    format(new Date(Date.UTC(2021, m % 12)))
  );
};

export const daysForLocale = (locale: Intl.LocalesArgument, startDay: number) => {
  const weekdays: string[] = [];
  const baseDate = new Date(2024, 0, startDay);

  for (let i = 0; i < 7; i++) {
    weekdays.push(
      new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(baseDate)
    );
    baseDate.setDate(baseDate.getDate() + 1);
  }

  return weekdays;
};

const Combobox = ({
  value,
  setValue,
  data,
  labels,
  className,
}: ComboboxProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn('w-40 justify-between capitalize', className)}
        >
          {value
            ? data.find((item) => item.value === value)?.label
            : labels.button}
          <ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-0">
        <Command
          filter={(value, search) => {
            const label = data.find((item) => item.value === value)?.label;

            return label?.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={labels.search} />
          <CommandList>
            <CommandEmpty>{labels.empty}</CommandEmpty>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                  className="capitalize"
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

type OutOfBoundsDayProps = {
  day: number;
};

const OutOfBoundsDay: React.FC<OutOfBoundsDayProps> = ({ day }) => (
  <div className="relative h-full w-full bg-gray-50/30 dark:bg-zinc-900/30 p-3 text-muted-foreground/30 text-sm font-medium select-none">
    {day}
  </div>
);

export type CalendarBodyProps = {
  features: Feature[];
  children: (props: {
    feature: Feature;
  }) => ReactNode;
};

export const CalendarBody = ({ features, children }: CalendarBodyProps) => {
  const { month, year } = useCalendar();
  const { startDay } = useContext(CalendarContext);
  const daysInMonth = getDaysInMonth(new Date(year, month, 1));
  const firstDay = (getDay(new Date(year, month, 1)) - startDay + 7) % 7;
  const days: ReactNode[] = [];

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const prevMonthDays = getDaysInMonth(new Date(prevMonthYear, prevMonth, 1));
  const prevMonthDaysArray = Array.from(
    { length: prevMonthDays },
    (_, i) => i + 1
  );

  for (let i = 0; i < firstDay; i++) {
    const day = prevMonthDaysArray[prevMonthDays - firstDay + i];
    if (day) {
      days.push(<OutOfBoundsDay key={`prev-${i}`} day={day} />);
    }
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = isSameDay(date, new Date());
    
    const featuresForDay = features.filter((feature) => {
      return isSameDay(new Date(feature.endAt), date);
    });

    days.push(
      <div
        key={day}
        className={cn(
          "relative flex h-full w-full flex-col gap-2 p-3 text-sm transition-colors",
          isToday ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-gray-50 dark:hover:bg-white/5"
        )}
      >
        <div className="flex items-center justify-between">
            <span className={cn(
                "font-medium",
                isToday ? "text-primary font-bold bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-md" : "text-foreground"
            )}>
                {day}
            </span>
            {isToday && <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Today</span>}
        </div>
        
        <div className="flex flex-col gap-1.5 mt-1 overflow-y-auto scrollbar-hide">
          {featuresForDay.slice(0, 4).map((feature) => children({ feature }))}
          {featuresForDay.length > 4 && (
            <span className="text-xs text-muted-foreground font-medium pl-1">
              +{featuresForDay.length - 4} more
            </span>
          )}
        </div>
      </div>
    );
  }

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextMonthYear = month === 11 ? year + 1 : year;
  const nextMonthDays = getDaysInMonth(new Date(nextMonthYear, nextMonth, 1));
  const nextMonthDaysArray = Array.from(
    { length: nextMonthDays },
    (_, i) => i + 1
  );

  const remainingDays = 7 - ((firstDay + daysInMonth) % 7);
  if (remainingDays < 7) {
    for (let i = 0; i < remainingDays; i++) {
      const day = nextMonthDaysArray[i];
      if (day) {
        days.push(<OutOfBoundsDay key={`next-${i}`} day={day} />);
      }
    }
  }

  return (
    // Infinite view: auto-rows-[1fr] expands rows to fill height
    <div className="grid flex-1 w-full h-full grid-cols-7 auto-rows-[1fr] gap-px bg-gray-200 dark:bg-white/10 border-x border-b border-gray-200 dark:border-white/10 rounded-b-xl overflow-hidden shadow-sm">
      {days.map((dayNode, index) => (
        <div
          key={index}
          className="relative h-full w-full bg-white dark:bg-[#0A0A0A] overflow-hidden min-h-[100px]"
        >
          {dayNode}
        </div>
      ))}
    </div>
  );
};

export type CalendarDatePickerProps = {
  className?: string;
  children: ReactNode;
};

export const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  className,
  children,
}) => (
  <div className={cn('flex items-center gap-2 mb-4', className)}>{children}</div>
);

export type CalendarMonthPickerProps = {
  className?: string;
};

export const CalendarMonthPicker = ({
  className,
}: CalendarMonthPickerProps) => {
  const { month, setMonth } = useCalendar();
  const { locale } = useContext(CalendarContext);

  return (
    <Combobox
      className={className}
      value={month.toString()}
      setValue={(value) =>
        setMonth(Number.parseInt(value) as CalendarState['month'])
      }
      data={monthsForLocale(locale).map((month, index) => ({
        value: index.toString(),
        label: month,
      }))}
      labels={{
        button: 'Select month',
        empty: 'No month found',
        search: 'Search month',
      }}
    />
  );
};

export type CalendarYearPickerProps = {
  className?: string;
  start: number;
  end: number;
};

export const CalendarYearPicker = ({
  className,
  start,
  end,
}: CalendarYearPickerProps) => {
  const { year, setYear } = useCalendar();

  return (
    <Combobox
      className={className}
      value={year.toString()}
      setValue={(value) => setYear(Number.parseInt(value))}
      data={Array.from({ length: end - start + 1 }, (_, i) => ({
        value: (start + i).toString(),
        label: (start + i).toString(),
      }))}
      labels={{
        button: 'Select year',
        empty: 'No year found',
        search: 'Search year',
      }}
    />
  );
};

export type CalendarDatePaginationProps = {
  className?: string;
};

export const CalendarDatePagination = ({
  className,
}: CalendarDatePaginationProps) => {
  const { month, year, setMonth, setYear } = useCalendar();

  const handlePreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth((month - 1) as CalendarState['month']);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth((month + 1) as CalendarState['month']);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button onClick={() => handlePreviousMonth()} variant="ghost" size="icon" className="h-8 w-8">
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      <Button onClick={() => handleNextMonth()} variant="ghost" size="icon" className="h-8 w-8">
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export type CalendarDateProps = {
  children: ReactNode;
};

export const CalendarDate: React.FC<CalendarDateProps> = ({ children }) => (
  <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-white/5">{children}</div>
);

export type CalendarHeaderProps = {
  className?: string;
};

export const CalendarHeader = ({ className }: CalendarHeaderProps) => {
  const { locale, startDay } = useContext(CalendarContext);

  return (
    <div className={cn('grid grid-cols-7 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 backdrop-blur-sm', className)}>
      {daysForLocale(locale, startDay).map((day) => (
        <div key={day} className="py-3 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
          {day}
        </div>
      ))}
    </div>
  );
};

export type CalendarItemProps = {
  feature: Feature;
  className?: string;
};

export const CalendarItem: React.FC<CalendarItemProps> = ({ feature, className }) => (
  <div 
    className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-md border border-transparent hover:border-black/5 dark:hover:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm cursor-pointer transition-all duration-200 group', 
        className
    )} 
    key={feature.id}
  >
    <div
      className="h-2 w-2 shrink-0 rounded-full shadow-sm ring-1 ring-white/20"
      style={{
        backgroundColor: feature.status.color,
      }}
    />
    <span className="truncate text-xs font-medium text-foreground/90 group-hover:text-foreground">{feature.name}</span>
  </div>
);

export type CalendarProviderProps = {
  locale?: Intl.LocalesArgument;
  startDay?: number;
  children: ReactNode;
  className?: string;
};

export const CalendarProvider: React.FC<CalendarProviderProps> = ({
  locale = 'en-US',
  startDay = 0,
  children,
  className,
}) => (
  <CalendarContext.Provider value={{ locale, startDay }}>
    <div className={cn('relative flex flex-col', className)}>{children}</div>
  </CalendarContext.Provider>
);