import React, { useState, useEffect  } from "react";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { cn } from "../../lib/utils";
import { Badge } from "../../Components/ui/badge";
import { Link } from "react-router-dom";
import AdminCampaignFilter from "../../Components/Filter/AdminCampaignFilter";
import CampaignFilter from "../../Components/Filter/CampaignDropdown";
import {
  DotsHorizontalIcon,
  CalendarIcon,
  FileIcon,
  CaretSortIcon,
  ArrowRightIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { FiFilter } from "react-icons/fi";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../Components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../Components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../../Components/ui/breadcrumb";
import { Calendar } from "../../Components/ui/calendar";
import { Separator } from "@radix-ui/react-select";
import axios from "axios";
import { Tabs, TabsContent } from "../../Components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import config from "../../config.json";
import {
  PlayIcon,
  PauseIcon,
  StopwatchIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { CircularProgress } from "@mui/material";
import { Skeleton } from "../../Components/ui/skeleton";
import DropdownMenuDemo from "../../Components/Filter/AdminCampaignDropdown";
import { useDispatch, useSelector } from "react-redux";
import { setCreateBreadCrumb } from "../../State/slices/AdvertiserAccountSlice";
import * as XLSX from "xlsx";
import { RootState } from "@/src/State/store";

interface Campaign {
  campaign_id: number;
  campaign_name: string;
  workspace_name: string;
  channel_type: string;
  status: string;
  start_date_time: string;
  end_date_time: string;
  campaign_budget: number;
  accountNames: string;
  account: string;
  sent: string;
  Delivered: string;
  Read: string;
  CTR: string;
  Delivery_Rate: string;
  Button_Click: string;
}

type CampaignCheck = {
  campaign_id: number;
  name: string;
};


interface DatePickerWithRangeProps {
  className?: string;
  fromDate?: Date;
  toDate?: Date;
  onChange?: (selectedRange: DateRange | undefined) => void;
  setCampaignList: React.Dispatch<React.SetStateAction<Campaign[]>>;
  getCampaignList: () => void;
  setCurrentCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  setInitialCampaign: React.Dispatch<React.SetStateAction<boolean>>;
  initialcampaign: boolean; 
  
}

const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({
  className,setCampaignList,getCampaignList,setCurrentCampaigns,  setInitialCampaign , initialcampaign 
}) => {
  const [currentData, setCurrentData] = useState<Campaign[]>([]);
  const [fromDate, setfromDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiUrlAdminAcc, setapiUrlAdminAcc] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to:  undefined
  });

    useEffect(() => {
      const fetchConfig = async () => {
        try {
          const response = await fetch("/config.json");
          const config = await response.json();
          setapiUrlAdminAcc(config.ApiUrlAdminAcc);
          console.log("apiUrlAdminAcc:" , apiUrlAdminAcc);
        } catch (error) {
          console.error("Error loading config:", error);
        }
      };
  
      fetchConfig();
    }, []);


  useEffect(() => {

    if (date && date.from && date.to) {

      const date_to = format(date.to, "yyyy-MM-dd");

      const date_from = format(date.from, "yyyy-MM-dd"); 

      const ChartDateRange = async () => {
        try {
          const response = await axios.get(
            `${apiUrlAdminAcc}/GetCampaignListAdminbyDateRange?from_date=${date_from.toString()}&to_date=${date_to.toString()}`
          );
      
         
          if (
            response.data.status === "Success" &&
            response.data.campaignList.length > 0
          ) {
           
            setCampaignList(response.data.campaignList);

          } else {
            // setChartData(response.data);
           // getCampaignList();
          // setCurrentData([]);
          // setCurrentCampaigns([]);
          setInitialCampaign(false);
          setCampaignList([]);
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
  },[date])

  useEffect(() => {
    if (initialcampaign === false) {
      setCampaignList([]);  // This will run after initialcampaign is set to false
    }
  }, [initialcampaign]);  // Dependency on initialcampaign state
  
  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[254px] justify-start text-left font-normal mt-0",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
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
};

const renderStatusIcon = (status: any) => {
  switch (status) {
    case "Live":
      return <PlayIcon className="text-gray-500" />; // Play icon for 'Live'
    case "Pending":
      return <StopwatchIcon className="text-gray-500" />; // Stopwatch icon for 'Pending'
    case "Paused":
      return <PauseIcon className="text-gray-500" />; // Pause icon for 'Paused'
    case "In review":
      return <MagnifyingGlassIcon className="text-gray-500" />; // Magnifying glass icon for 'In review'
    case "Rejected":
      return <Cross2Icon className="text-gray-500" />;
    case "Completed":
      return (
        <CheckIcon className="text-gray-500 rounded-full border border-gray-500" />
      ); // Check icon for 'Completed'
    default:
      return null; // If no match, return nothing
  }
};

const AdminCampaignList: React.FC = () => {
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const navigate = useNavigate();
  const [isAlertOpen, setIsAlertOpen] = useState(false); // State to control dialog visibility
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [currentCampaigns, setCurrentCampaigns] = useState<Campaign[]>([]);

  const [isSorted, setIsSorted] = useState(false);
  const [originalCampaigns, setOriginalCampaigns] = useState(currentCampaigns);

  const [checkboxSelectedRows, setCheckboxSelectedRows] = useState<number[]>(
    []
  );
  const [isAllSelected, setIsAllSelected] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10); // Default 5 rows per page
  const [searchTerm, setSearchTerm] = useState("");
  const [apiUrlAdminAcc, setapiUrlAdminAcc] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filterData, setFilterData] = useState({
    filter: "None",
    subFilter: "",
  });
  const [hasCampaigns, setHasCampaigns] = useState(false);
  const [initialcampaign , setInitialCampaign] = useState(true);
  const dispatch = useDispatch();

 const EmailId = useSelector(
    (state: RootState) => state.authentication.userEmail
  );


  const [dateList, setDateList] = useState<string[]>([]);

  const handleCheckboxRowSelect = (id: number) => {
    setCheckboxSelectedRows((prev) => {
      const newSelectedRows = prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id];
      setIsAllSelected(newSelectedRows.length === currentCampaigns.length); // Update `isAllSelected` if all rows are selected
      return newSelectedRows;
    });
  };

  console.log("EmailId:" , EmailId);
const [campaignLoading, setCampaignLoading] = useState(true); // For GetCampaignListbyWorkspaceId
const [columnsLoading, setColumnsLoading] = useState(true);

  const [visibleColumns, setVisibleColumns] = useState([
      "campaign_name",
      "Account",
      "channel_type",
      "status",
      "start_date_time",
      "campaign_budget",
      "sent",
      "delivered",
      "read",
      "ctr",
      "delivery_rate",
      "button_click",
    ]);
  
    const defaultColumns = [
      "campaign_name",
      "Account",
      "channel_type",
      "status",
      "start_date_time",
      "campaign_budget",
      "sent",
    ];
  
    // Merge default and visible columns
    const displayedColumns = [
      ...defaultColumns,
      ...visibleColumns.filter((col) => !defaultColumns.includes(col)),
    ];

  const handleSelectAll = () => {
    if (isAllSelected) {
      setCheckboxSelectedRows([]);
    } else {
      const allIds = currentCampaigns.map((campaign) => campaign.campaign_id);
      setCheckboxSelectedRows(allIds);
    }
    setIsAllSelected(!isAllSelected);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setapiUrlAdminAcc(config.ApiUrlAdminAcc);
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (apiUrlAdminAcc) {
      getCampaignList();
    }
  }, [apiUrlAdminAcc]); // Runs when apiUrlAdminAcc is updated

  useEffect(() => {
    if (campaignList.length > 0) {
      setDateListFunction();
    }
  }, [campaignList]); // Dependency on campaignList

 

// 1. Add this useEffect near your other useEffect declarations
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm]);

// 2. Replace your existing filtering and pagination section with this:
// Apply search and filter first, then paginate
const filteredCampaigns = campaignList.filter((campaign) => {
  const matchesSearchTerm = searchTerm
    ? campaign.campaign_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase().trim())
    : true;

  const matchesSubFilter = filterData.subFilter
    ? filterData.filter === "Channel"
      ? campaign.channel_type
          ?.toLowerCase()
          .includes(filterData.subFilter.toLowerCase())
      : filterData.filter === "Status"
      ? campaign.status?.toLowerCase().includes(filterData.subFilter.toLowerCase())
      : filterData.filter === "StartedAt"
      ? campaign.start_date_time.split("T")[0] === filterData.subFilter
      : true
    : true;

  return matchesSearchTerm && matchesSubFilter;
});

// Calculate total pages
const totalPages: number = Math.ceil(filteredCampaigns.length / rowsPerPage);

// 3. Replace your useEffect for currentCampaigns with this:
useEffect(() => {
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const newCurrentCampaigns = filteredCampaigns.slice(startIndex, endIndex);
  setCurrentCampaigns(newCurrentCampaigns);
}, [filteredCampaigns, currentPage, rowsPerPage]);

// 4. Keep your existing handlePageChange function, just update its contents:
const handlePageChange = (newPage: number) => {
  if (newPage > 0 && newPage <= totalPages) {
    setCurrentPage(newPage);
  }
};
  const handleEdit = (campaignId: any, channelType: any) => {
    //console.log("CampaignId : " + campaignId)
    navigate("/navbar/createCampaign", { state: { campaignId, channelType } });
  };

  // Function to open the alert dialog
  const handleDeleteClick = (campaignId: any) => {
    setCampaignToDelete(campaignId); // Store campaign ID to delete
    setIsAlertOpen(true); // Open the alert dialog
  };

  const handleClose = () => {
    setIsAlertOpen(false);
  };

  // Function to handle the actual delete after confirmation

  useEffect(() => {
    console.log(
      "filter data: " +
        filterData.filter +
        " " +
        filterData.subFilter     
      );
  }, [filterData]);

  // Use useEffect to avoid re-render loop
  useEffect(() => {
    if (filterData.filter === "None") {
      setFilterData({ filter: "None", subFilter: "" });
    }
  }, [filterData.filter]);

  const getCampaignList = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${apiUrlAdminAcc}/GetCampaignListAdmin`
      );
      // Assuming the response data contains a 'CountryList' field as discussed earlier
      if (response.data && response.data.campaignList) {
        setCampaignList(response.data.campaignList);
        setIsLoading(false);

        console.log("Campaign List : ", response.data.campaignList);
      } else {
        console.log("No campaign list available in response.");
        setIsLoading(false);
      }
    } catch (error) {
      // Handle error if API call fails
      setHasCampaigns(false);
      setIsLoading(false);
      console.error("Error fetching campaign list:", error);
    } finally {
      // Ensure the menu is closed after fetching data
    }
  };

 

  const setDateListFunction = () => {
    const uniqueDates = campaignList.reduce(
      (acc: Record<string, string[]>, campaign) => {
        const date = campaign.start_date_time.split("T")[0]; // Extract only the date part (e.g., "2024-12-18")
        if (!acc[date]) {
          acc[date] = []; // Initialize an empty array for this date if it doesn't exist
        }
        acc[date].push(date); // Add the date to the group (if needed for further processing)
        return acc;
      },
      {}
    );
    const datekeys = Object.keys(uniqueDates);
    console.log("Unique Dates", datekeys); // Logs grouped unique dates
    setDateList(datekeys);
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `${apiUrlAdminAcc}/DeleteCampaignById?CampaignId=` + campaignToDelete
      );

      if (response.data.status === "Success") {
        setIsAlertOpen(false);
        toast.success("The campaign was deleted successfully", {
          autoClose: 1000,
          onClose: () => {
            getCampaignList();
          },
        });

        // Refresh the campaign list
      } else {
        console.error("Delete failed:", response.data.Status_Description);
        toast.error("Error while deleting the campaign");
        setTimeout(() => {
          /* wait for 1 second */
        }, 1000);
      }
    } catch (e) {
      console.error("Error in deleting campaign", e);
    }
  };

  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  const sortCampaignList = (tableHeader: string) => {
    const sortByField = (
      field: keyof Campaign,
      type: "string" | "number" | "date" = "string"
    ) => {
      const sortedCampaigns = [...campaignList].sort((a, b) => {
        if (type === "number") {
          return Number(a[field]) - Number(b[field]);
        } else if (type === "date") {
          return (
            Date.parse(a[field] as string) - Date.parse(b[field] as string)
          );
        } else {
          return String(a[field]).localeCompare(String(b[field]));
        }
      });
      setOriginalCampaigns(campaignList);
      setCampaignList(sortedCampaigns);
    };

    if (isSorted) {
      setCampaignList(originalCampaigns);
    } else {
      switch (tableHeader) {
        case "ByCampaignName":
          sortByField("campaign_name", "string");
          break;
        case "ByCampaignAccount":
          sortByField("workspace_name", "string");
          break;
        case "ByCampaignChannel":
          sortByField("channel_type", "string");
          break;
        case "ByCampaignStatus":
          sortByField("status", "string");
          break;
        case "ByCampaignDate":
          sortByField("start_date_time", "date"); // Sorting by start date
          break;
        case "ByCampaignAmount":
          sortByField("campaign_budget", "number"); // Sorting by budget as a number
          break;
          case "ByCampaignSent":
            sortByField("sent", "number"); // Sorting by sent count as a number
            break;
          case "ByCampaignDelivered":
            sortByField("Delivered", "string"); // Sorting by sent count as a number
            break;
          case "ByRead":
            sortByField("Read", "string"); // Sorting by sent count as a number
            break;
          case "ByCTR":
            sortByField("CTR", "string"); // Sorting by sent count as a number
            break;
          case "ByDeliveryRate":
            sortByField("Delivery_Rate", "string"); // Sorting by sent count as a number
            break;
          case "ByButtonClick":
            sortByField("Button_Click", "string"); // Sorting by sent count as a number
            break;
        default:
          console.warn("Unknown table header");
      }
    }

    setIsSorted(!isSorted);
  };


  useEffect(() => {
    setHasCampaigns(campaignList.length > 0);
  }, [campaignList]);

  const handleExportButtonClick = () => {
    // Filter columns to include only the desired fields
    const filteredData = filteredCampaigns.map(
      ({
        campaign_id,
        campaign_name,
        workspace_name,
        channel_type,
        status,
        start_date_time,
        end_date_time,
        campaign_budget,
      }) => ({
        campaign_id,
        campaign_name,
        workspace_name,
        channel_type,
        status,
        start_date_time,
        end_date_time,
        campaign_budget,
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Admin_Campaign_List");

    // Export to an xlsx file
    XLSX.writeFile(workbook, "AdminCampaignList.xlsx");
  };

  const handleNavigate =
    (campaignId: number, channelType: string, status: string) =>
    (event: { stopPropagation: () => void }) => {
      event.stopPropagation(); // Prevent event bubbling
      navigate("/adminNavbar/campaignreview", {
        state: { campaignId, channelType, status },
      }); // Navigate with state
    };

  return (
    <div>
      <ToastContainer />
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-[500px]">
          <CircularProgress color="primary" />
        </div>
      )}

      {hasCampaigns || !initialcampaign ? (
        <div>
          {/* Existing table code here */}
          <div className="flex  mt-2">
            <div className=" ">
              <Input
                placeholder="Search campaign by name..."
                className="w-[350px] text-[14px] font-normal text-[#64748B]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-end ml-auto ">
              <div className="mb-6">
                <DatePickerWithRange 
                 initialcampaign={initialcampaign} 
                 setInitialCampaign={setInitialCampaign} 
                 setCurrentCampaigns={setCurrentCampaigns} // Pass the setter function
                  getCampaignList={getCampaignList}
                  setCampaignList={setCampaignList}/>
              </div>
              {/* <DropdownMenuDemo 
              setFilterData={setFilterData} 
              filterData={filterData}
              dateList={dateList} /> */}
      <AdminCampaignFilter
                    visibleColumns={visibleColumns}
                    setVisibleColumns={setVisibleColumns}
                    EmailId={EmailId}
                    setColumnsLoading={setColumnsLoading} />   
              <Button
                variant="outline" 
                className="w-full mb-6 ml-4 mt-[-6] text-[#020617] font-medium text-[14px] py-2 px-3"
                onClick={handleExportButtonClick}
              >
                <FileIcon style={{width:'14px' , height:'14px' }} className="mr-1 text-[#020617]" /> Export
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="max-h-[60vh] overflow-y-auto">
              <Table
                className="rounded-xl whitespace-nowrap border-gray-200  "
                style={{ color: "#020202", fontSize: "15px" }}
              >
                <TableHeader className="text-center text-[14px] font-medium">
                  <TableRow>
                  {displayedColumns.includes("campaign_name") && (
                    <TableHead className="">
                      <div className="flex items-center gap-6 justify-start cursor-pointer">
                        <input
                          type="checkbox"
                          className={`text-muted-foreground ${
                            isAllSelected
                              ? "accent-gray-700 bg-grey-700 text-red-500"
                              : ""
                          }`}
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                        />
                        Campaign name{" "}
                        <CaretSortIcon
                          onClick={() => sortCampaignList("ByCampaignName")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
 )}

 {/*{visibleColumns.includes("channel_type") &&*/}
 {displayedColumns.includes("Account") && (
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Account{" "}
                        <CaretSortIcon
                          onClick={() => sortCampaignList("ByCampaignAccount")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
 )}
{displayedColumns.includes("channel_type") && (
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Channel{" "}
                        <CaretSortIcon
                          onClick={() => sortCampaignList("ByCampaignChannel")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
)}
{displayedColumns.includes("status") && (
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Status{" "}
                        <CaretSortIcon
                          onClick={() => sortCampaignList("ByCampaignStatus")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    )}
{displayedColumns.includes("start_date_time") && (
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Schedule{" "}
                        <CaretSortIcon
                          onClick={() => sortCampaignList("ByCampaignDate")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    )}
{displayedColumns.includes("campaign_budget") && (
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Amount{" "}
                        <CaretSortIcon
                          onClick={() => sortCampaignList("ByCampaignAmount")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
)}

   {displayedColumns.includes("sent") && (
                          <TableHead className="text-left">
                            <div className="flex items-center gap-2 justify-start">
                              Sent{" "}
                              <CaretSortIcon
                                onClick={() => sortCampaignList("ByCampaignSent")}
                                className="cursor-pointer"
                              />
                            </div>
                          </TableHead>
                        )}
  
                        {/*} {visibleColumns.includes("delivered") &&  */}
                        {displayedColumns.includes("delivered") && (
                          <TableHead className="text-left">
                            <div className="flex items-center gap-2 justify-start">
                              Delivered{" "}
                              <CaretSortIcon
                                onClick={() =>
                                  sortCampaignList("BYCampaignDelivered")
                                }
                                className="cursor-pointer"
                              />
                            </div>
                          </TableHead>
                        )}
  
                        {/* {visibleColumns.includes("read") && */}
                        {displayedColumns.includes("read") && (
                          <TableHead className="text-left">
                            <div className="flex items-center gap-2 justify-start">
                              Read{" "}
                              <CaretSortIcon
                                onClick={() => sortCampaignList("ByRead")}
                                className="cursor-pointer"
                              />
                            </div>
                          </TableHead>
                        )}
                        {/* {visibleColumns.includes("ctr") && */}
                        {displayedColumns.includes("ctr") && (
                          <TableHead className="text-left">
                            <div className="flex items-center gap-2 justify-start">
                              CTR{" "}
                              <CaretSortIcon
                                onClick={() => sortCampaignList("ByCTR")}
                                className="cursor-pointer"
                              />
                            </div>
                          </TableHead>
                        )}
  
                        {/*{visibleColumns.includes("delivery_rate") && */}
                        {displayedColumns.includes("delivery_rate") && (
                          <TableHead className="text-left">
                            <div className="flex items-center gap-2 justify-start">
                              Delivery rate{" "}
                              <CaretSortIcon
                                onClick={() => sortCampaignList("ByDeliveryRate")}
                                className="cursor-pointer"
                              />
                            </div>
                          </TableHead>
                        )}
  
                        {/* {visibleColumns.includes("button_click") && */}
                        {displayedColumns.includes("button_click") && (
                          <TableHead className="text-left">
                            <div className="flex items-center gap-2 justify-start">
                              Button click{" "}
                              <CaretSortIcon
                                onClick={() => sortCampaignList("ByButtonClick")}
                                className="cursor-pointer"
                              />
                            </div>
                          </TableHead>
                        )}
                    <TableHead className="text-left"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-left text-[14px] font-normal text-[#020617] ">
                  {currentCampaigns.map((campaign) => {
                    let isSelected;
                    campaignList.map((campaings) => {
                      isSelected = checkboxSelectedRows.includes(
                        campaings.campaign_id
                      );
                    });

                    return (
                      <TableRow
                        key={campaign.campaign_id}
                        className={`${isSelected ? "bg-gray-200" : ""}`}
                      >
                        {displayedColumns.includes("campaign_name") && (
                        <TableCell className="flex justify-start py-4 text-green-900">
                          <div className="flex items-center gap-6">
                            <input
                              type="checkbox"
                              className={`accent-gray-700 bg-grey-700 text-red-500 ${
                                isAllSelected
                                  ? "accent-gray-700 bg-grey-700 text-red-500"
                                  : ""
                              }`}
                              checked={checkboxSelectedRows.includes(
                                campaign.campaign_id
                              )}
                              onChange={() =>
                                handleCheckboxRowSelect(campaign.campaign_id)
                              }
                            />
                            <span
                              className="hover:text-blue-500 text-black text-[14px] cursor-pointer font-normal"
                              onClick={handleNavigate(
                                campaign.campaign_id,
                                campaign.channel_type,
                                campaign.status
                              )}
                            >
                              {campaign.campaign_name}
                            </span>
                          </div>
                        </TableCell>
                        )}
{displayedColumns.includes("Account") && (  
                        <TableCell className="py-4 text-[#FFFFFF]">
                          <span style={{ color: "#020202", fontSize: "15px" }}>
                            {campaign.workspace_name}
                          </span>
                        </TableCell>
                  )}
                  {displayedColumns.includes("channel_type") && (
                        <TableCell className="py-4 text-[#FFFFFF]">
                          <Badge
                            className={
                              campaign.channel_type === "WhatsApp"
                                ? ""
                                : campaign.channel_type === "SMS"
                                ? ""
                                : campaign.channel_type === "Push Notification"
                                ? ""
                                : campaign.channel_type === "Email"
                                ? "bg-blue-400"
                                : "bg-gray-400"
                            }
                            style={
                              campaign.channel_type === "WhatsApp"
                    
                              ? { backgroundColor: "#479E98" }
                                : campaign.channel_type === "SMS"
                                ? { backgroundColor: "#DFA548" }
                                : campaign.channel_type ===
                                    "Push Notification" ||
                                  campaign.channel_type === "Push"
                                ? { backgroundColor: "#B87867" }
                                : campaign.channel_type === "RCS" ||
                                  campaign.channel_type === "RCS messages"
                                ? { backgroundColor: "#61177E" }
                                : {}
                            }
                          >
                            {campaign.channel_type}
                          </Badge>
                        </TableCell>
                  )}
                  {displayedColumns.includes("status") && (
                        <TableCell className="py-4 flex items-center gap-2">
                          {renderStatusIcon(campaign.status)}{" "}
                          {/* Display the appropriate icon */}
                          {campaign.status} {/* Display the status text */}
                        </TableCell>
                        )}
                        {displayedColumns.includes("start_date_time") && (
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            {new Date(
                              campaign.start_date_time
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                            , {new Date(campaign.start_date_time).getFullYear()}
                            <ArrowRightIcon />
                            {new Date(
                              campaign.end_date_time
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                            , {new Date(campaign.end_date_time).getFullYear()}
                          </div>
                        </TableCell>
                        )} 
                        {displayedColumns.includes("campaign_budget") && (
                        <TableCell className="py-4 px-4 py-4 px-4 text-center">
                          ${campaign.campaign_budget}
                        </TableCell>
                        )}

                      {displayedColumns.includes("sent") && (
                            <TableCell className="py-4 px-4 py-4 px-4 text-center">
                              {campaign.sent}
                            </TableCell>
                          )}
                          {displayedColumns.includes("delivered") && (
                            <TableCell className="py-4 px-4 py-4 px-4 text-center">
                              {campaign.Delivered}
                            </TableCell>
                          )}
                          {displayedColumns.includes("read") && (
                            <TableCell className="py-4 px-4 py-4 px-4 text-center">
                              {campaign.Read}
                            </TableCell>
                          )}
                          {displayedColumns.includes("ctr") && (
                            <TableCell className="py-4 px-4 py-4 px-4 text-center">
                              {campaign.CTR}
                            </TableCell>
                          )}
                          {displayedColumns.includes("delivery_rate") && (
                            <TableCell className="py-4 px-4 py-4 px-4 text-center">
                              {campaign.Delivery_Rate}
                            </TableCell>
                          )}
                          {displayedColumns.includes("button_click") && (
                            <TableCell className="py-4 px-4 py-4 px-4 text-center">
                              {campaign.Button_Click}
                            </TableCell>
                          )}

                        {/* <TableCell className="flex justify-left py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <DotsHorizontalIcon
                                onClick={() =>
                                  handleMenuToggle(campaign.campaign_id)
                                }
                                className="cursor-pointer w-6 h-6"
                              />
                            </DropdownMenuTrigger>
                            {openMenuRowId === campaign.campaign_id && (
                              <DropdownMenuContent
                                align="end"
                                className="w-24 bg-gray-200"
                              >
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleEdit(
                                      campaign.campaign_id,
                                      campaign.channel_type
                                    )
                                  }
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteClick(campaign.campaign_id)
                                  }
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            )}
                          </DropdownMenu>
                        </TableCell> */}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <Dialog
            open={isAlertOpen}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            sx={{ "& .MuiPaper-root": { borderRadius: "10px" } }}
          >
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this campaign ?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button variant="outline" className="w-24" onClick={handleClose}>
                Cancel
              </Button>
              <Button className="w-24" onClick={confirmDelete} autoFocus>
                OK
              </Button>
            </DialogActions>
          </Dialog>

          {/* Pagination controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2 text-gray-500 text-sm ">
              <span>{`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                currentPage * rowsPerPage,
                filteredCampaigns.length
              )} of ${filteredCampaigns.length} row(s) selected`}</span>
            </div>

            <div className="flex items-center space-x-4 font-medium text-sm">
              <span className="text-[#020617] font-medium text-[14px]">
                Rows per page
              </span>

              <div className="relative inline-block ml-2">
                <select
                  disabled={currentCampaigns.length === 0}
                  className={`cursor-pointer border border-gray-300 rounded-md px-2 py-1 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    currentCampaigns.length === 0
                      ? "cursor-not-allowed bg-gray-100"
                      : ""
                  }`}
                  style={{
                    width: "60px",
                    height: "30px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: "400",
                    borderColor: "#E5E7EB",
                    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)", // Adds slight shadow
                  }}
                  value={currentCampaigns.length === 0 ? 0 : rowsPerPage}

                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page after changing rows per page
                  }}
                
                >
                  {[5, 10, 20].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <CaretSortIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 w-4 h-4" />
              </div>

              <div className="ml-4 mr-4">
                <span className="text-[#020617] text-[14px] font-medium">{`Page ${currentPage} of ${totalPages}`}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1 || currentCampaigns.length === 0}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${
                    currentPage === 1 || currentCampaigns.length === 0
                      ? "cursor-not-allowed bg-gray-100"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => handlePageChange(1)}
                >
                  «
                </button>
                <button
                  disabled={currentPage === 1 || currentCampaigns.length === 0}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${
                    currentPage === 1 || currentCampaigns.length === 0
                      ? "cursor-not-allowed bg-gray-100"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ‹
                </button>
                <button
                  disabled={currentPage === totalPages || currentCampaigns.length === 0}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${
                    currentPage === totalPages || currentCampaigns.length === 0
                      ? "cursor-not-allowed bg-gray-100"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  ›
                </button>
                <button
                  disabled={currentPage === totalPages || currentCampaigns.length === 0}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${
                    currentPage === totalPages || currentCampaigns.length === 0
                      ? "cursor-not-allowed bg-gray-100"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => handlePageChange(totalPages)}
                >
                  »
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
         <>
          {isLoading && null}
          {!isLoading && (
            <div className="flex flex-col items-center justify-center h-[500px]">
              <h2 className="text-[24px] font-semibold mb-1 text-[#000000]">
                Here you will see all campaigns
              </h2>
            </div>
          )}
        </>
        </>
      )}
    </div>
  );
};

export default AdminCampaignList;

