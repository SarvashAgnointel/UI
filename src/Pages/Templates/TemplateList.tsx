import React, { useState, useEffect } from "react";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { cn } from "../../lib/utils";
import { Badge } from "../../Components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import {
  DotsHorizontalIcon,
  CalendarIcon,
  FileIcon,
  CaretSortIcon,
} from "@radix-ui/react-icons";
import { FiFilter } from "react-icons/fi";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

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
import { Tabs, TabsContent } from "../../Components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu";
import axios from "axios";
//import { ToastContainer, toast } from "react-toastify";
import { useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";
import config from "../../config.json";
import {
  PlayIcon,
  PauseIcon,
  StopwatchIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { Skeleton } from "../../Components/ui/skeleton";
import TemplateDropdownMenuDemo from "../../Components/Filter/TemplateDropdown";
import { CarrotIcon } from "lucide-react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useDispatch } from "react-redux";
import { setCreateBreadCrumb } from "../../State/slices/AdvertiserAccountSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import CircularProgress from "@mui/material/CircularProgress";

interface template {
  id: number;
  name: string;
  Type: string;
  status: string;
  LastEdited: string;
}

interface templateTable {
  template_id: string; // Changed from number to string based on the provided data
  template_name: string;
  channel_type: string;
  status: string;
  last_edited: Date | null; // Changed to Date or null to handle the nullable DateTime?
  components: string; // Added components
  language: string; // Added language
  category: string; // Added category
  sub_category: string; // Added sub_category
}

const TemplateList: React.FC = () => {
  const navigate = useNavigate();
  const [templateList, setTemplateList] = useState<templateTable[]>([]);
   const [hasTemplates, setHasTemplates] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [templateNameToDelete,setTemplateNameToDelete]=useState<string>("");
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentTemplates, setCurrentTemplates] = useState<templateTable[]>([]);
  const [isSorted, setIsSorted] = useState(false);
  const [originalTemplates, setOriginalTempaltes] = useState(currentTemplates);
  const [filterData, setFilterData] = useState({
    filter: "",
    subFilter: "",
    value: 0,
  });
  const [isAlertOpen, setIsAlertOpen] = useState(false); // State to control dialog visibility
  const dispatch = useDispatch();
  const toast=useToast();

  const workspaceId = useSelector((state:RootState)=>state.authentication.workspace_id);
      // Get user permissions from Redux
  const userPermissions = useSelector(
    (state: RootState) => state.advertiserAccount.permissions);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdvAcc(config.ApiUrlAdvAcc);
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (apiUrlAdvAcc) {
      getTemplateList();
      
    }
  }, [apiUrlAdvAcc]);

  useEffect(() => {
    if (apiUrlAdvAcc) {
      
      SyncMetaTemplate();// Ensure that apiUrlAdvAcc is available before fetching
    }
  }, [apiUrlAdvAcc,templateList.length>0]);


  const SyncMetaTemplate = async () => {
    try {
      debugger
      const response = await axios.get(
        `${apiUrlAdvAcc}/SyncTemplatesWithMeta?workspaceId=${workspaceId}`
      );
  
      // Axios directly returns the response data
      const result = response.data; // Use 'data' instead of '.json()'
  
      // Axios does not have 'ok', check status using 'status'
      if (response.status === 200) {
        console.log("Sync Result:", result);
      } else {
        console.error("Sync Error:", result);
      }
    } catch (e) {
      console.error("API call failed:", e);
    }
  };


  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

 

  const handleEdit = async (templateId: any) => {
    console.log("templateId : " + templateId);
    try{
      const response = await axios.get(`${apiUrlAdvAcc}/CheckEditPermission?templateId=${templateId}`)
      if(response.data.canEdit){
        navigate("/navbar/CreateTemplate", { state: { templateId } });

      }
      else{
        toast.toast({
          title:"Warning",
          description:response.data.message
        })
      }
    }
    catch(e){
      toast.toast({
        title:"warning",
        description:"Error Editing Template"
      })
    }
    
    
  };

  // const handleDelete = async (TemplateId: any) => {
  //   try {
  //     const response = await axios.delete(
  //       `${apiUrlAdvAcc}/DeleteTemplateById?TemplateId=` + TemplateId
  //     );

  //     console.log("TemplateId is" + TemplateId);
  //     console.log("response.data.status:" + response.data.status);

  //     if (response.data.status === "Success") {
  //       toast.success("The template was deleted successfully");
  //       setTimeout(() => {
  //         /* wait for 1 second */
  //       }, 1000);
  //       getTemplateList();
  //     } else {
  //       console.error("Delete failed:", response.data.Status_Description);
  //       toast.error("An error occurred while deleting the template");
  //       setTimeout(() => {
  //         /* wait for 1 second */
  //       }, 1000);
  //     }
  //   } catch (e: any) {
  //     // Handle server error (500) and REFERENCE constraint
  //     debugger;
  //     if (e.response && e.response.status === 500) {
  //       const statusDescription = e.response.data?.status_Description;

  //       if (
  //         statusDescription &&
  //         statusDescription.includes("REFERENCE constraint")
  //       ) {
  //         // Specific error for foreign key constraint
  //         toast.warn(
  //           "Warning: Template is being used by another template and cannot be deleted.",
  //           {
  //             autoClose: 3000,
  //           }
  //         );
  //       } else {
  //         // General server error
  //         toast.error(
  //           "An internal server error occurred. Please try again later.",
  //           {
  //             autoClose: 3000,
  //           }
  //         );
  //       }
  //     } else {
  //       // Handle any other error (e.g., network issues)
  //       toast.error(
  //         "An unexpected error occurred while deleting the template.",
  //         {
  //           autoClose: 3000,
  //         }
  //       );
  //     }
  //     debugger;
  //     console.error("Error in Deleting form", e);
  //   }
  // };

  // Function to open the alert dialog
  const handleDeleteClick = (templateId: any) => {
    setTemplateToDelete(templateId); // Store templateId to delete
    let templateNameDelete = templateList.find(template => template.template_id === templateId)?.template_name || "";
    setTemplateNameToDelete(templateNameDelete)
    setIsAlertOpen(true); // Open the alert dialog
    console.log("templateId::" + templateId);
  };

  const [checkboxSelectedRows, setCheckboxSelectedRows] = useState<number[]>(
    []
  );
  const [isAllSelected, setIsAllSelected] = useState(false);

  const handleCheckboxRowSelect = (id: number) => {
    setCheckboxSelectedRows((prev) => {
      const newSelectedRows = prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id];
      setIsAllSelected(newSelectedRows.length === currentTemplates.length); // Update `isAllSelected` if all rows are selected
      return newSelectedRows;
    });
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setCheckboxSelectedRows([]);
    } else {
      const allIds = currentTemplates.map((template) => Number(template.template_id));
      setCheckboxSelectedRows(allIds);
    }
    setIsAllSelected(!isAllSelected);
  };

  const handleClose = () => {
    setIsAlertOpen(false);
  };
  const getTemplateList = async () => {
    setIsLoading(true);
    console.log("getTemp:",`${apiUrlAdvAcc}/GetTemplateList/${workspaceId}`);

    
    try {
      // const response = await axios.get(`${apiUrlAdvAcc}/GetTemplateList/${workspaceId}`);

      //      // Check if the API response contains 'templateDetails'
      //     if (response.data && response.data.templateDetails) {
      //       setTemplateList(response.data.templateDetails);
      //       console.log("Template Platform:", response.data.templateDetails);
      //     } else {
      //       console.log("No TemplateList available in response.");
      //     }
      //   } catch (error) {
      //     // Handle error if API call fails
      //     console.error("Error fetching Template List:", error);
      //   } finally {
      //     setIsLoading(false);
      //   }

    const response = await axios.get(`${apiUrlAdvAcc}/GetMetaTemplateDetails?workspace_id=${workspaceId}`);
           // Check if the API response contains 'templateDetails'
          if (response.data && response.data.templateDetails) {
            const templates=response.data.templateDetails
            setTemplateList(templates);
            setHasTemplates(templates.length>0);
            setIsLoading(false);
            console.log("Template Platform:", response.data.templateDetails);
          } else {
            setTemplateList([]); // Ensure empty list for no campaigns
            setHasTemplates(false);
            setIsLoading(false);
            console.log("No TemplateList available in response.");
          }
        } catch (error) {
          // Handle error if API call fails
          setTemplateList([]); // Ensure empty list for no campaigns
          setHasTemplates(false);
          console.error("Error fetching Template List:", error);
        } finally {
        }
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `${apiUrlAdvAcc}/DeleteMessageTemplate?id=${templateToDelete}&template=${templateNameToDelete}&workspaceId=${workspaceId}`
      );

      if (response) {
        setIsAlertOpen(false);
        const Close=()=>{
          getTemplateList();
        }
        toast.toast({
          title:"Success",
          description:"The Template was deleted successfully"
        })

        Close();
;

        // Refresh the template list
      } else {
        console.error("Template Deletion failed");
        toast.toast({
          title: "Error",
          description: "Failed to delete the Template",
        })

        setTimeout(() => {
          /* wait for 1 second */
        }, 1000);
      }
    } catch (e: any) {
      // Handle server error (500) and REFERENCE constraint
      debugger;
      if (e.response && e.response.status === 500) {
        const statusDescription = e.response.data?.status_Description;

        if (
          statusDescription &&
          statusDescription.includes("REFERENCE constraint")
        ) {
          // Specific error for foreign key constraint
          toast.toast({
            title: "Warning",
            description: "Warning: Template is being used by another campaign and cannot be deleted.",
          })

        } else {
          // General server error
          toast.toast({
            title: "Error",
            description: "An internal server error occurred. Please try again later.",
          })

        }
      } else {
        // Handle any other error (e.g., network issues)
        toast.toast({
          title: "Error",
          description: "An unexpected error occurred while deleting the template.",
        })
;
      }
      debugger;
      console.error("Error in Deleting form", e);
    }
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
      case "Completed":
        return (
          <CheckIcon className="text-gray-500 rounded-full border border-gray-500" />
        ); // Check icon for 'Completed'
      default:
        return null; // If no match, return nothing
    }
  };

  const datetimeformatter = (dateTime: any) => {
    const dateObj = new Date(dateTime);

    const day = dateObj.getDate().toString().padStart(2, "0"); // Day
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0"); // Month (months are 0-indexed)
    const year = dateObj.getFullYear(); // Year
    const hours = dateObj.getHours().toString().padStart(2, "0"); // Hours
    const minutes = dateObj.getMinutes().toString().padStart(2, "0"); // Minutes

    // const formattedDate = `${day}/${month}/${year} · ${hours}:${minutes}`;
    return `${day}/${month}/${year} · ${hours}:${minutes}`;
  };

  const filteredTemplates = templateList.filter((template) => {
    const matchesSearchTerm = template.template_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Assuming subFilter is related to channel_type, status, or some other field in template
    const matchesSubFilter = filterData.subFilter
      ? template.channel_type
          .toLowerCase()
          .includes(filterData.subFilter.toLowerCase()) ||
        template.status
          .toLowerCase()
          .includes(filterData.subFilter.toLowerCase())
      : true; // If no subFilter is applied, match everything

    return matchesSearchTerm && matchesSubFilter;
  });

  // Calculate total pages for filtered template
  const totalPages: number = Math.ceil(filteredTemplates.length / rowsPerPage);

  useEffect(() => {
    const newCurrentTemplates = filteredTemplates.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );

    setCurrentTemplates(newCurrentTemplates);
  }, [filterData, templateList, currentPage, rowsPerPage, searchTerm]);

  // let currentTemplates: templateTable[];

  useEffect(() => {
    if (filterData.filter === "none") {
      setFilterData({ filter: "none", subFilter: "", value: 0 });
    }
  }, [filterData.filter]);

  const sortTemplateList = (tableHeader: string) => {
    const sortByField = (
      field: keyof (typeof currentTemplates)[0],
      type: "string" | "number" | "date" = "string"
    ) => {
      const sortedTemplates = [...currentTemplates].sort((a, b) => {
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
      setOriginalTempaltes(currentTemplates);
      setCurrentTemplates(sortedTemplates);
    };

    if (isSorted) {
      setCurrentTemplates(originalTemplates);
    } else {
      switch (tableHeader) {
        case "ByTemplateName":
          sortByField("template_name", "string");
          break;
        case "ByTemplateChannel":
          sortByField("channel_type", "string");
          break;
        case "ByTemplateStatus":
          sortByField("status", "string");
          break;
        case "ByTemplateDate":
          sortByField("last_edited", "date"); // Sorting by start date
          break;
        default:
          console.warn("Unknown table header");
      }
    }

    setIsSorted(!isSorted);
    console.log("Sorted templates:", currentTemplates); // For debugging
  };

  return (
    <div>
      <Toaster />
        {isLoading && (
                <div className="flex flex-col items-center justify-center h-[500px]">
                     <CircularProgress color="primary" />
                </div>
              )}

                  { userPermissions.includes("ADV_Template_Create") && 
                  <div className="fixed flex justify-end items-end right-0 top-[-15px] z-20 p-4">
                       <Button
                         onClick={() => {
                           dispatch(setCreateBreadCrumb(true));
                           navigate("/navbar/CreateTemplate");
                         } }
                         className="w-36 text-sm font-thin h-[35px] mt-[10px]"
                       >
                         Create template
                       </Button>
                </div> }

    {hasTemplates ? (
      <><div>
              {/* Existing table code here */}
              <div className="flex justify-between mt-2">
                <div>
                  <Input
                    placeholder="Search template by name..."
                    className="w-[350px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Set the height
                  />

                </div>
                <TemplateDropdownMenuDemo setFilterData={setFilterData} />
              </div>

              <div className="rounded-md border">
                <div className="max-h-[60vh] overflow-y-auto">
                  <Table
                    className="rounded-xl whitespace-nowrap border-gray-200  "
                    style={{ color: "#020202", fontSize: "15px" }}
                  >
                    <TableHeader className="text-center">
                      <TableRow>
                        <TableHead className="">
                          <div className="flex items-center gap-6 justify-start cursor-pointer">
                            <input
                              type="checkbox"
                              className={`text-muted-foreground ${isAllSelected ? "accent-gray-700 bg-grey-700 text-red-500" : ""}`}
                              checked={isAllSelected}
                              onChange={handleSelectAll} />
                            Template name{" "}
                            <CaretSortIcon
                              onClick={() => sortTemplateList("ByTemplateName")}
                              className="cursor-pointer" />
                          </div>
                        </TableHead>

                        <TableHead>
                          <div className="flex items-center gap-6 justify-start">
                            <div>Type</div>
                            <CaretSortIcon
                              onClick={() => sortTemplateList("ByTemplateChannel")}
                              className="cursor-pointer" />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-6">
                            <div>Status</div>
                            <CaretSortIcon
                              onClick={() => sortTemplateList("ByTemplateStatus")}
                              className="cursor-pointer" />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-6">
                            <div>Last edited</div>
                            <CaretSortIcon
                              onClick={() => sortTemplateList("ByTemplateDate")}
                              className="cursor-pointer" />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-left">
                      {currentTemplates.map((temp) => {
                        let isSelected;
                        templateList.map((templates) => {
                          isSelected = checkboxSelectedRows.includes(
                            Number(templates.template_id)
                          );
                        });
                        return (
                          <TableRow key={temp.template_id}>
                            <TableCell>
                              <div className="flex items-center gap-6">
                                <input
                                  type="checkbox"
                                  className={`accent-gray-700 bg-grey-700 text-red-500 ${isAllSelected ? "accent-gray-700 bg-grey-700 text-red-500" : ""}`}
                                  checked={checkboxSelectedRows.includes(Number(temp.template_id))}
                                  onChange={() => handleCheckboxRowSelect(Number(temp.template_id))} />
                                {temp.template_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              {/* <Badge
                  className={
                    temp.channel_type === "WhatsApp"
                      ? "bg-green-400"
                      : temp.channel_type === "SMS"
                      ? "bg-yellow-400"
                      : temp.channel_type === "Push Notification"
                      ? "bg-orange-400"
                      : temp.channel_type === "Email"
                      ? "bg-blue-400"
                      : "bg-gray-400"
                  }
                >
                  {temp.channel_type}
                </Badge> */}

                              <Badge
                                className={temp.channel_type === "WhatsApp"
                                  ? ""
                                  : temp.channel_type === "SMS"
                                    ? ""
                                    : temp.channel_type === "Push Notification"
                                      ? ""
                                      : temp.channel_type === "Email"
                                        ? "bg-blue-400"
                                        : "bg-gray-400"}
                                style={temp.channel_type === "WhatsApp"
                                  ? { backgroundColor: "#479E98" }
                                  : temp.channel_type === "SMS"
                                    ? { backgroundColor: "#DFA548" }
                                    : temp.channel_type === "Push Notification" ||
                                      temp.channel_type === "Push"
                                      ? { backgroundColor: "#B87867" }
                                      : temp.channel_type === "RCS" ||
                                        temp.channel_type === "RCS messages"
                                        ? { backgroundColor: "#61177E" }
                                        : {}}
                              >
                                {temp.channel_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 flex items-center gap-2">
                              {renderStatusIcon(temp.status)}{" "}
                              {/* Display the appropriate icon */}
                              {temp.status} {/* Display the status text */}
                            </TableCell>
                            <TableCell>
                              {datetimeformatter(temp.last_edited)}
                            </TableCell>
                            <TableCell>
                              <TableCell>
                                {userPermissions.includes("ADV_Template_Edit") && 
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <DotsHorizontalIcon
                                      onClick={() => handleMenuToggle(Number(temp.template_id))}
                                      className="cursor-pointer w-6 h-6" />
                                  </DropdownMenuTrigger>
                                  {openMenuRowId === Number(temp.template_id) && (
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-24 bg-gray-200"
                                    >
                                      <DropdownMenuItem
                                        onClick={() => handleEdit(temp.template_id)}
                                      >
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteClick(temp.template_id)}
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  )}
                                </DropdownMenu> }
                              </TableCell>
                            </TableCell>
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
                    Are you sure you want to delete this Template ?
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
                  filteredTemplates.length
                )} of ${filteredTemplates.length} row(s) selected`}</span>
              </div>


              <div className="flex items-center space-x-4 font-medium text-sm">
                <span className="text-[#020617] font-medium text-[14px]">Rows per page</span>

                <div className="relative inline-block ml-2">
                  <select
                    className="cursor-pointer border border-gray-300 rounded-md px-2 py-1 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            </div></>
      ) : (
        <>
        {isLoading && null}
        {!isLoading && (
        <div className="flex flex-col items-center justify-center h-[500px]">
            <h2 className="text-[24px] font-bold mb-1 text-[#000000]">
            Here you will see all your templates
          </h2>
          {userPermissions.includes("ADV_Template_Create") && <div>
          <p className="text-[#64748B] font-normal mb-1 text-[14px]">
            Click the button below to create your first template.
          </p>
          <Button
            onClick={() => {
              navigate("/navbar/CreateTemplate");
            }}
            className="inline-flex items-center justify-center text-[14px] font-medium text-[#F8FAFC] px-5 py-5 whitespace-nowrap"
            style={{ width: "auto", minWidth: "unset" }}>          
            Create template
          </Button> </div>}
        </div>
        )}
        </>
      )}
    </div>
  );
};
export default TemplateList;
