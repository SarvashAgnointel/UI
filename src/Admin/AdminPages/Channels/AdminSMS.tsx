import React, { FC, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../Components/ui/select";
import { Input } from "../../../Components/ui/input";
import { Label } from "../../../Components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../Components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../Components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../Components/ui/table";
import { useToast } from "../../../Components/ui/use-toast";
import { Toaster } from "../../../Components/ui/toaster";
import { Button } from "../../../Components/ui/button";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../State/store";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { CircularProgress } from "@mui/material";

interface ConnectSMSProps {
  open: boolean;
  handleClose: () => void;
  checkIsAlive: (channelId: number) => Promise<boolean>;
  serverList: ServerList[] | undefined;
}

interface ServerList {
  serverId: number;
  serverName: string;
  serverType: string;
  serverUrl: string;
}

export const ConnectSMS: FC<ConnectSMSProps> = ({
  open,
  handleClose,
  checkIsAlive,
  serverList,
}) => {
  const smsUrl = useSelector((state: RootState) => state.authentication.smsUrl);
  const [serverName, setServerName] = useState("");
  const [serverType, setServerType] = useState("SMPP");
  const [serverURL, setServerURL] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const toast = useToast();

  const validateField = (
    name: string,
    value: string | number | undefined
  ) => {
    let errorMsg = "";
    const stringValue =
      value !== undefined && value !== null ? value.toString().trim() : "";

    if (name === "serverName") {
      if (!stringValue) {
        errorMsg = "Server Name is required";
      } else if (
        serverList?.some((conn) => conn.serverName === stringValue)
      ) {
        errorMsg = "Server Name already exists";
      }
    }

    if (name === "serverURL" && !stringValue) {
      errorMsg = "Server URL is required";
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: errorMsg }));
  };

  const validateAllFields = () => {
    let newErrors: { [key: string]: string } = {};
    if (!serverName.trim()) newErrors.serverName = "Server Name is required";
    if (!serverURL.trim()) newErrors.serverURL = "Server URL is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    name: string,
    value: string | number | undefined
  ) => {
    if (name === "serverName") setServerName(value as string);
    if (name === "serverURL") setServerURL(value as string);

    validateField(name, value);
  };

  const createChannel = async () => {
    if (!validateAllFields()) {
      toast.toast({
        title: "Validation Error",
        description: "Please fill all required fields before connecting.",
      });
      return;
    }
    try {
      const response = await axios.post(`${smsUrl}/createserver`, {
        serverName,
        serverType,
        serverUrl: serverURL,
      });
      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "Server details stored successfully",
        });
        handleClose(); // Close the dialog upon success
      } else {
        toast.toast({
          title: "Error",
          description: "There was an issue in storing server credentials",
        });
      }
    } catch (error) {
      console.log("error storing server details: ", error);
    }
  };
  

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <Toaster />
      <DialogContent className="overflow-y-auto max-h-screen">
        <DialogHeader>
          <DialogTitle className="font-semibold text-[#09090B] text-[18px]">
            Connect with SMPP server
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-[6px]">
          <Label
            htmlFor="server-name"
            className="text-14px font-medium text-[#020617]"
          >
            Server Name
          </Label>
          <Input
            id="server-name"
            type="text"
            placeholder="Add your server name..."
            value={serverName}
            onChange={(e) => handleInputChange("serverName", e.target.value)}
            className="text-[14px] font-normal placeholder:text-[#64748B]"
          />
          {errors.serverName && (
            <p className="text-red-500 text-xs">{errors.serverName}</p>
          )}
        </div>

        <div className="flex flex-col gap-[6px]">
          <Label
            htmlFor="server-type"
            className="text-14px font-medium text-[#020617]"
          >
            Server Type
          </Label>
          <Select
            value={serverType}
            onValueChange={(value) => setServerType(value)}
          >
            <SelectTrigger className="text-gray-500 mt-2 flex items-center justify-between px-3">
              <SelectValue
                placeholder="Select Type of SMS Channel"
                className="text-[#64748B] text-sm font-normal"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                className="text-[#64748B] text-sm font-normal"
                value="SMPP"
              >
                SMPP
              </SelectItem>
              <SelectItem
                className="text-[#64748B] text-sm font-normal"
                value="API"
              >
                REST API
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-[6px]">
          <Label
            htmlFor="server-url"
            className="text-14px font-medium text-[#020617]"
          >
            Server URL
          </Label>
          <Input
            id="server-url"
            type="text"
            placeholder="Add your server URL..."
            value={serverURL}
            onChange={(e) => handleInputChange("serverURL", e.target.value)}
            className="text-[14px] font-normal placeholder:text-[#64748B]"
          />
          {errors.serverURL && (
            <p className="text-red-500 text-xs">{errors.serverURL}</p>
          )}
        </div>

        <div className="mb-4 flex justify-center w-full">
          <Button className="w-full" onClick={createChannel}>
            Connect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AdminSMS: FC = () => {
  const smsUrl = useSelector((state: RootState) => state.authentication.smsUrl);
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  const [connectionList, setConnectionList] = useState<ServerList[]>();
  const [connectionStatus, setConnectionStatus] = useState<
    Record<number, string>
  >({});

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    getConnectionList();
    setOpen(false);
  };

  const dispatch = useDispatch();

  const checkIsAlive = async (channelId: number) => {
    const response = await axios.get(
      `${smsUrl}/isAlive?channelId=${channelId}`
    );
    return response.data.status === "Success";
  };

  const checkIsAliveForConnectionList = async (channelId: number) => {
    try {
      setConnectionStatus((prev) => ({ ...prev, [channelId]: "Loading..." }));
      const response = await axios.get(
        `${smsUrl}/isAlive?channelId=${channelId}`
      );
      if (response.data.status === "Success") {
        setConnectionStatus((prev) => ({ ...prev, [channelId]: "Connected" }));
      } else {
        setConnectionStatus((prev) => ({
          ...prev,
          [channelId]: "Disconnected",
        }));
      }
    } catch (error) {
      setConnectionStatus((prev) => ({ ...prev, [channelId]: "Disconnected" }));
      console.error(
        `Error checking connection status for channel ${channelId}:`,
        error
      );
    }
  };

  const handleDisconnect = async (channelId: number) => {
    try {
      const response = await axios.post(
        `${smsUrl}/disconnect?channelId=${channelId}`
      );
      if (response.data.status === "Success") {
        checkIsAlive(channelId);
        toast.toast({
          title: "Success",
          description: "Disconnected from SMPP server",
        });
        getConnectionList();
      } else {
        toast.toast({
          title: "Error",
          description: "Could not disconnect SMPP server",
        });
      }
    } catch (error) {
      console.error("API error in disconnecting from SMPP server: " + error);
    }
  };

  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  const getConnectionList = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${smsUrl}/getservers`);
      if (response.data.status === "Success") {
        setConnectionList(response.data.serverList);
        response.data.channelList.forEach((connection: ServerList) => {
          checkIsAliveForConnectionList(connection.serverId);
        });
      } else {
        console.error("List of connections not found");
      }
    } catch (error) {
      console.error("error getting connection list: ", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getConnectionList();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <CircularProgress />
        </div>
      ) : (
        <div>
          <div className="fixed flex justify-end items-end right-0 top-[-15px] z-20 p-4">
            <Button
              onClick={handleOpen}
              className="w-36 text-sm font-thin h-[35px] mt-[10px] mb-[30px]"
            >
              Connect Server
            </Button>
          </div>
          {connectionList ? (
            <div className="rounded-md border overflow-hidden">
              <div className="max-h-[60vh] overflow-y-auto">
                <Table className="rounded-xl border-[#020202]">
                  <TableHeader className="text-center text-[14px] font-medium">
                    <TableRow className="sticky top-0 bg-white z-10">
                      <TableHead>
                        <div className="flex items-center gap-6 justify-start cursor-pointer">
                          <span className="font-medium text-[14px] text-[#64748B]">
                            Server Name
                          </span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2 justify-start">
                          <span className="font-medium text-[14px] text-[#64748B]">
                            Server Type
                          </span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[14px] text-[#64748B]">
                            Server URL
                          </span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[14px] text-[#64748B]">
                            Status
                          </span>
                        </div>
                      </TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="text-left text-[14px] font-normal text-[#020617]">
                    {connectionList.map((connection) => (
                      <TableRow key={connection.serverId}>
                        <TableCell className="flex justify-start py-4">
                          <div className="flex items-center gap-6">
                            <span
                              style={{
                                color: "#020617",
                                fontSize: "14px",
                                fontWeight: "400",
                              }}
                            >
                              {connection.serverName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span
                            style={{
                              color: "#020617",
                              fontSize: "14px",
                              fontWeight: "400",
                            }}
                          >
                            {connection.serverType}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span
                            style={{
                              color: "#020617",
                              fontSize: "14px",
                              fontWeight: "400",
                            }}
                          >
                            {connection.serverUrl}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span
                            style={{
                              color: "#020617",
                              fontSize: "14px",
                              fontWeight: "400",
                            }}
                          >
                            {connectionStatus[connection.serverId] || "Loading..."}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <DotsHorizontalIcon
                                onClick={() =>
                                  handleMenuToggle(connection.serverId)
                                }
                                className="cursor-pointer w-6 h-6"
                              />
                            </DropdownMenuTrigger>
                            {openMenuRowId === connection.serverId && (
                              <DropdownMenuContent
                                align="end"
                                className="w-20 bg-gray-200"
                              >
                                <DropdownMenuItem>
                                  Reconnect
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDisconnect(connection.serverId)
                                  }
                                >
                                  Disconnect
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            )}
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-screen">
              <Button
                onClick={handleOpen}
                className="w-36 text-sm font-thin h-[35px] mt-[10px] mb-[30px]"
              >
                Connect Server
              </Button>
            </div>
          )}

          <ConnectSMS
            open={open}
            handleClose={handleClose}
            checkIsAlive={checkIsAlive}
            serverList={connectionList}
          />
        </div>
      )}
    </>
  );
};

export default AdminSMS;
