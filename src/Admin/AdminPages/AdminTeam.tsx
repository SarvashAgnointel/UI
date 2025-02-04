import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../Components/ui/table";
import { Badge } from "../../Components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../Components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../Components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../Components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../Components/ui/select";
import { Label } from "../../Components/ui/label";
import { CaretSortIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import { toast, useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";

interface Member {
  name: string;
  email: string;
  role: string;
  joinedDate: string;
  wId: number;
  // assuming date is a string in ISO format
}

interface Admin {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
  first_name: string;
  last_name: string;
}

interface InviteMember {
  name: string;
  role: string;
  invitedAt: string;
  expiresAt: string;
  status: string;
}

interface Roles {
  role_id: string;
  role_name: string;
}

const Team: React.FC = () => {
  const initialMembers: Member[] = [
    {
      name: "Sebastian",
      email: "sebastian@sibiatech.com",
      role: "Owner",
      joinedDate: "2024-10-11T10:30:00Z",
      wId: 0,
    },
    {
      name: "Nour",
      email: "nour@sibiatech.com",
      role: "Super Admin",
      joinedDate: "2024-09-25T09:15:00Z",
      wId: 0,
    },
  ];

  const inviteMembersList: InviteMember[] = [
    {
      name: "malek@sibiatech.com",
      role: "Owner",
      invitedAt: "03/01/2024",
      expiresAt: "03/03/2024",
      status: "Active",
    },
  ];

  const [open, setOpen] = useState(false);
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  const [currentMembers, setCurrentMembers] =
    useState<Member[]>(initialMembers);
  const [originalMembers, setOriginalMembers] =
    useState<Member[]>(initialMembers);
  const [isSorted, setIsSorted] = useState(false);

  const [currentAdmins, setCurrentAdmins] = useState<Admin[]>([]);
  const [originalAdmins, setOriginalAdmins] = useState<Admin[]>([]);
  const [imageSrc, setImageSrc] = useState<any | null>(null);

  const [inviteCurrentMembers, setInviteCurrentMembers] =
    useState<InviteMember[]>(inviteMembersList);
  const [inviteOriginalMembers, setInviteOriginalMembers] =
    useState<InviteMember[]>(inviteMembersList);
  const [isInviteSorted, setIsInviteSorted] = useState(false);
  const [apiUrlAdmin, setApiUrlAdmin] = useState("");
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const toast = useToast();
  const personalemail = useSelector(
    (state: RootState) => state.authentication.userEmail
  );
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const [invitedMembers, setInvitedMembers] = useState([
    { email: "", role: "", name: "fazil", wId: workspaceId },
  ]);
  const [roles, setRoles] = useState<Roles[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdmin(config.ApiUrlAdminAcc);
        setApiUrlAdvAcc(config.ApiUrlAdvAcc);
        setApiUrl(config.API_URL);
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (apiUrlAdvAcc) {
        try {
          await getAdminsList();
          await fetchProfileImage();
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        console.log("apiUrlAdvAcc is missing", {
          apiUrlAdvAcc,
        });
      }
    };

    fetchData();
  }, [apiUrlAdvAcc]);

  const getAdminsList = async () => {
    try {
      const response = await axios.get(
        `${apiUrlAdmin}/GetAdminsList?workspaceId=${workspaceId}`
      );

      debugger;
      if (response.data.status == "Success") {
        setCurrentAdmins(response.data.adminsList);
        setOriginalAdmins(response.data.adminsList);
        console.log("Pending Member's List:" + response.data.adminsList);
      } else {
        console.log("No pending members");
      }

      debugger;
    } catch (err) {
      //setError("Failed to fetch members. Please try again later.");
      console.error("Error fetching members:", err);
    }
  };

  const DeleteAdminAccess = async (AdminId: number) => {
    console.log(`Deleting admin access for AdminId: ${AdminId}`);
    try {
      const response = await axios.delete(
        `${apiUrlAdmin}/DeleteAdminAccess?AdminId=${AdminId}`
      );
      if (response.data.status === "Success") {
        getAdminsList(); // Re-fetch admins
        toast.toast({
          title: "Success",
          description: "The Admin access revoked successfully",
        });
      } else {
        console.log("Error in revoking admin access");
        toast.toast({
          title: "Error",
          description: "Something error in revoking admin access",
        });
      }
    } catch (error) {
      console.error("Error in DeleteAdminAccess:", error);
    }
  };

  const fetchProfileImage = async () => {
    debugger;
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetProfileImage`, {
        params: { EmailId: personalemail },
      });

      if (response.data.status === "Success") {
        // Decode base64 string and create a data URL
        const base64String = response.data.image[0].image;
        const dataUrl = `data:image/jpeg;base64,${base64String}`;
        setImageSrc(dataUrl);
      } else {
        console.error(
          "Failed to fetch image:",
          response.data.status_Description
        );
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const sortByField = (
    field: keyof Member,
    type: "string" | "number" | "date" = "string"
  ) => {
    const sortedMembers = [...currentMembers].sort((a, b) => {
      if (type === "number") {
        return Number(a[field]) - Number(b[field]);
      } else if (type === "date") {
        return Date.parse(a[field] as string) - Date.parse(b[field] as string);
      } else {
        return String(a[field]).localeCompare(String(b[field]));
      }
    });
    setOriginalMembers(currentMembers); // Save original state
    setCurrentMembers(sortedMembers); // Set sorted members
  };

  // Function to handle sorting based on column clicked
  const sorting = (tableHeader: string) => {
    if (isSorted) {
      // Reset to original list if already sorted
      setCurrentMembers(originalMembers);
    } else {
      switch (tableHeader) {
        case "ByAdminsName":
          sortByField("name", "string");
          break;
        case "ByAdminsEmail":
          sortByField("email", "string");
          break;
        case "ByAdminsPermissions":
          sortByField("role", "string");
          break;
        case "ByAdminsJoinDate":
          sortByField("joinedDate", "string");
          break;
        default:
          console.warn("Unknown table header");
      }
    }

    setIsSorted(!isSorted); // Toggle sorting state
    console.log("Sorted members:", currentMembers); // Debugging
  };

  const sortInviteByField = (
    field: keyof InviteMember,
    type: "string" | "number" | "date" = "string"
  ) => {
    const sortedMembers = [...inviteCurrentMembers].sort((a, b) => {
      if (type === "number") {
        return Number(a[field]) - Number(b[field]);
      } else if (type === "date") {
        return Date.parse(a[field] as string) - Date.parse(b[field] as string);
      } else {
        return String(a[field]).localeCompare(String(b[field]));
      }
    });
    setInviteOriginalMembers(inviteCurrentMembers); // Save original state
    setInviteCurrentMembers(sortedMembers); // Set sorted members
  };

  // Function to handle sorting based on column clicked
  const sortInviteMembers = (tableHeader: string) => {
    if (isSorted) {
      // Reset to original list if already sorted
      setInviteCurrentMembers(inviteOriginalMembers);
    } else {
      switch (tableHeader) {
        case "ByInviteMemberName":
          sortInviteByField("name", "string");
          break;
        case "ByInviteMemberRole":
          sortInviteByField("role", "string");
          break;
        case "ByMemberInvitedAt":
          sortInviteByField("invitedAt", "string");
          break;
        case "ByMemberExpiresAt":
          sortInviteByField("expiresAt", "string");
          break;
        case "ByMemberStatus":
          sortInviteByField("status", "string");
          break;
        default:
          console.warn("Unknown table header");
      }
    }
    setIsSorted(!isSorted);
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  return (
    <div className="flex-col gap-6 h-full overflow-y-auto no-scrollbar">
      <Toaster />
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-left">Admins</h2>
              <p className="text-sm text-gray-600">
                Here you can manage the TravelAd admins
              </p>
            </div>
          </div>
        </CardHeader>
        <div className="pr-6 pl-6">
          <Input placeholder="Search admins" />
        </div>
        <CardContent>
          <div className="rounded-md border mt-4">
            <div className="max-h-[50vh] overflow-y-auto">
              <Table
                className="rounded-xl whitespace-nowrap border-gray-200 "
                style={{ color: "#020202", fontSize: "15px" }}
              >
                <TableHeader className="text-center">
                  <TableRow>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start cursor-pointer">
                        Name{" "}
                        <CaretSortIcon
                          onClick={() => sorting("ByAdminsName")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Email{" "}
                        <CaretSortIcon
                          onClick={() => sorting("ByAdminsEmail")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Permissions{" "}
                        <CaretSortIcon
                          onClick={() => sorting("ByAdminsPermissions")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Joined at{" "}
                        <CaretSortIcon
                          onClick={() => sorting("ByAdminsJoinDate")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAdmins.map((admin, index) => (
                    <>
                      <TableRow key={index}>
                        <TableCell className="flex items-center space-x-2 py-4">
                          <Avatar>
                            <AvatarImage src={imageSrc} />
                            <AvatarFallback className="mt-1">
                              {admin.first_name?.[0].toUpperCase() || "N/A"}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {admin.first_name + " " + admin.last_name}
                          </span>
                          {admin.email === personalemail && (
                            <Badge className="ml-2 bg-blue-500 text-white">
                              You
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-left">
                          {admin.email}
                        </TableCell>
                        <TableCell className="text-left">
                          <Badge
                            className="text-white"
                            style={{
                              backgroundColor: "#000000",
                            }}
                          >
                            {"Super Admin"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left">
                          {admin.createdAt}
                        </TableCell>

                        <TableCell className="text-left">
                          {personalemail === "fazil@agnointel.ai" &&
                            admin.email !== "fazil@agnointel.ai" && (
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  className="ml-2 cursor-pointer"
                                  onClick={() =>
                                    console.log("Dropdown triggered")
                                  }
                                >
                                  <DotsHorizontalIcon className="cursor-pointer w-6 h-6" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-24 bg-gray-200"
                                >
                                  <DropdownMenuItem
                                    onClick={() => {
                                      console.log(
                                        `Revoke Access clicked for Admin ID: ${admin.id}`
                                      );
                                      DeleteAdminAccess(admin.id);
                                    }}
                                  >
                                    Revoke Access
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                        </TableCell>
                      </TableRow>
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites Section */}
    </div>
  );
};

export default Team;
