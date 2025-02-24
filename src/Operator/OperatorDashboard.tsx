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
import { addDays, format, subDays } from "date-fns";
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
    from: undefined, // Current date
    to: undefined, // Current date + 20 days
  });
  const dispatch = useDispatch();
  const toast = useToast();
  const Workspace_Id = 277;
  // useSelector(
  //   (state: RootState) => state.authentication.workspace_id
  // );
  const apiUrlAdvAcc = useSelector(
    (state: RootState) => state.authentication.apiURL
  );

  const apiUrlOPAcc = useSelector((state: RootState) => state.authentication.operatorUrl);


  useEffect(() => {
    console.log("The date is", date);
    if (date && date.from && date.to) {
      const date_from = format(date.from, "yyyy-MM-dd"); // Split by space and take the first part
      const date_to = format(date.to, "yyyy-MM-dd");

      const ChartDateRange = async () => {
        try {
          const response = await axios.get(
            `${apiUrlOPAcc}/GetOperatorCombinedStatisticsByDateRange?workspaceId=${Workspace_Id}&from_date=${date_from.toString()}&to_date=${date_to.toString()}`
          );
          if (
            response.data.status === "Success" &&
            response.data.chartDetails.length > 0
          ) {
            setChartData(response.data);
          } else {
            // setChartData(response.data);
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
  }, [date,]);

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
  const [campaignCount, setCampaignCount] = useState<number | 0>(0);
  const [isWeek, setIsWeek] = useState(false);
  const [isMonth, setIsMonth] = useState(false);
  const [timeRange, setTimeRange] = React.useState("90d");

  const [date_Week, setDate_Week] = React.useState<DateRange | undefined>({
      from: subDays(new Date(), 7), // 7 days before the current date
      to: new Date(), // Current date
    });

  const [date_Month, setDate_Month] = React.useState<DateRange | undefined>({
      from: subDays(new Date(), 30), // 7 days before the current date
      to: new Date(), // Current date
    });

  const Workspace_Id = 277
  // useSelector(
  //   (state: RootState) => state.authentication.workspace_id
  // );
  const EmailId = useSelector(
    (state: RootState) => state.authentication.userEmail
  );
  const isInvited = useSelector(
    (state: RootState) => state.authentication.isInvited
  );
  console.log(Workspace_Id);
  const apiUrlOPAcc = useSelector((state: RootState) => state.authentication.operatorUrl);



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
  
  // useEffect(() => {
  //   console.log("ChartData updated:", chartData);
  // }, [chartData]);

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
          `${apiUrlOPAcc}/GetCombinedStatisticsOperator?workspaceId=${Workspace_Id}`
        );
        console.log("API Response:", response.data); // Check the response
        setChartData(response.data);
      } catch (error) {
        console.error("Error fetching the statistics:", error);
      }
    }
  };

  const ByWeekData = async () => {
    if (date_Week && date_Week.from && date_Week.to) {
      const date_from = format(date_Week.from, "yyyy-MM-dd"); // Split by space and take the first part
      const date_to = format(date_Week.to, "yyyy-MM-dd");

      const ChartDateRange = async () => {
        try {
          const response = await axios.get(
            `${apiUrlOPAcc}/GetOperatorCombinedStatisticsByDateRange?workspaceId=${Workspace_Id}&from_date=${date_from.toString()}&to_date=${date_to.toString()}`
          );
          console.log("Updated chartData:", response.data.chartDetails);
          if (
            response.data.status === "Success" &&
            response.data.chartDetails.length > 0
          ) {
            setChartData(response.data);
            console.log("Updated chartData:", response.data);

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
    }
  };

  const ByMonthData = async () => {
    if (date_Month && date_Month.from && date_Month.to) {
      const date_from = format(date_Month.from, "yyyy-MM-dd"); // Split by space and take the first part
      const date_to = format(date_Month.to, "yyyy-MM-dd");

      const ChartDateRange = async () => {
        try {
          const response = await axios.get(
            `${apiUrlOPAcc}/GetOperatorCombinedStatisticsByDateRange?workspaceId=${Workspace_Id}&from_date=${date_from.toString()}&to_date=${date_to.toString()}`
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
    }
  };



  useEffect(() => {
    if (apiUrlAdvAcc) {
      fetchData();
    }
  }, [apiUrlAdvAcc, Workspace_Id]); // Depend on apiUrlAdvAcc


  return chartData ? (
    <div className="flex-col w-full">
      <div className="flex mt-[-15px] justify-end gap-2">
        <div>
          <DatePickerWithRange
            setChartData={setChartData}
            fetchData={fetchData}
          />
        </div>
        <Select
          defaultValue="year"
          onValueChange={(value) => {
            if (value === "week") {
              setIsWeek(true);
              setTimeRange("7d");
              ByWeekData();
            }
            else if (value === "month") {
              setIsMonth(true);
              setTimeRange("30d");
              ByMonthData();
            }
            else {
              setIsWeek(false);
              setIsMonth(false);
              setTimeRange("90d");
              fetchData();
            }
          }}
        >
          <SelectTrigger className="w-[120px] h-9 text-[#020617] mt-6">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">By Week</SelectItem>
            <SelectItem value="month">By Month</SelectItem>
            <SelectItem value="year">By Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-4 w-full justify-between border-orange-600">
        <CardComponent
          title="Campaigns"
          value={chartData?.campaignDetails[0]?.totalCampaigns || "0"}
          change="+20.1 from last month"
          icon={<PaperPlaneIcon className="text-[#64748B] size-4" />}
        />

        <CardComponent
          title="Roamers"
          value={chartData?.recipientCount[0]?.recipients || "0"}
          change="-15.6 from last month"
          icon={<Users className="text-[#64748B]" size={16} />}
        />
        <CardComponent
          title="Sent"
          value={chartData?.messagesSentDetails[0]?.totalSent || 0}
          change="+30.2 from last month"
          icon={<Check className="text-[#64748B]" size={16} />}
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
          icon={<Activity className="text-[#64748B]" size={16} />}
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
