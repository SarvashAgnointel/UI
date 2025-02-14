import React, { FC, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../Components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../Components/ui/select";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../Components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../Components/ui/table";
import { useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";
import { Button } from "../../Components/ui/button";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../State/store";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { CircularProgress } from "@mui/material";
import { HandPlatter } from "lucide-react";
import { toast } from "react-toastify";
import { title } from "process";

interface PhoneNumberList {
  id: number;
  phone_name: string;
  phone_number: string;
  created_date: string;
  last_updated_date: string;
}

interface AddPhoneProps {
  open: boolean;
  handleClose: () => void;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  phone_Id: number;
  phone_Name: string;
  phone_Number: string;
  // connectionList: PhoneNumberList[] | undefined;
}

export const AddPhone: FC<AddPhoneProps> = ({
  open,
  handleClose,
  isEdit,
  setIsEdit,
  phone_Id,
  phone_Name,
  phone_Number,
  // Accept connection list as a prop
}) => {
  const advurl = useSelector((state: RootState) => state.authentication.apiURL);
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );

  const [phoneName, setPhoneName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [editPhoneId, setEditPhoneId] = useState(0);
  const toast = useToast();

 useEffect(() => {
    if (!open) {
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 500);
    }
  }, [open]);

  const addPhoneNumber = async () => {
    try {
      const response = await axios.post(`${advurl}/InsertSMSPhoneNumber`, {
        phoneName: phoneName,
        phoneNumber: phoneNumber,
        workspaceId: workspaceId,
      });
      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "Phone Number Added Successfully",
        });
        handleClose();
        setIsEdit(false);
      } else {
        toast.toast({
          title: "Error",
          description: "Phone number could not be inserted",
        });
      }
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Api Call Failed",
      });
      console.error("Api call failed for addPhoneNumber: ", error);
    }
  };

  const UpdatePhoneNumber = async (id: number) => {
    try {
      const response = await axios.put(`${advurl}/UpdateSMSPhoneNumber`, {
        phoneName: phoneName,
        phoneNumber: phoneNumber,
        id: id,
      });
      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "Phone Number Updated Successfully",
        });
        handleClose();
        setIsEdit(false);
      } else {
        toast.toast({
          title: "Error",
          description: "Phone number could not be updated",
        });
      }
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Api Call Failed",
      });
      console.error("Api call failed for updatePhoneNumber: ", error);
    }
  };
  useEffect(() => {
    if (isEdit) {
      setEditPhoneId(phone_Id);
      setPhoneName(phone_Name);
      setPhoneNumber(phone_Number);
    }
    else{
      setEditPhoneId(0);
      setPhoneName("");
      setPhoneNumber("");
    }
  },[isEdit]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <Toaster />
      <DialogContent className="overflow-y-auto max-h-screen ">
        <DialogHeader>
          <DialogTitle className="font-semibold text-[#09090B] text-[18px]">
            {isEdit ? "Edit SMS Phone Number" : "Add SMS Phone Number"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-[6px]">
          <Label
            htmlFor="phone-name"
            className="text-14px font-medium text-[#020617]"
          >
            Phone Name
          </Label>
          <Input
            id="phone-name"
            type="text"
            placeholder="Add your phone name..."
            value={phoneName}
            onChange={(e) => setPhoneName(e.target.value)}
            className="text-[14px] font-normal placeholder:text-[#64748B]"
          />
          {/* {errors.channelName && (
              <p className="text-red-500 text-xs">{errors.channelName}</p>
            )} */}
        </div>

        <div className="flex flex-col gap-[6px]">
          <Label
            htmlFor="phone-number"
            className="text-14px font-medium text-[#020617]"
          >
            Phone Number
          </Label>
          <Input
            id="phone-number"
            type="text"
            placeholder="Add your host..."
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="text-[14px] font-normal placeholder:text-[#64748B]"
          />
          {/* {errors.host && (
                  <p className="text-red-500 text-xs">{errors.host}</p>
                )} */}
        </div>

        <div className="mb-4 flex justify-center w-full">
          <Button
            className="w-full"
            onClick={() => {
              if (isEdit) {
                UpdatePhoneNumber(phone_Id);
              }
              else{
                addPhoneNumber();
              }
            }}
          >
            {isEdit?"Edit Phone Number":"Add Phone Number"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SMS: FC = () => {
  const [phoneNumberList, setPhoneNumberList] = useState<PhoneNumberList[]>();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [editPhoneName, setEditPhoneName] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editPhoneId, setEditPhoneId] = useState(0);
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  const advurl = useSelector((state: RootState) => state.authentication.apiURL);
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const toast = useToast();
  useEffect(() => {

    getPhoneNumbers();

  },[]);
  const getPhoneNumbers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${advurl}/GetSmsPhoneNumbers?workspace_id=${workspaceId}`
      );
      if (response.data.status === "Success") {
        console.log("Phone number retrieved successfully");
        setPhoneNumberList(response.data.phoneNumberList);
      } else {
        console.error(
          "phone number retrieval failed or no phone number exists"
        );
      }
    } catch (error) {
      console.error("api error in fetching phone numbers");
    }
    setIsLoading(false);
  };

  const deletePhoneNumber = async (id: number, name: string) => {
    setIsLoading(true);
    try {
      const response = await axios.delete(
        `${advurl}/DeleteSMSPhoneNumber?id=${id}`
      );
      if (response.data.status === "Success") {
        console.log("phone number deleted successfully");
        toast.toast({
          title: "Success",
          description: `${name} deleted successfully`,
        });
        getPhoneNumbers();
      } else {
        console.error("phone number could not be deleted");
        toast.toast({
          title: "Error",
          description: `${name} could not be deleted`,
        });
      }
    } catch (error) {
      console.error(
        "phone number could not be deleted due to api failure: ",
        error
      );
    }
    setIsLoading(false);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    getPhoneNumbers();
    setOpen(false);
    setIsEdit(false);
    setEditData(0, "", "");
  };
  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  const setEditData = (id: number, name: string, number: string) => {
    setEditPhoneId(id);
    setEditPhoneName(name);
    setEditPhoneNumber(number);
  };

  return (
    <>
    {isLoading?        (<div className="flex items-center justify-center h-screen">
              <CircularProgress />
            </div>):(<>
              <div>
        <Toaster />
        <div className="fixed flex justify-end items-end right-0 top-[-15px] z-20 p-4">
          <Button
            onClick={() => {
              handleOpen();
            }}
            className="w-36 text-sm font-thin h-[35px] mt-[10px] mb-[30px]"
          >
            Add Number
          </Button>
        </div>
        <div>
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
                          Phone Name
                        </span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2 justify-start">
                        <span className="font-medium text-[14px] text-[#64748B]">
                          Phone Number{" "}
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
                          Last Updated{" "}
                        </span>
                      </div>
                    </TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="text-left text-[14px] font-normal text-[#020617]">
                  {phoneNumberList?.map((phone) => {
                    return (
                      <TableRow key={phone.id}>
                        <TableCell className="flex justify-start py-4 text-green-900">
                          <div className="flex items-center gap-6">
                            <span
                              style={{
                                color: "#020617",
                                fontSize: "14px",
                                fontWeight: "400",
                              }}
                            >
                              {phone.phone_name}
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
                            {phone.phone_number}
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
                              {new Date(phone.created_date).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )}{" "}
                              ∙{" "}
                              {new Date(phone.created_date).toLocaleTimeString(
                                "en-GB",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
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
                                phone.last_updated_date
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}{" "}
                              ∙{" "}
                              {new Date(
                                phone.last_updated_date
                              ).toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4 ">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <DotsHorizontalIcon
                                onClick={() => handleMenuToggle(phone.id)}
                                className="cursor-pointer w-6 h-6"
                              />
                            </DropdownMenuTrigger>
                            {openMenuRowId === phone.id && (
                              <DropdownMenuContent
                                align="end"
                                className="w-20 bg-gray-200"
                              >
                                <DropdownMenuItem
                                  onClick={() => {
                                    setIsEdit(true);
                                    setEditData(
                                      phone.id,
                                      phone.phone_name,
                                      phone.phone_number
                                    );
                                    handleOpen();
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    deletePhoneNumber(
                                      phone.id,
                                      phone.phone_name
                                    );
                                  }}
                                >
                                  Delete
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
        </div>
      </div>
      <AddPhone
        open={open}
        handleClose={handleClose}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        phone_Id={isEdit ? editPhoneId : 0}
        phone_Name={isEdit ? editPhoneName : ""}
        phone_Number={isEdit ? editPhoneNumber : ""}
      />
            
            </>)
    
  }

    </>
  );
};

export default SMS;
