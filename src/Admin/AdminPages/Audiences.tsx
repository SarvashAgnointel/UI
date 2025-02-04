import React, { useState, useEffect } from "react";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Badge } from "../../Components/ui/badge";
import {
  DotsHorizontalIcon,
  CaretSortIcon,
  FileIcon
} from "@radix-ui/react-icons";

import { FiFilter } from "react-icons/fi";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../Components/ui/table";

import axios from "axios";
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
import {
  PlayIcon,
  PauseIcon,
  StopwatchIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { Skeleton } from "../../Components/ui/skeleton";
import  DropdownMenuDemo  from "../../Components/Filter/AdminAudienceDropdown"
import { useDispatch } from "react-redux";
import { setCreateBreadCrumb } from "../../State/slices/AdvertiserAccountSlice";
import * as XLSX from "xlsx"
import CircularProgress from "@mui/material/CircularProgress";

interface Audience {
  telco_id: number;
  telco_name: string;
  status: string;
  updatedAt: string;
  recipients : number;
}

type AudienceCheck = {
  telco_id: number;
  telco_name: string;
};



const Audiences: React.FC = () => {
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);

  const [audienceList, setaudienceList] = useState<Audience[]>([]);
  const [currentAudiences, setCurrentAudiences] = useState<Audience[]>([]);


  const navigate = useNavigate();


  const [isSorted, setIsSorted] = useState(false);
  const [originalAudiences, setOriginalAudiences] = useState(currentAudiences);

  const [checkboxSelectedRows, setCheckboxSelectedRows] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5); // Default 5 rows per page
  const [searchTerm, setSearchTerm] = useState("");
  const [apiUrlAdminAcc, setapiUrlAdminAcc] = useState("");
  const [isLoading, setIsLoading] = useState(true);


  const [filterData, setFilterData] = useState({
    filter: "All Audiences",
    value: "",
  });

  const [dateList, setDateList] = useState<string[]>([]);
  
  const [hasAudiences, setHasAudiences] = useState(false);
  const dispatch = useDispatch();

  

  const handleCheckboxRowSelect = (id: number) => {
    setCheckboxSelectedRows((prev) => {
      const newSelectedRows = prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id];
      setIsAllSelected(newSelectedRows.length === currentAudiences.length); // Update `isAllSelected` if all rows are selected
      return newSelectedRows;
    });
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setCheckboxSelectedRows([]);
    } else {
      const allIds = currentAudiences.map((audience) => audience.telco_id);
      setCheckboxSelectedRows(allIds);
    }
    setIsAllSelected(!isAllSelected);
  };

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
    if (apiUrlAdminAcc) {
      getaudienceList();
    }
  }, [apiUrlAdminAcc]); // Runs when apiUrlAdminAcc is updated

  useEffect(() => {
          if (audienceList.length > 0) {
            setDateListFunction();
          }
      }, [audienceList]); // Dependency on campaignList
  
  

      const filteredAudiences = audienceList.filter((audience) => {
        const matchesSearchTerm = searchTerm
          ? audience.telco_name.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
      
        let matchesMainFilter = true;
      
        if (filterData.filter === "Status") {
          matchesMainFilter =
            filterData.value === "All" || audience.status === filterData.value;
        } else if (filterData.filter === "UpdatedAt") {
          const filterDate = new Date(filterData.value); // The value from the filter
          const audienceDate = new Date(audience.updatedAt.split("T")[0]); // Extracting date part
      
          // Check if the date matches
          matchesMainFilter = audienceDate.toDateString() === filterDate.toDateString();
        }
      
        return matchesSearchTerm && matchesMainFilter;
      });
  
  
  

  // Calculate total pages for filtered Audiences
  const totalPages: number = Math.ceil(filteredAudiences.length / rowsPerPage);

  useEffect(() => {
    const newCurrentAudiences = filteredAudiences.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );

    setCurrentAudiences(newCurrentAudiences);
  }, [filterData, audienceList, currentPage, rowsPerPage, searchTerm]);
  // Only re-run if dependencies change

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

 

  // Function to handle the actual delete after confirmation

  useEffect(() => {
    console.log(
      "filter data: " +
        filterData.filter +
        " " +
        filterData.value
    );
  }, [filterData]);



  const getaudienceList = async () => {
    setIsLoading(true);
    try {
      console.log( " Entered" );
      const response = await axios.get(`${apiUrlAdminAcc}/GetAudienceList`);
      console.log( "Response : " , response.data.audienceList);
      if (response.data && response.data.audienceList) {
        setaudienceList(response.data.audienceList);
        setIsLoading(false);
        console.log("audience List : ", response.data.audienceList);
      } else {
        console.log("No audience list available in response.");
        setIsLoading(false);
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching audience list:", error);
    } finally {
      // Ensure the menu is closed after fetching data
    }
  };

  const setDateListFunction = () => {
    const uniqueDates = audienceList.reduce(
      (acc: Record<string, string[]>, audience) => {
        const date = audience.updatedAt.split("T")[0]; // Extract only the date part (e.g., "2024-12-18")
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

 

  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  const sortaudienceList = (tableHeader: string) => {
    const sortByField = (
      field: keyof Audience,
      type: "string" | "number" | "date" = "string"
    ) => {
      const sortedAudiences = [...audienceList].sort((a, b) => {
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
      setOriginalAudiences(audienceList);
      setaudienceList(sortedAudiences); // Update the audienceList with sorted data
    };

    if (isSorted) {
      setaudienceList(originalAudiences); // Revert to the original audienceList
    } else {
      switch (tableHeader) {
        case "ByAudienceName":
          sortByField("telco_name", "string");
          break;
        case "ByAudienceStatus":
          sortByField("status", "string");
          break;
        case "ByAudienceUpdatedAt":
          sortByField("updatedAt", "date"); // Sorting by start date
          break;
        case "ByAudiencerecipients":
          sortByField("recipients", "number");
          break;

        default:
          console.warn("Unknown table header");
      }
    }

    setIsSorted(!isSorted);
  };

  const renderStatusIcon = (status: any) => {
    switch (status) {
      case "Syncing...":
        return <StopwatchIcon className="text-gray-500" />; // Stopwatch icon for 'Pending'
      case "Updated":
        return (
          <CheckIcon className="text-gray-500 rounded-full border border-gray-500" />
        ); // Check icon for 'Completed'
      default:
        return null; // If no match, return nothing
    }
  };


  useEffect(() => {
    setHasAudiences(audienceList.length > 0);
  }, [audienceList]);
  // const hasAudiences = audienceList.length > 0;

  const handleView = (audienceId: number) => {
    console.log(`View audience with ID: ${audienceId}`);
  };


  const handleExportButtonClick = () => {
      
        // Filter columns to include only the desired fields
        const filteredData = filteredAudiences.map(({ telco_id, telco_name, status, recipients, updatedAt }) => ({
          telco_id,
          telco_name,
          status,
          recipients,
          updatedAt ,
        }));
      
        // Create a worksheet
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
      
        // Create a workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Admin_Audience_List");
      
        // Export to an xlsx file
        XLSX.writeFile(workbook, "AdminAudienceList.xlsx");
      };

  
  

  return (
    <div>
      <ToastContainer />
        {isLoading && (
        <div className="flex flex-col items-center justify-center h-[500px]">
       <CircularProgress color="primary" />
        </div> 
      )}

    {hasAudiences ? ( 
        <div>
          {/* Existing table code here */}
          <div className="flex  mt-2">
            <div className=" ">
              <Input
                placeholder="Search audience by name..."
                className="w-[350px] text-[14px] font-normal text-[#64748B]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-end ml-auto ">
             <DropdownMenuDemo 
             setFilterData={setFilterData} 
             dateList={dateList}/>  
             <Button variant="outline" 
             className="w-24 mb-6 ml-4 mt-[-6] text-[#020617]"
             onClick={handleExportButtonClick}>
                <FileIcon className="mr-2 text-[#020617]" /> Export
              </Button>
            </div>

            
          </div>


          <div className="rounded-md border">
            <div className="max-h-[60vh] overflow-y-auto">
            <Table
              className="rounded-xl whitespace-nowrap border-gray-200"
              style={{ color: "#020202", fontSize: "15px" }}
            >
              <TableHeader className="text-center text-[14px] font-medium">
                <TableRow className="sticky top-0 bg-white z-10">
                  {/* Sticky header */}
                  <TableHead>
                    <div className="flex items-center gap-6 justify-start cursor-pointer">
                      <input
                        type="checkbox"
                        className={`text-muted-foreground ${
                          isAllSelected ? "accent-gray-700 bg-grey-700 text-red-500" : ""
                        }`}
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                      />
                      Telco{" "}
                      <CaretSortIcon
                        onClick={() => sortaudienceList("ByAudienceName")}
                        className="cursor-pointer"
                      />
                    </div>
                  </TableHead>

                  <TableHead style={{ width: "15%" }} className="text-left">
                    <div className="flex items-center gap-2 justify-start">
                      Status{" "}
                      <CaretSortIcon
                        onClick={() => sortaudienceList("ByAudienceStatus")}
                        className="cursor-pointer"
                      />
                    </div>
                  </TableHead>

                  <TableHead style={{ width: "20%" }}>
                    <div className="flex items-center gap-2 justify-start">
                      Updated at{" "}
                      <CaretSortIcon
                        onClick={() => sortaudienceList("ByAudienceUpdatedAt")}
                        className="cursor-pointer"
                      />
                    </div>
                  </TableHead>

                  <TableHead style={{ width: "10%" }}>
                    <div className="flex items-center gap-2 justify-center">
                      Recipients{" "}
                      <CaretSortIcon
                        onClick={() => sortaudienceList("ByAudiencerecipients")}
                        className="cursor-pointer"
                      />
                    </div>
                  </TableHead>

                  <TableHead className="text-left"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="text-left text-[14px] font-normal text-[#020617]">
                {currentAudiences.map((audience) => {
                  let isSelected;
                  audienceList.map((Audiences) => {
                    isSelected = checkboxSelectedRows.includes(Audiences.telco_id);
                  });

                  return (
                    <TableRow
                      key={audience.telco_id}
                      className={`${isSelected ? "bg-gray-200" : ""}`}
                    >
                      <TableCell className="flex justify-start py-4 text-green-900">
                        <div className="flex items-center gap-6">
                          <input
                            type="checkbox"
                            className={`accent-gray-700 bg-grey-700 text-red-500 ${
                              isAllSelected ? "accent-gray-700 bg-grey-700 text-red-500" : ""
                            }`}
                            checked={checkboxSelectedRows.includes(audience.telco_id)}
                            onChange={() => handleCheckboxRowSelect(audience.telco_id)}
                          />
                          <span
                            style={{
                              color: "#020617",
                              fontSize: "14px",
                              fontWeight: "400",
                            }}
                          >
                            {audience.telco_name}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell style={{ width: "15%" }} className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="flex-shrink-0">{renderStatusIcon(audience.status)}</span>
                          <span
                            style={{
                              color: "#020617",
                              fontSize: "14px",
                              fontWeight: "400",
                              whiteSpace: "nowrap", // Prevent text wrapping
                            }}
                          >
                            {audience.status}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell style={{ width: "20%" }} className="py-4">
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              color: "#020617",
                              fontSize: "14px",
                              fontWeight: "400",
                            }}
                          >
                            {new Date(audience.updatedAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}{" "}
                            ∙{" "}
                            {new Date(audience.updatedAt).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell style={{ width: "10%" }} className="py-4 text-right">
                        <span
                          style={{
                            color: "#020617",
                            fontSize: "14px",
                            fontWeight: "400",
                          }}
                        >
                          {audience.recipients}
                        </span>
                      </TableCell>

                      <TableCell className="py-4 pr-4 flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <DotsHorizontalIcon
                              style={{ color: "#020617" }}
                              onClick={() => handleMenuToggle(audience.telco_id)}
                              className="cursor-pointer w-5 h-5"
                            />
                          </DropdownMenuTrigger>
                          {openMenuRowId === audience.telco_id && (
                            <DropdownMenuContent className="w-48 h-auto">
                              <DropdownMenuItem onClick={() => handleView(audience.telco_id)}>
                                Sync
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          )}
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            </div>
          </div>

        

          {/* Pagination controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <span>{`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                currentPage * rowsPerPage,
                audienceList.length
              )} of ${audienceList.length} row(s) selected`}</span>
            </div>

            <div className="flex items-center space-x-4 font-medium text-sm">
              <span className="text-[#020617] font-medium text-[14px]">Rows per page</span>

              <div className="relative inline-block ml-2">
                <select
                  className="cursor-pointer border border-gray-300 rounded-md px-2 py-1 appearance-none focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  style={{
                    width: "60px",
                    height: "30px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: "400",
                    borderColor: "#E5E7EB",
                    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)", // Adds slight shadow
                  }}
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page after changing rows per page
                  }}
                >
                  {[5, 10, 20].map((num) => (
                    <option
                      className="text-[12px] font-normal"
                      key={num}
                      value={num}
                    >
                      {num}
                    </option>
                  ))}
                </select>
                <CaretSortIcon
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 w-4 h-4"
                />
              </div>

              <div className="ml-4 mr-4">
                <span className="text-[#020617] text-[14px] font-medium">{`Page ${currentPage} of ${totalPages}`}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${currentPage === 1 ? 'cursor-not-allowed bg-gray-100' : 'hover:bg-gray-200'}`}
                  onClick={() => handlePageChange(1)}
                >
                  «
                </button>
                <button
                  disabled={currentPage === 1}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${currentPage === 1 ? 'cursor-not-allowed bg-gray-100' : 'hover:bg-gray-200'}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ‹
                </button>
                <button
                  disabled={currentPage === totalPages}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${currentPage === totalPages ? 'cursor-not-allowed bg-gray-100' : 'hover:bg-gray-200'}`}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  ›
                </button>
                <button
                  disabled={currentPage === totalPages}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${currentPage === totalPages ? 'cursor-not-allowed bg-gray-100' : 'hover:bg-gray-200'}`}
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
        {isLoading && null}
        {!isLoading && (
          <div className="flex flex-col items-center justify-center h-[500px]">
            <h2 className="text-[24px] font-bold mb-1 text-[#000000]">
              Here you will see all your audience lists            
            </h2>
          </div>
      )}
      </>
      )}
    </div>
  );
};

export default Audiences;
