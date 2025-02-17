import React, { FC, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../Components/ui/card";
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
  DialogDescription,
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
import { setSMPPStatus } from "../../../State/slices/SmsSlice";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { CircularProgress } from "@mui/material";

interface ConnectSMSProps {
  open: boolean;
  handleClose: () => void;
  checkIsAlive: (channelId: number) => Promise<boolean>;
  connectionList: ConnectionList[] | undefined;
}

interface ConnectionList {
  id: number;
  channelName: string;
  type: string;
  host: string;
  port: number;
  systemId: string;
  password: string;
  created_date: string;
}

export const ConnectSMS: FC<ConnectSMSProps> = ({
  open,
  handleClose,
  checkIsAlive,
  connectionList, // Accept connection list as a prop
}) => {
  const smsUrl = useSelector((state: RootState) => state.authentication.smsUrl);
  const [host, setHost] = useState("");
  const [port, setPort] = useState<number | undefined>();
  const [systemId, setSystemId] = useState("");
  const [password, setPassword] = useState("");
  const [serverType, setServerType] = useState("SMPP");
  const [channelName, setChannelName] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const toast = useToast();

  const validateField = (name: string, value: string | number | undefined) => {
    let errorMsg = "";
    const stringValue =
      value !== undefined && value !== null ? value.toString().trim() : "";

    if (name === "channelName") {
      if (!stringValue) {
        errorMsg = "Channel Name is required";
      } else if (
        connectionList?.some((conn) => conn.channelName === stringValue)
      ) {
        errorMsg = "Channel Name already exists";
      }
    }

    if (name === "host" && !stringValue) errorMsg = "Host is required";
    if (name === "port" && (!value || isNaN(Number(value))))
      errorMsg = "Valid Port is required";
    if (name === "systemId" && !stringValue) errorMsg = "System ID is required";
    if (name === "password" && !stringValue) errorMsg = "Password is required";

    setErrors((prevErrors) => ({ ...prevErrors, [name]: errorMsg }));
  };

  // Function to validate all fields before API call
  const validateAllFields = () => {
    let newErrors: { [key: string]: string } = {};

    if (!channelName.trim()) newErrors.channelName = "Channel Name is required";
    if (serverType === "SMPP") {
      if (!host.trim()) newErrors.host = "Host is required";
      if (!port || isNaN(Number(port)))
        newErrors.port = "Valid Port is required";
      if (!systemId.trim()) newErrors.systemId = "System ID is required";
      if (!password.trim()) newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if there are no errors
  };

  // Handle input change and validate
  const handleInputChange = (
    name: string,
    value: string | number | undefined
  ) => {
    if (name === "channelName") setChannelName(value as string);
    if (name === "host") setHost(value as string);
    if (name === "port") setPort(Number(value));
    if (name === "systemId") setSystemId(value as string);
    if (name === "password") setPassword(value as string);

    validateField(name, value);
  };

  const handleConnect = async (channelId: number) => {
    // Validate all fields before making API call
    if (!validateAllFields()) {
      toast.toast({
        title: "Validation Error",
        description: "Please fill all required fields before connecting.",
      });
      return; // Stop API call if validation fails
    }

    try {
      const response = await axios.post(`${smsUrl}/connect`, {
        Host: host,
        Port: port,
        SystemId: systemId,
        Password: password,
        channelId: channelId,
      });
      if (response.data.status === "Success") {
        
        checkIsAlive(channelId);
        toast.toast({
          title: "Success",
          description: "Connected Successfully",
        });
      } else {
        toast.toast({
          title: "Failure",
          description: "Could not connect with SMPP server",
        });
      }
    } catch (error) {
      toast.toast({ title: "Failure", description: "API call failed" });
    }
  };

  const createChannel = async () => {
    if (!validateAllFields()) {
      toast.toast({
        title: "Validation Error",
        description: "Please fill all required fields before connecting.",
      });
      return; // Stop API call if validation fails
    }
    try {
      const response = await axios.post(`${smsUrl}/createchannel`, {
        ChannelName: channelName,
        Type: serverType,
        Host: host,
        Port: port,
        SystemId: systemId,
        Password: password,
      });
      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "Server details stored successfully",
        });
        handleConnect(response.data.channel_id);
        handleClose();
        // handleConnect();
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
      <DialogContent className="overflow-y-auto max-h-screen ">
        <DialogHeader>
          <DialogTitle className="font-semibold text-[#09090B] text-[18px]">
            Connect with SMPP server
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-[6px]">
          <Label
            htmlFor="channel-name"
            className="text-14px font-medium text-[#020617]"
          >
            Channel Name
          </Label>
          <Input
            id="channel-name"
            type="text"
            placeholder="Add your channel name..."
            value={channelName}
            onChange={(e) => handleInputChange("channelName", e.target.value)}
            className="text-[14px] font-normal placeholder:text-[#64748B]"
          />
          {errors.channelName && (
            <p className="text-red-500 text-xs">{errors.channelName}</p>
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

        {serverType === "SMPP" && (
          <>
            <div className="flex flex-col gap-[6px]">
              <Label
                htmlFor="host-name"
                className="text-14px font-medium text-[#020617]"
              >
                Host
              </Label>
              <Input
                id="host-name"
                type="text"
                placeholder="Add your host..."
                value={host}
                onChange={(e) => handleInputChange("host", e.target.value)}
                className="text-[14px] font-normal placeholder:text-[#64748B]"
              />
              {errors.host && (
                <p className="text-red-500 text-xs">{errors.host}</p>
              )}
            </div>

            <div className="flex flex-col gap-[6px]">
              <Label
                htmlFor="port-name"
                className="text-14px font-medium text-[#020617]"
              >
                Port
              </Label>
              <Input
                id="port-name"
                type="text"
                placeholder="Add your port number..."
                value={port !== undefined ? port.toString() : ""}
                onChange={(e) => handleInputChange("port", e.target.value)}
                className="text-[14px] font-normal placeholder:text-[#64748B]"
              />
              {errors.port && (
                <p className="text-red-500 text-xs">{errors.port}</p>
              )}
            </div>

            <div className="flex flex-col gap-[6px]">
              <Label
                htmlFor="system-id"
                className="text-14px font-medium text-[#020617]"
              >
                System ID
              </Label>
              <Input
                id="system-id"
                type="text"
                placeholder="Add your system id..."
                value={systemId}
                onChange={(e) => handleInputChange("systemId", e.target.value)}
                className="text-[14px] font-normal placeholder:text-[#64748B]"
              />
              {errors.systemId && (
                <p className="text-red-500 text-xs">{errors.systemId}</p>
              )}
            </div>

            <div className="flex flex-col gap-[6px]">
              <Label
                htmlFor="password"
                className="text-14px font-medium text-[#020617]"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Add your password..."
                value={password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="text-[14px] font-normal placeholder:text-[#64748B]"
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>
          </>
        )}

        <div className="mb-4 flex justify-center w-full">
          <Button className="w-full" onClick={() => createChannel()}>
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
  // const [isAlive,setIsAlive] = useState(false);

  const [connectionList, setConnectionList] = useState<ConnectionList[]>();
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
    if (response.data.status === "Success") {
      // dispatch(setSMPPStatus(true));
      return true;
    } else {
      // dispatch(setSMPPStatus(false));
      return false;
    }
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

  const handleReconnect = async (
    channelId: number,
    host: string,
    port: number,
    systemId: string,
    password: string,
    channelName:string
  ) => {
    // Validate all fields before making API call
    // if (!validateAllFields()) {
    //   toast.toast({
    //     title: "Validation Error",
    //     description: "Please fill all required fields before connecting.",
    //   });
    //   return; // Stop API call if validation fails
    // }

    try {
      const response = await axios.post(`${smsUrl}/connect`, {
        Host: host,
        Port: port,
        SystemId: systemId,
        Password: password,
        channelId: channelId,
      });
      if (response.data.status === "Success") {
        
        checkIsAlive(channelId);
        toast.toast({
          title: "Success",
          description: `Re-Connected ${channelName} Successfully`,
        });
        getConnectionList();
      } else {
        toast.toast({
          title: "Failure",
          description: `Could not connect with ${channelName}`,
        });
      }
    } catch (error) {
      toast.toast({ title: "Failure", description: "API call failed" });
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
        console.log("Disconnected from SMPP server");
      } else {
        toast.toast({
          title: "Error",
          description: "Could not disconnect SMPP server",
        });
        console.error("Disconnected from SMPP server");
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
      const response = await axios.get(`${smsUrl}/getchannels`);
      if (response.data.status === "Success") {
        setConnectionList(response.data.channelList);
        response.data.channelList.forEach((connection: ConnectionList) => {
          checkIsAliveForConnectionList(connection.id); // Fetch the status for each connection
        });
        console.log(connectionList, 16, 2);
      } else {
        console.error("List of connections not found");
      }
    } catch (error) {
      console.error("error getting connection list: ", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    
    getConnectionList();
    // checkIsAlive();
    setIsLoading(false);
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
              onClick={() => handleOpen()}
              className="w-36 text-sm font-thin h-[35px] mt-[10px] mb-[30px]"
            >
              Connect Server
            </Button>
          </div>
          {connectionList != null ? (
          <div className="rounded-md border overflow-hidden">
            <div className="max-h-[60vh] overflow-y-auto">
              <Table className="rounded-xl border-[#020202]">
                <TableHeader className="text-center text-[14px] font-medium">
                  <TableRow className="sticky top-0 bg-white z-10">
                    {" "}
                    {/* Sticky header */}
                    <TableHead>
                      <div className="flex items-center gap-6 justify-start cursor-pointer">
                        <span className="font-medium text-[14px] text-[#64748B]">
                          Channel Name{" "}
                        </span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2 justify-start">
                        <span className="font-medium text-[14px] text-[#64748B]">
                          Channel Type{" "}
                        </span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2 ">
                        <span className="font-medium text-[14px] text-[#64748B]">
                          Created Date{" "}
                        </span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2 ">
                        <span className="font-medium text-[14px] text-[#64748B]">
                          Status{" "}
                        </span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2 ">
                        <span className="font-medium text-[14px] text-[#64748B]">
                          Host{" "}
                        </span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2 justify-start">
                        <span className="font-medium text-[14px] text-[#64748B]">
                          Port{" "}
                        </span>
                      </div>
                    </TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="text-left text-[14px] font-normal text-[#020617]">
                  {connectionList?.map((connection) => {
                    return (
                      <TableRow key={connection.id}>
                        <TableCell className="flex justify-start py-4 text-green-900">
                          <div className="flex items-center gap-6">
                            <span
                              style={{
                                color: "#020617",
                                fontSize: "14px",
                                fontWeight: "400",
                              }}
                            >
                              {connection.channelName}
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
                            {connection.type}
                          </span>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex gap-2">
                            <span
                              style={{
                                color: "#020617",
                                fontSize: "14px",
                                fontWeight: "400",
                              }}
                            >
                              {new Date(
                                connection.created_date
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}{" "}
                              ∙{" "}
                              {new Date(
                                connection.created_date
                              ).toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
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
                            {connectionStatus[connection.id] || "Loading..."}
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
                            {connection.host}
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
                            {connection.port}
                          </span>
                        </TableCell>

                        <TableCell className="py-4 ">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <DotsHorizontalIcon
                                onClick={() => handleMenuToggle(connection.id)}
                                className="cursor-pointer w-6 h-6"
                              />
                            </DropdownMenuTrigger>
                            {openMenuRowId === connection.id && (
                              <DropdownMenuContent
                                align="end"
                                className="w-20 bg-gray-200"
                              >
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleReconnect(
                                      connection.id,
                                      connection.host,
                                      connection.port,
                                      connection.systemId,
                                      connection.password,
                                      connection.channelName
                                    )
                                  }
                                >
                                  Reconnect
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDisconnect(connection.id)
                                  }
                                >
                                  Disconnect
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
          ) : (
            <div className="flex items-center justify-center h-screen">
              <Button
                onClick={() => handleOpen()}
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
            connectionList={connectionList}
          />
        </div>
      )}
    </>
  );
};
export default AdminSMS;
