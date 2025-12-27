import { format } from "date-fns"
import { DateRange } from "react-day-picker"

interface AttendanceDateDisplayProps {
  date: DateRange | undefined
}

export function AttendanceDateDisplay({ date }: AttendanceDateDisplayProps) {
  if (!date?.from) {
    return <span className="text-muted-foreground">No date selected</span>
  }

  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-muted-foreground">Selected Period</span>
      <span className="text-lg font-bold">
        {format(date.from, "MMMM dd, yyyy")}
        {date.to && (
          <>
            {" - "}
            {format(date.to, "MMMM dd, yyyy")}
          </>
        )}
      </span>
    </div>
  )
}
