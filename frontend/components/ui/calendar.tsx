"use client"

import * as React from "react"
import { DayPicker, useNavigation } from "react-day-picker"
import { format, setMonth, setYear } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      fromYear={2020}
      toYear={2030}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-8 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-2 relative items-center",
        caption_label: "text-[10px] font-black uppercase tracking-widest",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "secondary" }),
          "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-black hover:text-white rounded-lg transition-all border-(--border)"
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-(--foreground-subtle) rounded-md w-9 font-black text-[9px] uppercase tracking-tighter",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-xl [&:has([aria-selected].day-outside)]:bg-transparent [&:has([aria-selected])]:bg-gray-100/50 first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-bold hover:bg-black hover:text-white rounded-lg transition-all text-xs"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white rounded-lg font-black",
        day_today: "bg-blue-500/10 text-blue-600 font-black",
        day_outside:
          "day-outside text-gray-300 opacity-50 aria-selected:bg-gray-50 aria-selected:text-gray-300",
        day_disabled: "text-gray-200 opacity-50",
        day_range_middle:
          "aria-selected:bg-gray-100 aria-selected:text-black",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        MonthCaption: ({ calendarMonth }) => {
          const { goToMonth } = useNavigation();
          const months = Array.from({ length: 12 }, (_, i) => ({
            value: i.toString(),
            label: format(new Date(2022, i, 1), "MMMM"),
          }));
          const years = Array.from({ length: 11 }, (_, i) => ({
            value: (2020 + i).toString(),
            label: (2020 + i).toString(),
          }));

          return (
            <div className="flex justify-center pt-2 relative items-center gap-2">
              <Select
                onValueChange={(value) => goToMonth(setMonth(calendarMonth.date, parseInt(value)))}
                value={calendarMonth.date.getMonth().toString()}
              >
                <SelectTrigger className="h-8 w-30 font-black uppercase text-[10px] tracking-widest border-(--border) rounded-lg bg-gray-50/50">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="bg-white border-(--border) rounded-xl">
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value} className="text-[10px] font-bold uppercase tracking-widest p-2">
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) => goToMonth(setYear(calendarMonth.date, parseInt(value)))}
                value={calendarMonth.date.getFullYear().toString()}
              >
                <SelectTrigger className="h-8 w-20 font-black uppercase text-[10px] tracking-widest border-(--border) rounded-lg bg-gray-50/50">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="bg-white border-(--border) rounded-xl">
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value} className="text-[10px] font-bold uppercase tracking-widest p-2">
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
