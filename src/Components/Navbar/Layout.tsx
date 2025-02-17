import React, { FC, useEffect, useState } from "react";
import { Progress } from "../ui/progress";
import {
  User,
  Bell,
  Briefcase,
  CreditCard,
  Users,
  ChevronLeft,
} from "lucide-react";
import { DropdownMenuDemo } from "./Dropdown";
import { BellIcon } from "@radix-ui/react-icons";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../ui/breadcrumb";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/src/State/store";

// Define the menu items with routes as content
const menuItems = [
  { label: "Profile", icon: User, path: "Profile", requiredPermission: null }, // No permission needed
  {
    label: "Notifications",
    icon: Bell,
    path: "Notification",
    requiredPermission: "ADV_Notification_View",
  },
  {
    label: "Workspace",
    icon: Briefcase,
    path: "Workspace",
    requiredPermission: "ADV_Workspace_View",
  },
  {
    label: "Members",
    icon: Users,
    path: "Members",
    requiredPermission: "ADV_Member_View",
  },
  {
    label: "Billing",
    icon: CreditCard,
    path: "Billing",
    requiredPermission: "ADV_Billings_View",
  },
];

const NavItem = ({
  icon: Icon,
  label,
  path,
  onClick,
  select,
}: {
  icon: React.ElementType;
  label: string;
  path: string;
  onClick: () => void;
  select: string;
}) => (
  <Link
    to={path}
    onClick={onClick}
    className={cn(
      select === label
        ? "w-full text-left flex items-center space-x-3 text-[#020617] text-[14px] bg-[#F1F5F9] rounded-lg px-3 py-2"
        : "w-full text-left flex items-center space-x-3 text-[#64748B] text-[14px] hover:text-black hover:rounded hover:bg-[#F1F5F9] rounded-lg px-3 py-2"
    )}
  >
    <Icon
      className={cn(
        select === label
          ? "text-[#020617] font-medium"
          : "text-[#64748B] font-medium"
      )}
      style={{ width: "16px", height: "16px" }} // Explicitly set icon size
    />
    <span
      className={cn(
        select === label
          ? "text-[#020617] font-medium"
          : "text-[#64748B] font-medium",
        "text-[14px]"
      )}
    >
      {label}
    </span>
  </Link>
);

const NavLinks: FC<{ onSelect: (label: string) => void; selected: string }> = ({
  onSelect,
  selected,
}) => {
  const sampleTotalMessageCount = 10000;
  const userPermissions = useSelector(
    (state: RootState) => state.advertiserAccount.permissions
  );
  const sentCount = useSelector(
    (state: RootState) => state.advertiserAccount.sent_count_sidenav
  );
  return (
    <div className="h-full bg-[#FBFBFB]">
      <nav className="w-[calc(100%-20px)] ml-[10px] h-full flex flex-col bg-[#FBFBFB]">
        <div className="flex-1 overflow-y-auto py-4">
          {menuItems
            .filter(
              (item) =>
                !item.requiredPermission ||
                userPermissions?.includes(item.requiredPermission as string)
            )
            .map((item, index) => (
              <NavItem
                key={index}
                icon={item.icon}
                label={item.label}
                path={item.path}
                onClick={() => onSelect(item.label)}
                select={selected}
              />
            ))}
        </div>
        <div className="sticky bottom-0 p-4 bg-white w-full mb-[80px]">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-[#020617] text-left font-[400px] flex gap-1">
              <span>{sentCount || 0}</span>
              <span className="text-[#64748B]">/</span>
              <span>{sampleTotalMessageCount||10000}</span>
              <span>Messages</span>
            </span>
            <Progress
              value={(sentCount/sampleTotalMessageCount)*100}
              className="w-[218px] h-[6px]"
              color="#3A85F7"
            />
          </div>
        </div>
      </nav>
    </div>
  );
};

const Layout: FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(""); // Default label
  const [workspaceName, setWorkspaceName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  // const workspace = location.state?.path || "Admin";
  const route = location.state?.route || "Profile";
  const workspace = useSelector(
    (state: RootState) => state.authentication.workspaceName
  );
  const email = useSelector(
    (state: RootState) => state.authentication.userEmail
  );
  useEffect(() => {
    if (workspace !== "") {
      setWorkspaceName(workspace);
    }
  }, [workspace]);

  useEffect(() => {
    setSelectedLabel(route);
  }, []);

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
            collapsible={true}
            minSize={15}
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
                "flex h-[60px] items-center justify-center bg-[#FBFBFB]",
                "px-2"
              )}
            >
              <span
                className="flex w-full justify-start items-center gap-2 border-transparent p-2 font-bold"
                onClick={() =>
                  navigate("/navbar/dashboard", {
                    state: { path: workspaceName },
                  })
                }
              >
                <ChevronLeft
                  size={17}
                  className="ml-[-2px] mr-[1px] text-[#020617] cursor-pointer"
                />
                <div className="text-[14px] font-semibold text-[#000000] leading-[24px] cursor-pointer">
                  Settings
                </div>
              </span>
            </div>

            <Separator />
            <NavLinks onSelect={setSelectedLabel} selected={selectedLabel} />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel minSize={30} className="h-full">
            <Tabs defaultValue="all" className="h-full">
              <div className="flex w-full">
                <div className="flex-col items-center px-4 py-3 h-[60px] space-y-[4px]">
                  <div>
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink className="text-[#020617] font-normal text-[10px] ml-4">
                            <Link to="/">{workspaceName}</Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>

                        <BreadcrumbSeparator className="text-sm  text-[#64748B] mt-0.5" />

                        <BreadcrumbItem>
                          <BreadcrumbLink className="text-[#020617] font-normal text-[10px]">
                            <Link to="/settings">Settings</Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>

                        <BreadcrumbSeparator className="text-sm text-[#64748B] mt-0.5" />

                        <BreadcrumbItem className="text-[10px]">
                          <BreadcrumbPage className="text-[#64748B]">
                            {selectedLabel}
                          </BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                  <h1 className="text-semibold text-left font-semibold font-[14px] text-[#171717] ml-4 mt-0.5">
                    {selectedLabel}
                  </h1>
                </div>
              </div>
              <Separator />
              <TabsContent value="all" className="h-full overflow-y-auto m-0">
                <div className="h-full p-4 pb-10">
                  <Outlet />
                </div>
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </div>
  );
};

export default Layout;
