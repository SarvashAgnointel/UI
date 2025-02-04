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

interface ConnectSMSProps {
  open: boolean;
  handleClose: () => void;
  checkIsAlive: () => void;
}

interface ConnectionList{
  id:number,
  channelName: string,
  type: string,
  host: string,
  port: number,
  systemId: string,
  password: string,
  created_date: string
}

export const ConnectSMS: FC<ConnectSMSProps> = ({
  open,
  handleClose,
  checkIsAlive,
}) => {
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 500);
    }
  }, [open]);
  const smsUrl = useSelector((state: RootState) => state.authentication.smsUrl);
  const [host, setHost] = useState("");
  const [port, setPort] = useState<Number>();
  const [systemId, setSystemId] = useState("");
  const [password, setPassword] = useState("");
  const [serverType, setServerType] = useState("SMPP");
  const [channelName, setChannelName] = useState("");
  const toast = useToast();
  const dispatch = useDispatch();

  const createChannel = async() =>{
    try{
      const response = await axios.post(`${smsUrl}/createchannel`,{
        ChannelName:channelName,
        Type:serverType,
        Host:host,
        Port:port,
        SystemId:systemId,
        Password:password
      });
      if(response.data.status==="Success"){
        toast.toast({
          title: "Success",
          description: "Server details stored successfully",
        });
        handleConnect();
      }
      else{
        toast.toast({
          title: "Error",
          description: "There was an issue in storing server credentials",
        });
      }
    }
    catch(error){
      console.log("error storing server details: ",error); 
    }
  }

  const handleConnect = async () => {
    try {
      const response = await axios.post(`${smsUrl}/connect`, {
        Host: host,
        Port: port,
        SystemId: systemId,
        Password: password,
      });
      if (response.data.status === "Success") {
        dispatch(setSMPPStatus(true));
        checkIsAlive();
        toast.toast({
          title: "Success",
          description: "Connected Successfully",
        });
        console.log("SMPP server connected successfully");
        handleClose();
      } else {
        toast.toast({
          title: "Failure",
          description: "Could not connect with SMPP server",
        });

        console.error("Could not connect with SMPP server");
      }
    } catch (error) {
      toast.toast({
        title: "Failure",
        description: "API call failed",
      });
      console.error("api call failed for SMPP connection");
    }
  };

  return (
<Dialog open={open} onOpenChange={handleClose}>
      <Toaster />
      <DialogContent className="m-2">
        <DialogHeader>
          <DialogTitle className="font-semibold text-[#09090B] text-[18px]">
            Connect with SMPP server
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-[6px]">
              <Label htmlFor="host-name" className="text-14px font-medium text-[#020617]">
                Channel Name
              </Label>
              <Input
                id="channel-name"
                type="text"
                placeholder="Add your channel name..."
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="text-[14px] font-normal placeholder:text-[#64748B]"
              />
        </div>

        <div className="flex flex-col gap-[6px]">
          <Label htmlFor="server-type" className="text-14px font-medium text-[#020617]">
            Server Type
          </Label>
          <Select
            value={serverType}
            onValueChange={(value) => setServerType(value)}
          >
            <SelectTrigger className="text-gray-500 mt-2 flex items-center justify-between px-3">
              <SelectValue placeholder="Select Type of SMS Channel" className="text-[#64748B] text-sm font-normal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="text-[#64748B] text-sm font-normal" value="SMPP">
                SMPP
              </SelectItem>
              <SelectItem className="text-[#64748B] text-sm font-normal" value="API">
                REST API
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {serverType === "SMPP" && (
          <>
            <div className="flex flex-col gap-[6px]">
              <Label htmlFor="host-name" className="text-14px font-medium text-[#020617]">
                Host
              </Label>
              <Input
                id="host-name"
                type="text"
                placeholder="Add your host..."
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="text-[14px] font-normal placeholder:text-[#64748B]"
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <Label htmlFor="port-name" className="text-14px font-medium text-[#020617]">
                Port
              </Label>
              <Input
                id="port-name"
                type="text"
                placeholder="Add your port number..."
                value={port !== undefined ? port.toString() : ""}
                onChange={(e) => setPort(Number(e.target.value))}
                className="text-[14px] font-normal placeholder:text-[#64748B]"
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <Label htmlFor="system-id" className="text-14px font-medium text-[#020617]">
                System ID
              </Label>
              <Input
                id="system-id"
                type="text"
                placeholder="Add your system id..."
                value={systemId}
                onChange={(e) => setSystemId(e.target.value)}
                className="text-[14px] font-normal placeholder:text-[#64748B]"
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <Label htmlFor="password" className="text-14px font-medium text-[#020617]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Add your password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-[14px] font-normal placeholder:text-[#64748B]"
              />
            </div>
          </>
        )}

        <div className="mb-4 flex justify-center w-full">
          <Button className="w-full" onClick={()=>createChannel()}>
            Connect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AdminSMS: FC = () => {
  const smsUrl = useSelector((state: RootState) => state.authentication.smsUrl);
  const smppConnectStatus = useSelector(
    (state: RootState) => state.sms.smppConnectStatus
  );
  const toast = useToast();
  const [open, setOpen] = useState(false);
  // const [isAlive,setIsAlive] = useState(false);

  const [connectionList, setConnectionList] = useState<ConnectionList[]>();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    getConnectionList();
    setOpen(false);
  }

  const dispatch = useDispatch();

  const checkIsAlive = async () => {
    const response = await axios.get(`${smsUrl}/isAlive`);
    if (response.data.status === "Success") {
      dispatch(setSMPPStatus(true));
    } else {
      dispatch(setSMPPStatus(false));
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await axios.post(`${smsUrl}/disconnect`);
      if (response.data.status === "Success") {
        dispatch(setSMPPStatus(false));
        checkIsAlive();
        toast.toast({
          title: "Success",
          description: "Disconnected from SMPP server",
        });
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

  const getConnectionList = async() =>{
    try{
      const response = await axios.get(`${smsUrl}/getchannels`);
      if(response.data.status === "Success"){
        setConnectionList(response.data.channelList);
        console.log(connectionList,16,2);
      }
      else{
        console.error("List of connections not found")
      }
    }
    catch(error){
      console.error("error getting connection list: ",error);
    }
  }

  useEffect(() => {
    dispatch(setSMPPStatus(false));
    getConnectionList();
    checkIsAlive();
  }, []);

  return (
    <div>
              <div className="fixed flex justify-end items-end right-0 top-[-15px] z-20 p-4">
              <Button
        onClick={() => handleOpen()}
        className="w-36 text-sm font-thin h-[35px] mt-[10px]"
      >
        Connect Server
        </Button>
        </div>
        <div className="flex flex-col gap-4">
    {/* <Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Channel Name</TableHead>
      <TableHead>Channel Type</TableHead>
      <TableHead>Host</TableHead>
      <TableHead>Port</TableHead>
      <TableHead>Created Date</TableHead>
  
    </TableRow>
  </TableHeader>
  <TableBody>

      {connectionList?.map((connection, index) => (
        <TableRow  key={connection.id}>
        <TableCell className="bg-[#F1F5F9CC] font-medium">{connection.channelName}</TableCell>
        <TableCell className="bg-[#F1F5F9CC] font-medium">{connection.type}</TableCell>
        <TableCell className="bg-[#F1F5F9CC] font-medium">{connection.host}</TableCell>
        <TableCell className="bg-[#F1F5F9CC] font-medium">{connection.port}</TableCell>
        <TableCell className="bg-[#F1F5F9CC] font-medium">{connection.created_date}</TableCell>
        </TableRow>
      ))}
  </TableBody>
</Table> */}

<Table
                className="rounded-xl whitespace-nowrap border-gray-[#020202]"
                style={{ color: "#020202", fontSize: "15px" }}
              >
                <TableHeader className="text-center text-[14px] font-medium">
                  <TableRow className="sticky top-0 bg-white z-10"> {/* Sticky header */}
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
                    <TableHead className="text-left">
                    
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="text-left text-[14px] font-normal text-[#020617]">
                  {connectionList?.map((connection) => {

                    return (
                      <TableRow
                        key={connection.id}
                      >
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
                              {new Date(connection.created_date).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )}{" "}
                              ∙{" "}
                              {new Date(connection.created_date).toLocaleTimeString(
                                "en-GB",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell  className="py-4 flex">
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

                        <TableCell className="py-4 pr-4 flex justify-end">
                          <DotsHorizontalIcon/>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>


    </div>
    <ConnectSMS
          open={open}
          handleClose={handleClose}
          checkIsAlive={checkIsAlive}
        />
    </div>

  );
};
export default AdminSMS;
