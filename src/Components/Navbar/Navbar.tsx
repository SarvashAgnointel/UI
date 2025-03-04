import React, { FC, useEffect, useRef, useState } from "react";
import { Progress } from "../ui/progress";
import Logo from "../../Assets/Logo2.svg";
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  User,
  Share2,
  Briefcase,
  CreditCard,
  Bell,
  Settings,
  Users,
  User2,
  Wallet
} from "lucide-react";
import { DropdownMenuDemo } from "./Dropdown";
import {
  BellIcon,
  ChatBubbleIcon,
  HomeIcon,
  LightningBoltIcon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { cn } from "../../lib/utils";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent } from "../ui/tabs";
import { TooltipProvider } from "../ui/tooltip";
import { Link, Outlet } from "react-router-dom";
import figmaPageImage from "../Assets/Login.png";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../ui/breadcrumb";
import { Button } from "../ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/State/store";
import { setCreateBreadCrumb } from "../../State/slices/AdvertiserAccountSlice";
import { FiBell } from "react-icons/fi";
import axios from "axios";
import { UseSelector } from "react-redux";

// Define the menu items with routes as content
const menuItems = [
  { label: "Dashboard", icon: HomeIcon, path: "dashboard", permission: "ADV_Dashboard" },
  { label: "Campaigns", icon: PaperPlaneIcon, path: "campaignlist", permission: "ADV_Campaigns_View" },
  { label: "Templates", icon: ChatBubbleIcon, path: "TemplateList", permission: "ADV_Template_View" },
  { label: "Audiences", icon: Users, path: "audiences", permission: "ADV_Audience_View" },
  { label: "Channels", icon: LightningBoltIcon, path: "channels", permission: "ADV_Channels_View" },
];

interface Notification {
  id: number;
  message: string;
}


interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  onClick: () => void;
  select: string;
}

const NavItem: FC<NavItemProps> = ({
  icon: Icon,
  label,
  path,
  onClick,
  select,
}) => {
  const dispatch = useDispatch();
  const isSelected = select === label;

  return (
    <Link
      to={path}
      onClick={onClick}
      className={
        isSelected
          ? "w-full text-left flex items-center space-x-3 font-medium bg-[#F1F5F9] rounded-lg px-3 py-2"
          : "w-full text-left flex items-center space-x-3 font-medium hover:text-black hover:rounded hover:bg-[#F1F5F9] rounded-lg px-3 py-2"
      }
    >
      <Icon
        style={{ width: '16px', height: '16px' , color: isSelected ? "#020617" : "#64748B" }}
      />

      <span
        className="text-[14px]"
        style={{ color: isSelected ? "#020617" : "#64748B" }}
        onClick={() => {
          dispatch(setCreateBreadCrumb(false));
        }}
      >
        {label}
      </span>
    </Link>
  );
};


const NavLinks: FC<{ onSelect: (label: string) => void; selected: string }> = ({
  onSelect,
  selected,
}) => {
  const sampleTotalMessageCount = 10000;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userPermissions = useSelector((state: RootState) => state.advertiserAccount.permissions);
  const sentCount = useSelector((state:RootState)=>state.advertiserAccount.sent_count_sidenav);
  const availableCount = useSelector((state:RootState)=>state.advertiserAccount.total_available_count_sidenav);
  return (
    <div className="bg-[#FBFBFB] h-full">
      <nav
        className="w-[calc(100%-20px)] ml-[10px] h-full flex flex-col"
        style={{ backgroundColor: "#FBFBFB" }}
      >
        <div className="flex-1 overflow-y-auto py-4">
        {menuItems
          .filter(item => userPermissions.includes(item.permission)) 
          .map((item, index) => (
            <NavItem
              key={index}
              icon={item.icon}
              label={item.label}
              path={item.path}
              onClick={() => {
                onSelect(item.label);
                dispatch(setCreateBreadCrumb(false));
              }}
              select={selected}
            />
        ))}

        </div>

        <div className="sticky bottom-0 p-4 w-full">
          <div className="flex flex-col space-y-2">
            <div className="py-4 flex flex-col gap-[10px]">
            { userPermissions.includes("ADV_Billings_View") && 
            <>
              <Button 
            className="w-[96px] h-[27px] text-[14px] font-normal" onClick={()=>navigate("/settings/Billing",{state: { route:"Billing" }})}>
              <div className="flex pr-16 pl-16 pt-8 pb-8 gap-[10px]">
                <span><Wallet size={16}/></span>
                <span className='flex justify-center items-center w-[48px] h-[16px]'>Top Up</span>
              </div>
            </Button> 
              <span className="text-sm text-[#020617] text-left font-[400px] flex gap-1">
                <span>{sentCount||0}</span>
                <span className="text-[#64748B]">/</span>
                <span>{availableCount||0}</span>
                <span>Messages</span>
              </span>
              <Progress value={(sentCount/availableCount)*100} className="w-[218px] h-[6px]" color="#3A85F7" />
            </> }
            <div
              style={{
                position: "sticky",
                // left: '30px',
                // bottom: '30px',
                paddingTop: "2px",
                zIndex: 20,
                marginBottom: "2px",
              }}
            >
              <img
                src={Logo}
                alt="Logo"
                style={{ width: "85px", height: "16.512px" }}
              />
            </div>
          </div>
        </div>
        </div>
      </nav>
    </div>
  );
};

const Navbar: FC<{
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setAuthenticated }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("Dashboard"); // Default label
  const navigate = useNavigate();
  const location = useLocation();
  const route = location.state?.route || "";
  const [workspaceName, setWorkspaceName] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const emailId = useSelector((state:RootState)=>state.authentication.userEmail); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]); 
  const notificationRef = useRef<HTMLDivElement>(null);  
  const AdvAccUrl = useSelector(
    (state: RootState) => state.authentication.apiURL
  );
        // Get user permissions from Redux
  const userRoleName = useSelector(
    (state: RootState) => state.advertiserAccount.user_role_name);

  // const workspace = location.state?.path || "Admin";
  const workspace = useSelector(
    (state: RootState) => state.authentication.workspaceName
  );

  const workspaceId = useSelector((state: RootState) => state.authentication.workspace_id)
  const breadCrumbStatus = useSelector(
    (state: RootState) => state.advertiserAccount.createBreadCrumb
  );

  useEffect(() => {
    if (userRoleName === "Campaign Manager") {
      setSelectedLabel("Campaigns");
    }else if(userRoleName === "Audience Manager"){
      setSelectedLabel("Audiences");
    }else if(userRoleName === "Analytics Viewer"){
      setSelectedLabel("Dashboard");
    }else if(userRoleName === "Channel Specialist"){
      setSelectedLabel("Channels");
    }else{
      setSelectedLabel("Dashboard");
    }
  }, [userRoleName]); // Runs whenever userRoleName changes

  useEffect(() => {
    if (workspace !== "") {
      setWorkspaceName(workspace);
    }

    console.log("curr location: " + location.pathname);
    const data = location.pathname.split("/");
    console.log(data);
  }, [location]);

  useEffect(()=>{
    if(route!=""){
      setSelectedLabel(route);
    }
  },[route])

  useEffect(() => {
    setImageSrc("");
    const fetchProfileImage = async () => {
      try {
        const response = await axios.get(
          `${AdvAccUrl}/GetProfileImage`,
          {
            params: { EmailId: emailId ,
                      WorkspaceId: workspaceId
            },
          }
        );

        if (response.data.status === "Success") {
          // Decode base64 string and create a data URL
          const base64String = response.data.image[0].image;
          const dataUrl = `data:image/jpeg;base64,${base64String}`;
          setImageSrc(dataUrl);
        } else {
          setImageSrc("");
          console.error("Failed to fetch image:" , response.data.status_Description);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };
    
    fetchProfileImage();
  }, [emailId, workspaceId]);

  useEffect(() => {
    setSelectedLabel(route);
  }, []);  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);



  return (
    <div className="h-screen">
      <TooltipProvider delayDuration={0}>
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(sizes: number[]) => {
            document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
              sizes
            )}`;
          }}
          className="h-full items-stretch"
        >
    <ResizablePanel
            collapsible={false}
            minSize={20}
            maxSize={20}
            onCollapse={() => {
              setIsCollapsed(true);
              document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                true
              )}`;
            }}
            onResize={() => {
              setIsCollapsed(false);
              document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                false
              )}`;
            }}
            className={cn(
              isCollapsed &&
                "min-w-[50px] transition-all duration-300 ease-in-out"
            )}
          >
            <div
              className={cn(
                "flex h-[60px] items-center justify-center bg-[#FBFBFB]"
              )}
             >
              <DropdownMenuDemo
                profileImage={imageSrc}
                profileName={workspaceName}
                setAuthenticated={setAuthenticated}
              />
             <div className="relative">
            <div
              className="relative mr-4 border-gray-200 border rounded p-2 cursor-pointer"
              onClick={() => setShowNotifications(!showNotifications)} >
            <FiBell style={{ width: "16px", height: "16px", color: "#0F172A" }} />

            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>

          {showNotifications && (
            <div
              ref={notificationRef}
              className="absolute top-12 right-0 w-max min-w-[200px] bg-white border border-gray-300 rounded shadow-lg p-4 z-50"
              >
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm text-center">No notifications yet.</p>
              ) : (
            <ul>
              {notifications.map((notification) => (
                <li key={notification.id} className="text-sm text-gray-800 py-1 border-b last:border-none">
                  {notification.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      </div>
            </div>
            <Separator />
            <NavLinks
              onSelect={setSelectedLabel}
              selected={selectedLabel}
            />{" "}
          </ResizablePanel>
          {/* <Separator orientation="vertical" className="h-full ml-64" /> */}
          <ResizableHandle />

          <ResizablePanel className="h-screen">
            <Tabs defaultValue="all" className="h-full">
              <div className="flex w-full">
                <div className="flex-col items-center px-4 py-2 h-[60px] space-y-[4px]">
                  <div>
                    <Breadcrumb className="">
                      <BreadcrumbList className="">
                        <BreadcrumbItem>
                          <BreadcrumbLink>
                            <Link
                              to="#"
                              className={
                                selectedLabel === "Dashboard"
                                  ? "text-[#64748B] font-normal text-[10px] ml-4"
                                  : "text-[#020617] font-normal text-[10px] ml-4"
                              }
                            >
                              {workspaceName}
                            </Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {selectedLabel === "Dashboard" ? (
                          <BreadcrumbItem>
                            <BreadcrumbPage></BreadcrumbPage>
                          </BreadcrumbItem>
                        ) : (
                          <>
                            <BreadcrumbSeparator className="text-sm mt-1 text-[8px] text-[#64748B]" />

                            <BreadcrumbItem>
                              <BreadcrumbPage
                                className={
                                  breadCrumbStatus
                                    ? "text-[#020617] font-normal text-[10px] mt-1"
                                    : "text-[#64748B] font-normal text-[10px] mt-1"
                                }
                              >
                                {selectedLabel}
                              </BreadcrumbPage>
                            </BreadcrumbItem>

                            {breadCrumbStatus ? (
                              <>
                                <BreadcrumbSeparator className="mt-1 text-[8px] text-[#64748B]" />
                                <BreadcrumbItem>
                                  <BreadcrumbPage className="text-[#64748B] text-[10px] mt-1">
                                    Create
                                  </BreadcrumbPage>
                                </BreadcrumbItem>
                              </>
                            ) : (
                              <BreadcrumbItem>
                                <BreadcrumbPage></BreadcrumbPage>
                              </BreadcrumbItem>
                            )}
                          </>
                        )}
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                  <h1 className="text-semibold text-left font-semibold font-[14px] text-[#171717] ml-4">
                    {selectedLabel}
                  </h1>
                </div>
              </div>
              <Separator />
              <TabsContent value="all" className="h-full overflow-y-auto m-0">
                {/* Outlet for rendering the matched route content */}
                <div className="h-full p-6 bg-[#FFFFFF]">
                  <Outlet/>
                </div>
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </div>
  );
};

export default Navbar;
