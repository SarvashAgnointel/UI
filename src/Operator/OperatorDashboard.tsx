import React, {
  FC,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Button } from "../Components/ui/button";
import {
  Activity,
  Check,
  DollarSign,
  SendHorizonal,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Components/ui/select";
import { toast, useToast } from "../Components/ui/use-toast";
import { Toaster } from "../Components/ui/toaster";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../Components/ui/chart";
import { CalendarIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "../lib/utils";
import { Calendar } from "../Components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../Components/ui/popover";
import axios from "axios";
import { Skeleton } from "../Components/ui/skeleton";
import config from "../config.json";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../State/store";
import { stat } from "fs";

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Prop that accepts a function with a number
  setChartData: (data: any) => void; // Prop that accepts a function with a number
  fetchData: () => void;
}

export function DatePickerWithRange({
  className,
  setChartData,
  fetchData,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(), // Current date
    to: addDays(new Date(), 20), // Current date + 20 days
  });
  const dispatch = useDispatch();
  const toast = useToast();
  const Workspace_Id = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const apiUrlAdvAcc = useSelector(
    (state: RootState) => state.authentication.apiURL
  );
  // const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");

  // useEffect(() => {
  //   const loadConfig = async () => {
  //     try {
  //       const response = await fetch("/config.json");
  //       const config = await response.json();
  //       setApiUrlAdvAcc(config.ApiUrlAdvAcc);
  //       // setApiUrl(config.API_URL) // Set the API URL from config
  //     } catch (error) {
  //       console.error("Error loading config:", error);
  //     }
  //   };

  //   loadConfig();
  // }, []);

  useEffect(() => {
    console.log("The date is", date);
    if (date && date.from && date.to) {
      const date_from = format(date.from, "yyyy-MM-dd"); // Split by space and take the first part
      const date_to = format(date.to, "yyyy-MM-dd");

      const ChartDateRange = async () => {
        try {
          const response = await axios.get(
            `${apiUrlAdvAcc}/GetCombinedStatisticsByDateRange?workspaceId=${Workspace_Id}&from_date=${date_from.toString()}&to_date=${date_to.toString()}`
          );
          if (
            response.data.status === "Success" &&
            response.data.chartDetails.length > 0
          ) {
            setChartData(response.data);
          } else {
            // setChartData(response.data);
            fetchData();
            console.error("chart details not found");
          }
        } catch (error) {
          console.error("error in fetching chart details: ", error);
        }
      };

      ChartDateRange();
    } else {
      console.log("No date selected");
    }
  }, [date]);

  return (
    <div className={cn("flex justify-end gap-2 pb-4 ", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground text-[#020617] border-red-500"
            )}
          >
            <CalendarIcon
              className="mr-2 h-4 w-4"
              style={{ color: "#020617" }}
            />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// const Data = [
//   { date: "2024-04-01", email: 222, sms: 120, pushNotifications: 80, rcSmessages: 100, whatsapp: 50 },
//   { date: "2024-04-02", email: 97, sms: 80, pushNotifications: 70, rcSmessages: 50, whatsapp: 60 },
//   { date: "2024-04-03", email: 167, sms: 90, pushNotifications: 60, rcSmessages: 80, whatsapp: 40 },
//   { date: "2024-04-04", email: 242, sms: 130, pushNotifications: 110, rcSmessages: 150, whatsapp: 90 },
//   { date: "2024-04-05", email: 373, sms: 170, pushNotifications: 130, rcSmessages: 180, whatsapp: 90 },
//   { date: "2024-04-06", email: 301, sms: 140, pushNotifications: 100, rcSmessages: 120, whatsapp: 80 },
//   { date: "2024-04-07", email: 245, sms: 120, pushNotifications: 90, rcSmessages: 110, whatsapp: 70 },
//   { date: "2024-04-08", email: 409, sms: 200, pushNotifications: 180, rcSmessages: 160, whatsapp: 120 },
//   { date: "2024-04-09", email: 59, sms: 50, pushNotifications: 40, rcSmessages: 20, whatsapp: 30 },
//   { date: "2024-04-10", email: 261, sms: 140, pushNotifications: 110, rcSmessages: 130, whatsapp: 80 },
//   { date: "2024-04-11", email: 327, sms: 180, pushNotifications: 140, rcSmessages: 160, whatsapp: 90 },
//   { date: "2024-04-12", email: 292, sms: 150, pushNotifications: 120, rcSmessages: 140, whatsapp: 100 },
//   { date: "2024-04-13", email: 342, sms: 170, pushNotifications: 150, rcSmessages: 180, whatsapp: 110 },
//   { date: "2024-04-14", email: 137, sms: 70, pushNotifications: 60, rcSmessages: 50, whatsapp: 30 },
//   { date: "2024-04-15", email: 120, sms: 80, pushNotifications: 50, rcSmessages: 40, whatsapp: 30 },
//   { date: "2024-04-16", email: 138, sms: 90, pushNotifications: 60, rcSmessages: 50, whatsapp: 40 },
//   { date: "2024-04-17", email: 446, sms: 220, pushNotifications: 190, rcSmessages: 180, whatsapp: 150 },
//   { date: "2024-04-18", email: 364, sms: 180, pushNotifications: 160, rcSmessages: 140, whatsapp: 120 },
//   { date: "2024-04-19", email: 243, sms: 110, pushNotifications: 90, rcSmessages: 100, whatsapp: 50 },
//   { date: "2024-04-20", email: 89, sms: 50, pushNotifications: 40, rcSmessages: 30, whatsapp: 20 },
//   { date: "2024-04-21", email: 137, sms: 70, pushNotifications: 60, rcSmessages: 50, whatsapp: 30 },
//   { date: "2024-04-22", email: 224, sms: 120, pushNotifications: 100, rcSmessages: 90, whatsapp: 70 },
//   { date: "2024-04-23", email: 138, sms: 80, pushNotifications: 70, rcSmessages: 60, whatsapp: 40 },
//   { date: "2024-04-24", email: 387, sms: 200, pushNotifications: 160, rcSmessages: 150, whatsapp: 130 },
//   { date: "2024-04-25", email: 215, sms: 120, pushNotifications: 100, rcSmessages: 90, whatsapp: 70 },
//   { date: "2024-04-26", email: 75, sms: 50, pushNotifications: 30, rcSmessages: 40, whatsapp: 20 },
//   { date: "2024-04-27", email: 383, sms: 190, pushNotifications: 170, rcSmessages: 160, whatsapp: 120 },
//   { date: "2024-04-28", email: 122, sms: 60, pushNotifications: 50, rcSmessages: 40, whatsapp: 30 },
//   { date: "2024-04-29", email: 315, sms: 140, pushNotifications: 110, rcSmessages: 120, whatsapp: 90 },
//   { date: "2024-04-30", email: 454, sms: 220, pushNotifications: 180, rcSmessages: 190, whatsapp: 150 },
//   { date: "2024-05-01", email: 165, sms: 100, pushNotifications: 90, rcSmessages: 80, whatsapp: 60 },
//   { date: "2024-05-02", email: 293, sms: 150, pushNotifications: 130, rcSmessages: 140, whatsapp: 100 },
//   { date: "2024-05-03", email: 247, sms: 130, pushNotifications: 110, rcSmessages: 120, whatsapp: 80 },
//   { date: "2024-05-04", email: 385, sms: 200, pushNotifications: 170, rcSmessages: 160, whatsapp: 120 },
//   { date: "2024-05-05", email: 481, sms: 230, pushNotifications: 190, rcSmessages: 180, whatsapp: 150 },
//   { date: "2024-05-06", email: 498, sms: 250, pushNotifications: 210, rcSmessages: 220, whatsapp: 180 },
//   { date: "2024-05-07", email: 388, sms: 190, pushNotifications: 160, rcSmessages: 140, whatsapp: 120 },
//   { date: "2024-05-08", email: 149, sms: 70, pushNotifications: 60, rcSmessages: 50, whatsapp: 40 },
//   { date: "2024-05-09", email: 227, sms: 110, pushNotifications: 90, rcSmessages: 80, whatsapp: 60 },
//   { date: "2024-05-10", email: 293, sms: 130, pushNotifications: 120, rcSmessages: 110, whatsapp: 90 },
//   { date: "2024-05-11", email: 335, sms: 160, pushNotifications: 140, rcSmessages: 130, whatsapp: 100 },
//   { date: "2024-05-12", email: 197, sms: 100, pushNotifications: 80, rcSmessages: 70, whatsapp: 50 },
//   { date: "2024-05-13", email: 197, sms: 90, pushNotifications: 70, rcSmessages: 60, whatsapp: 40 },
//   { date: "2024-05-14", email: 448, sms: 220, pushNotifications: 200, rcSmessages: 180, whatsapp: 150 },
//   { date: "2024-05-15", email: 473, sms: 230, pushNotifications: 210, rcSmessages: 200, whatsapp: 160 },
//   { date: "2024-05-16", email: 338, sms: 180, pushNotifications: 160, rcSmessages: 150, whatsapp: 120 },
//   { date: "2024-05-17", email: 499, sms: 250, pushNotifications: 220, rcSmessages: 210, whatsapp: 180 },
//   { date: "2024-05-18", email: 315, sms: 150, pushNotifications: 130, rcSmessages: 120, whatsapp: 100 },
//   { date: "2024-05-19", email: 235, sms: 120, pushNotifications: 90, rcSmessages: 80, whatsapp: 60 },
//   { date: "2024-05-20", email: 177, sms: 90, pushNotifications: 70, rcSmessages: 60, whatsapp: 50 },
//   { date: "2024-05-21", email: 82, sms: 50, pushNotifications: 40, rcSmessages: 30, whatsapp: 20 },
//   { date: "2024-05-22", email: 81, sms: 40, pushNotifications: 30, rcSmessages: 20, whatsapp: 20 },
//   { date: "2024-05-23", email: 252, sms: 130, pushNotifications: 110, rcSmessages: 120, whatsapp: 90 },
//   { date: "2024-05-24", email: 294, sms: 150, pushNotifications: 130, rcSmessages: 140, whatsapp: 110 },
//   { date: "2024-05-25", email: 201, sms: 100, pushNotifications: 90, rcSmessages: 80, whatsapp: 60 },
//   { date: "2024-05-26", email: 213, sms: 110, pushNotifications: 90, rcSmessages: 70, whatsapp: 50 },
//   { date: "2024-05-27", email: 420, sms: 210, pushNotifications: 190, rcSmessages: 180, whatsapp: 150 },
//   { date: "2024-05-28", email: 233, sms: 120, pushNotifications: 100, rcSmessages: 90, whatsapp: 70 },
//   { date: "2024-05-29", email: 78, sms: 40, pushNotifications: 30, rcSmessages: 20, whatsapp: 20 },
//   { date: "2024-05-30", email: 340, sms: 170, pushNotifications: 140, rcSmessages: 130, whatsapp: 110 },
//   { date: "2024-05-31", email: 178, sms: 80, pushNotifications: 60, rcSmessages: 50, whatsapp: 40 },
//   { date: "2024-06-01", email: 178, sms: 90, pushNotifications: 70, rcSmessages: 60, whatsapp: 50 },
//   { date: "2024-06-02", email: 470, sms: 230, pushNotifications: 210, rcSmessages: 220, whatsapp: 180 },
//   { date: "2024-06-03", email: 103, sms: 50, pushNotifications: 40, rcSmessages: 30, whatsapp: 20 },
//   { date: "2024-06-04", email: 439, sms: 210, pushNotifications: 190, rcSmessages: 170, whatsapp: 140 },
//   { date: "2024-06-05", email: 88, sms: 50, pushNotifications: 40, rcSmessages: 30, whatsapp: 20 },
//   { date: "2024-06-06", email: 294, sms: 150, pushNotifications: 130, rcSmessages: 120, whatsapp: 90 },
//   { date: "2024-06-07", email: 323, sms: 160, pushNotifications: 140, rcSmessages: 130, whatsapp: 100 },
//   { date: "2024-06-08", email: 385, sms: 180, pushNotifications: 160, rcSmessages: 150, whatsapp: 120 },
//   { date: "2024-06-09", email: 438, sms: 220, pushNotifications: 200, rcSmessages: 190, whatsapp: 160 },
//   { date: "2024-06-10", email: 155, sms: 80, pushNotifications: 70, rcSmessages: 60, whatsapp: 50 },
//   { date: "2024-06-11", email: 92, sms: 50, pushNotifications: 40, rcSmessages: 30, whatsapp: 20 },
//   { date: "2024-06-12", email: 492, sms: 230, pushNotifications: 210, rcSmessages: 200, whatsapp: 170 },
//   { date: "2024-06-13", email: 81, sms: 40, pushNotifications: 30, rcSmessages: 20, whatsapp: 20 },
//   { date: "2024-06-14", email: 426, sms: 200, pushNotifications: 180, rcSmessages: 160, whatsapp: 130 },
//   { date: "2024-06-15", email: 307, sms: 150, pushNotifications: 130, rcSmessages: 120, whatsapp: 90 },
//   { date: "2024-06-16", email: 371, sms: 170, pushNotifications: 150, rcSmessages: 140, whatsapp: 110 },
//   { date: "2024-06-17", email: 475, sms: 230, pushNotifications: 210, rcSmessages: 200, whatsapp: 160 },
//   { date: "2024-06-18", email: 107, sms: 50, pushNotifications: 40, rcSmessages: 30, whatsapp: 20 },
//   { date: "2024-06-19", email: 341, sms: 160, pushNotifications: 140, rcSmessages: 130, whatsapp: 110 },
//   { date: "2024-06-20", email: 408, sms: 200, pushNotifications: 180, rcSmessages: 160, whatsapp: 130 },
//   { date: "2024-06-21", email: 169, sms: 80, pushNotifications: 70, rcSmessages: 60, whatsapp: 50 },
//   { date: "2024-06-22", email: 317, sms: 150, pushNotifications: 130, rcSmessages: 120, whatsapp: 90 },
//   { date: "2024-06-23", email: 480, sms: 220, pushNotifications: 200, rcSmessages: 180, whatsapp: 150 },
//   { date: "2024-06-24", email: 132, sms: 70, pushNotifications: 60, rcSmessages: 50, whatsapp: 40 },
//   { date: "2024-06-25", email: 141, sms: 80, pushNotifications: 60, rcSmessages: 50, whatsapp: 40 },
//   { date: "2024-06-26", email: 434, sms: 210, pushNotifications: 190, rcSmessages: 170, whatsapp: 140 },
//   { date: "2024-06-27", email: 448, sms: 220, pushNotifications: 200, rcSmessages: 180, whatsapp: 150 },
//   { date: "2024-06-28", email: 149, sms: 70, pushNotifications: 60, rcSmessages: 50, whatsapp: 40 },
//   { date: "2024-06-29", email: 103, sms: 50, pushNotifications: 40, rcSmessages: 30, whatsapp: 20 },
//   { date: "2024-06-30", email: 446, sms: 220, pushNotifications: 200, rcSmessages: 190, whatsapp: 160 },
// ];

interface ChartData {
  date: string;
  email: number;
  sms: number;
  pushNotifications: number;
  rcSmessages: number;
  whatsApp: number;
}

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  email: {
    label: "Email",
    color: "hsl(var(--chart-1))",
  },
  sms: {
    label: "Sms",
    color: "hsl(var(--chart-2))",
  },
  pushNotifications: {
    label: "RCS Mesages",
    color: "hsl(var(--chart-3))",
  },
  rcSmessages: {
    label: "RCS Messages",
    color: "hsl(var(--chart-4))",
  },
  whatsApp: {
    label: "Whatsapp",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

interface DashChartProps {
  Data: ChartData[]; // Expecting an array of ChartData objects
  setTimeRange: React.Dispatch<React.SetStateAction<string>>;
  timeRange: string;
  isWeek: boolean;
}

const DashChart: FC<DashChartProps> = ({
  Data,
  setTimeRange,
  timeRange,
  isWeek,
}) => {
  const chartData = Data.map((item) => {
    // Convert the date to a format without time
    const date = new Date(item.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    return {
      ...item,
      date, // Replacing the full datetime with only the date part
    };
  });

  // const [timeRange, setTimeRange] = React.useState("90d")
  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });
  return (
    <Card className="mt-[20px] w-[100%] h-fit relative">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Sent messages</CardTitle>
          <CardDescription>
            {isWeek
              ? "Showing total messages sent per week"
              : "Showing total messages sent per month"}
          </CardDescription>
        </div>
        {/* <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select> */}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[200px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              {/* Email Gradient */}
              <linearGradient id="fillEmail" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.1}
                />
              </linearGradient>

              {/* Sms Gradient */}
              <linearGradient id="fillSms" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.1}
                />
              </linearGradient>

              {/* Push Notifications Gradient */}
              <linearGradient
                id="fillPushNotifications"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-3))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-3))"
                  stopOpacity={0.1}
                />
              </linearGradient>

              {/* RCS Messages Gradient */}
              <linearGradient id="fillRcSmessages" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-4))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-4))"
                  stopOpacity={0.1}
                />
              </linearGradient>

              {/* Whatsapp Gradient */}
              <linearGradient id="fillWhatsapp" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-5))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-5))"
                  stopOpacity={1.0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="whatsApp"
              type="natural"
              fill="url(#fillWhatsapp)"
              stroke="hsl(var(--chart-5))"
              stackId="a"
            />
            <Area
              dataKey="rcSmessages"
              type="natural"
              fill="url(#fillRcSmessages)"
              stroke="hsl(var(--chart-4))"
              stackId="a"
            />
            <Area
              dataKey="pushNotifications"
              type="natural"
              fill="url(#fillPushNotifications)"
              stroke="hsl(var(--chart-3))"
              stackId="a"
            />
            <Area
              dataKey="sms"
              type="natural"
              fill="url(#fillSms)"
              stroke="hsl(var(--chart-2))"
              stackId="a"
            />
            <Area
              dataKey="email"
              type="natural"
              fill="url(#fillEmail)"
              stroke="hsl(var(--chart-1))"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

interface CardProps {
  title: string;
  value: string | number;
  change: string;
  icon?: ReactNode;
}

const CardComponent: FC<CardProps> = ({ title, value, change, icon }) => {
  return (
    <Card className="w-full md:w-[200px] lg:w-[220px] xl:w-[240px] h-fit relative flex-grow border-[#E2E8F0]">
      <div className="p-1 pl-0 pr-0">
        {/* <DollarSign className='absolute top-7 right-6 text-gray-400'/> */}
        {icon && (
          <div className="absolute top-7 right-6 text-gray-400">{icon}</div>
        )}

        <CardHeader className="text-left pb-2">
          <CardTitle className="text-[14px] text-[#020617] font-medium leading-[20px] text-left">
            {title}
          </CardTitle>
        </CardHeader>
        {/* <CardContent className="text-left text-2xl font-bold "> */}
        <CardContent className="text-left text-[#020617] text-2xl font-bold leading-[24px] mt-1">
          {value}
          {/* <div className="text-sm text-gray-400 font-medium "> */}
          <div className="text-[12px] text-[#64748B] font-normal leading-[20px] mt-[2px]">
            {change}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

const SkeletonCard: FC = () => {
  return (
    <div className="flex-col">
      <div className="flex flex-wrap gap-2">
        <Card className="w-full md:w-[200px] lg:w-[220px] xl:w-[240px] h-fit relative">
          <Skeleton className="absolute top-5 right-2 text-gray-200" />
          <CardHeader className="text-left">
            <Skeleton className="h-4 w-[100px]" />
          </CardHeader>
          <CardContent className="text-left text-2xl font-bold">
            <Skeleton className="h-4 mt-2 w-[100px]" />
            <div className="text-sm text-gray-400 font-medium">
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Skeleton />
    </div>
  );
};

const SkeletonChart: FC = () => {
  return (
    <Card className="mt-[20px] w-full md:w-[400px] lg:w-[500px] xl:w-[1000px] h-fit relative">
      <CardHeader className="text-left">
        <CardTitle>
          <Skeleton className="w-full h-" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="w-[200px] h-4" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="w-full h-[200px]">
          <Skeleton className="w-full h-full" />
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const OperatorDashboard: FC = () => {
  const [chartData, setChartData] = useState<any>();
  const [apiUrl, setApiUrl] = useState("");
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [campaignCount, setCampaignCount] = useState(0);
  const [isWeek, setIsWeek] = useState(false);
  const [isMonth, setIsMonth] = useState(false);
  const [timeRange, setTimeRange] = React.useState("90d");

  const Workspace_Id = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const EmailId = useSelector(
    (state: RootState) => state.authentication.userEmail
  );
  const isInvited = useSelector(
    (state: RootState) => state.authentication.isInvited
  );
  console.log(Workspace_Id);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdvAcc(config.ApiUrlAdvAcc);
        setApiUrl(config.API_URL); // Set the API URL from config
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    loadConfig();
  }, [Workspace_Id]);

  const fetchData = async () => {
    if (apiUrlAdvAcc) {
      // Ensure apiUrlAdvAcc is valid
      try {
        console.log("apiUrlAdvAcc", apiUrlAdvAcc); // For debugging
        const data = {
          Email: EmailId,
          WorkdspaceId: Workspace_Id,
        };
        if (isInvited) {
          const response = await axios.put(`${apiUrl}/UpdateIsAccepted`, data);

          if (response.data.success == "Success") {
            console.log(
              "isAcceptec Response : " + response.data.status_Description
            );
          } else {
            console.log(
              "isAcceptec Response : " + response.data.status_Description
            );
          }
        }
        const response = await axios.get(
          `${apiUrlAdvAcc}/GetCombinedStatistics?workspaceId=${Workspace_Id}`
        );
        console.log("API Response:", response.data); // Check the response
        setChartData(response.data);
      } catch (error) {
        console.error("Error fetching the statistics:", error);
      }
    }
  };

  // const GetCampaingCount = async () => {
  //   try {
  //     const response = await axios.get(`${apiUrlAdvAcc}/GetCampaignListbyWorkspaceId/${Workspace_Id}`);

  //     // Assuming the response data contains a 'CountryList' field as discussed earlier
  //     if (response.data && response.data.campaignList) {
  //       setCampaignCount(response.data.campaignCount);
  //       console.log("Campaign Count : ", response.data.campaignCount);
  //     } else {
  //       console.log("No campaign count available in response.");
  //     }
  //   } catch (error) {
  //     // Handle error if API call fails
  //     console.error("Error fetching campaign count:", error);
  //   }
  // };

  useEffect(() => {
    if (apiUrlAdvAcc) {
      // GetCampaingCount();
      fetchData();
    }
  }, [apiUrlAdvAcc, Workspace_Id]); // Depend on apiUrlAdvAcc

  // useEffect(() => {
  //   if(apiUrlAdvAcc){
  //     GetCampaingCount();
  //   }
  // },[apiUrlAdvAcc, Workspace_Id]); // Depend on apiUrlAdvAcc

  // const fetchData = async () => {
  //   try {
  //     console.log("apiUrlAdvAcc", apiUrlAdvAcc);
  //     const response = await axios.get(`${apiUrlAdvAcc}/GetCombinedStatistics`);
  //     console.log("apiUrlAdvAcc 2", `${apiUrlAdvAcc}/GetCombinedStatistics`);
  //     setChartData(response.data);
  //     console.log("chart data : ", chartData.campaignDetails[0].totalCampaigns);
  //     console.log(typeof response.data);
  //   } catch (error) {
  //     console.error("Error fetching the statistics:", error);
  //   }
  // };

  return chartData ? (
    <div className="flex-col w-full">
      <div className="flex mt-[-15px] justify-end">
        <div>
          <DatePickerWithRange
            setChartData={setChartData}
            fetchData={fetchData}
          />
        </div>
        <div>
          <Button
            className={
              isWeek
                ? "ml-2 w-fit font-normal text-[#020617] bg-[#01012E14]"
                : "ml-2 w-fit font-normal text-[#020617]"
            }
            variant={"outline"}
            onClick={() => {
              if (!isWeek) {
                setIsWeek(true);
                setTimeRange("7d");
              } else {
                setIsWeek(false);
                setTimeRange("90d");
              }
            }}
          >
            By Week
          </Button>
        </div>
        <div>
          <Button
            className="ml-2 w-fit font-normal text-[#020617]"
            variant={"outline"}
            onClick={() => {
              if (!isMonth) {
                setIsMonth(true);
                setTimeRange("30d");
              } else {
                setIsMonth(false);
                setTimeRange("90d");
              }
            }}
          >
            By Month
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 w-full justify-between border-orange-600">
        <CardComponent
          title="Campaigns"
          value={chartData?.campaignDetails[0]?.totalCampaigns || "0"}
          change="+20.1 from last month"
          icon={<PaperPlaneIcon />}
        />

        <CardComponent
          title="Roamers"
          value={chartData?.recipientCount[0]?.recipients || "0"}
          change="-15.6 from last month"
          icon={<Users className="text-[#64748B]" size={20} />}
        />
        <CardComponent
          title="Sent"
          value={chartData?.messagesSentDetails[0]?.totalSent || 0}
          change="+30.2 from last month"
          icon={<Check className="text-[#64748B]" size={20} />}
        />
        <CardComponent
          title="Delivery rate"
          value={
            Math.round(
              (chartData?.messagesSentDetails[0]?.totalSent /
                chartData?.recipientCount[0]?.recipients) *
                100 || 0
            ) + "%"
          }
          change="+2.1 from last month"
          icon={<Activity className="text-[#64748B]" size={20} />}
        />
      </div>
      {/* <DashChart data={chartData?.chartDetails} isWeek={isWeek} /> */}
      <DashChart
        Data={chartData?.chartDetails}
        setTimeRange={setTimeRange}
        timeRange={timeRange}
        isWeek={isWeek}
      />
    </div>
  ) : (
    <div className="flex-col w-full">
      <div className="flex mt-[-15px] justify-end">
        <div>
          <DatePickerWithRange
            setChartData={setChartData}
            fetchData={fetchData}
          />
        </div>
        <div>
          <Button className="ml-2 w-fit font-normal" variant={"outline"}>
            By Week
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 w-full justify-between">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonChart />
    </div>
  );
};

export default OperatorDashboard;
