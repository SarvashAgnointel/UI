import { FC, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import axios from "axios";
import { useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../Components/ui/table";
import { CaretSortIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import { table } from "console";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu";
import CircularProgress from "@mui/material/CircularProgress";
import { Badge } from "../../Components/ui/badge";

declare const FB: any; // Declare FB as a global object

export interface WhatsAppBusinessAccount {
  id: string;
  display_phone_number: string;
  verified_name: string;
  status: string; // Add more statuses if applicable
  quality_rating: string; // Add more ratings if needed
  search_visibility: string; // Add additional visibility statuses if applicable
  platform_type: string; // Add more platform types as necessary
  code_verification_status: string; // Add additional statuses if necessary
}

// Interface for Owner Business Info
export interface OwnerBusinessInfo {
  name: string;
  id: string;
}

// Interface for WhatsApp Owner Details Response
export interface WhatsappOwnerDetailsResponse {
  id: string;
  name: string;
  ownerBusinessInfo: OwnerBusinessInfo;
}

export interface WABA{
  wabaId: string;
  phoneId: string;
  Id:number;
}

const Whatsapp: FC = () => {
  const [wabaId, setWabaId] = useState('');
  const [phoneId, setPhoneId] = useState('');
  const [Id, setId] = useState(0);

  const [signInSts, setSignInSts] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tableData, setTableData] = useState<WhatsAppBusinessAccount[]>([]);
  const [connectStatus, setConnectStatus] = useState(false);
  const [whatsappOwnerDetails, setWhatsappOwnerDetails] =
    useState<WhatsappOwnerDetailsResponse | null>(null);
  const toast = useToast();
  const whatsappUrl = useSelector(
    (state: RootState) => state.authentication.apiURL
  );
  const emailId = useSelector(
    (state: RootState) => state.authentication.userEmail
  );
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  // const [wabaDetails,setwabaDetails] = useState<{ wabaId: string;phoneId: string;Id:number;}>({wabaId:"",phoneId:"",Id:0});
  useEffect(() => {
    setTimeout(() => {
      checkTokenValidity();
    }, 500);
  }, [connectStatus]);

  window.addEventListener(
    "message",
    (event) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      ) {
        return;
      }
      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP") {
          // if user finishes the Embedded Signup flow
          if (data.event === "FINISH") {
            const { phone_number_id, waba_id } = data.data;
            setWabaId(waba_id);
            setPhoneId(phone_number_id);
            
            // wabaId = waba_id;
            // phoneId = phone_number_id;
            console.log(
              "Phone number ID ",
              phone_number_id,
              " WhatsApp business account ID ",
              waba_id
            );
          }
        }
      } catch {
        console.log("Non JSON Responses", event.data);
      }
    },
    { once: true }
  );

  const afterLogin = async () => {
    await subscribeToWebhook();
    await checkTokenValidity();
  };

  // Facebook Login Callback
  const fbLoginCallback = (response: any) => {
    if (response.status === "connected") {
      console.log("login callback initiated");
      console.log("Login successful:", response.authResponse);
      const code = response.authResponse.code;
      if (code) {
        exchangeToken(code);
        console.log("code received");
      }
      const accessToken = response.authResponse.accessToken;
      console.log("login callback ended!");
    } else {
      console.error("User not logged in:", response);
    }
  };

  // Launch WhatsApp Signup
  const launchWhatsAppSignup = (mode: string) => {
    if (mode === "connect") {
      FB.login(fbLoginCallback, {
        config_id: "546715987994574",
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "",
          sessionInfoVersion: "2",
        },
      });
      setSignInSts("signup");
      subscribeToWebhook();
      checkTokenValidity();
      return true;
    } else if (mode === "addPhoneNumber") {
      FB.login(fbLoginCallback, {
        config_id: "546715987994574",
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "",
          sessionInfoVersion: "2",
        },
      });
      setSignInSts("addPhoneNumber");
      subscribeToWebhook();
      checkTokenValidity();
      return true;
    }
  };

  const subscribeToWebhook = async () => {
    try {
      const response = await axios.post(
        `${whatsappUrl}/SubscribeToWebhook?workspaceId=${workspaceId}`
      );
      if (response.data.status === "Success") {
        console.log("Webhook Subscribed Successfully");
      } else {
        console.error("Webhook Subscription failed");
      }
    } catch (error) {
      console.log("An error occurred during webhook subscription: ", error);
    }
  };

  const unsubscribeFromWebhook = async () => {
    try {
      const response = await axios.delete(
        `${whatsappUrl}/UnsubscribeFromWebhook?workspaceId=${workspaceId}`
      );
      if (response.data.status === "Success") {
        console.log("Webhook Unsubscribed Successfully");
      } else {
        console.error("Webhook Unsubscription failed");
      }
    } catch (error) {
      console.log("An error occurred during webhook unsubscription: ", error);
    }
  };

  const disconnectWhatsappAccount = async () => {
    try {
      const response = await axios.delete(
        `${whatsappUrl}/DisconnectWhatsappAccount?WorkspaceId=${workspaceId}`
      );
      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "Disconnected Whatsapp Account Successfully",
        });
        checkTokenValidity();
      } else {
        toast.toast({
          title: "Error",
          description: "Error in Disconnecting WABA",
        });
      }
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Disconnect API Error",
      });
    }
  };

  const checkTokenValidity = async () => {
    try {
      setLoading(true);
      // Check token validity
      const response = await axios.get(
        `${whatsappUrl}/IsWhatsappTokenValid?workspaceId=${workspaceId}`
      );
      console.log("status: " + response.data.status);
      if (response.data.status === "Success") {
        setIsTokenValid(response.data.isValid);
        setConnectStatus(true);
        console.log("token validity: ", isTokenValid);
        toast.toast({
          title: "Success",
          description: "Token is valid",
        });

        // Fetch table data
        const TableData = await axios.get(
          `${whatsappUrl}/GetWhatsappPhoneNumbers?workspaceId=${workspaceId}`
        );
        if (TableData.data.status === "Success") {
          setTableData(TableData.data.data);
          console.log("table data: " + tableData);
        } else {
          toast.toast({
            title: "Error",
            description: "No phone numbers found",
          });
        }

        // Fetch WhatsApp owner details
        const whatsappOwnerResponse = await axios.get(
          `${whatsappUrl}/GetWhatsappOwnerDetails?workspaceId=${workspaceId}`
        );
        if (whatsappOwnerResponse.data.status === "Success") {
          setWhatsappOwnerDetails(whatsappOwnerResponse.data.data); // Single object
          console.log(
            "whatsapp owner details: ",
            whatsappOwnerResponse.data.data
          );
        } else {
          toast.toast({
            title: "Error",
            description: "No details found",
          });
        }
      } else {
        setIsTokenValid(response.data.isValid);
        setConnectStatus(false);
        console.log("token validity: ", isTokenValid);
        toast.toast({
          title: "Error",
          description: "Create a new token",
        });
      }
    } catch (error) {
      console.error("Error checking token validity:", error);
      toast.toast({
        title: "Error",
        description: "An error occurred",
      });
    }
    setLoading(false);
  };

  const tokenUpdate = async (waba_id: string, phone_number_id: string, id:number) => {
    try {
      const response = await axios.post(`${whatsappUrl}/UpdateWabaNPhoneId`, {
        Id: id,
        WabaId: waba_id,
        PhoneId: phone_number_id,
      });
      if (response.data.status == "Success") {
        toast.toast({
          title: "Success",
          description: "Token is updated with WABA details",
        });
        afterLogin();
      } else {
        toast.toast({
          title: "Error",
          description: "Token is not updated with WABA details",
        });
      }
    } catch (error) {
      console.error("error updating WABA details: ", error);
      toast.toast({
        title: "Error",
        description: "Token is not updated with WABA details: " + error,
      });
    }
  };

  const registerNumber = async (phoneId: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${whatsappUrl}/RegisterWhatsappNumber?workspaceId=${workspaceId}&phoneId=${phoneId}`
      );
      if (response.data.status == "Success") {
        toast.toast({
          title: "Success",
          description: "Phone Number Registered Successfully",
        });
      } else {
        toast.toast({
          title: "Error",
          description: "Error Registering phone number",
        });
      }
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Api Error in registering phone number",
      });
    }
    setLoading(false);
  };

  const deRegisterNumber = async (phoneId: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${whatsappUrl}/DeRegisterWhatsappNumber?workspaceId=${workspaceId}&phoneId=${phoneId}`
      );
      if (response.data.status == "Success") {
        toast.toast({
          title: "Success",
          description: "Phone Number DeRegistered Successfully",
        });
      } else {
        toast.toast({
          title: "Error",
          description: "Error DeRegistering phone number",
        });
      }
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Api Error in deRegistering phone number",
      });
    }
    setLoading(false);
  };

  useEffect(()=>{
    if(wabaId!=="" && phoneId!=="" && Id!=0){
      console.log("phId: "+phoneId+" wabaID: "+wabaId+ "Id: "+Id);
      tokenUpdate(wabaId,phoneId,Id);
    }
  },[wabaId,phoneId,Id])

  const exchangeToken = async (code: string) => {
    try {
      const response = await axios.post(
        `${whatsappUrl}/GetAccessToken/GetAccessToken`,
        {
          Code: code,
          EmailId: emailId,
          workspaceId: workspaceId,
        }
      );
      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "Access token created successfully",
        });
        setId(response.data.id);
      } else {
        toast.toast({
          title: "Error",
          description: "Token creation failed",
        });
      }
      console.log("Access token data:", response.data);
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Error exchanging token",
      });
      console.error("Error exchanging token:", error);
    }
  };

  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  return (
    <>
      {loading && (
        <div className="flex flex-col items-center justify-center h-[500px]">
          <CircularProgress color="primary" />
        </div>
      )}

      {!loading && !isTokenValid ? (
        <Card className="flex-col w-[593px]">
          <Toaster />
          <CardHeader className="w-full text-left p-[24px]">
            <CardTitle className="text-[14px] font-600">
              Connect or create your WhatsApp business account
            </CardTitle>
            <CardDescription className="text-[14px] font-400">
              Click the button below to start the WhatsApp installation flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-start">
            <Button
              className="p-2 h-[32px] w-[89px] mt-0 text-[14px]"
              onClick={async () => {
                if (launchWhatsAppSignup("connect")) {
                  await subscribeToWebhook();
                  await checkTokenValidity();
                }
              }}
            >
              Connect
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="fixed flex justify-end gap-4 mr-[26px] items-end right-[0px] top-[-12px] z-20 ">
            <Button
              variant={"outline"}
              className="w-[100px] border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() => {
                disconnectWhatsappAccount();
                checkTokenValidity();
              }}
              // onClick={() => {
              //   dispatch(setCreateBreadCrumb(false));
              //   navigate("/navbar/campaignlist");
              // }}
            >
              Disconnect
            </Button>
            <Button
              className="w-auto"
              onClick={async () => {
                launchWhatsAppSignup("addPhoneNumber");
                await checkTokenValidity();
                await subscribeToWebhook();
              }}
              // onClick={() => {
              //   if (campaignId) {
              //     handleEdit(); // Call handleEdit if campaignId exists
              //   } else {
              //     handleSubmit(); // Call handleSubmit if campaignId does not exist
              //   }
              //   console.log("Clicked"); // Log the click event
              // }}
            >
              {/* {campaignId ? "Update" : "Submit"} */}Add Phone Number
            </Button>
          </div>
          <div className="flex flex-col gap-[1rem]">
            <Card className="flex-col w-full rounded-md">
              <Toaster />
              <CardHeader className="w-full text-left p-[24px]">
                <CardTitle className="text-[14px] font-600">
                  Account Details
                </CardTitle>
                <CardDescription className="flex flex-col text-[14px] font-400 space-y-[6px]">
                  {whatsappOwnerDetails ? (
                    <>
                      <p>
                        Meta Business Manager Account ID:{" "}
                        {whatsappOwnerDetails.ownerBusinessInfo.id}
                      </p>
                      <p>
                        WhatsApp Business Account ID: {whatsappOwnerDetails.id}
                      </p>
                    </>
                  ) : (
                    <p>Loading WhatsApp owner details...</p>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="rounded-md border gap-1">
              <Table
                className="rounded-xl whitespace-nowrap border-gray-200  "
                style={{ color: "#020202", fontSize: "15px" }}
              >
                <TableHeader className="text-center text-[14px] font-medium">
                  <TableRow>
                    <TableHead className="">
                      <div className="flex items-center gap-6 justify-start cursor-pointer">
                        <input
                          type="checkbox"
                          // className={`text-muted-foreground ${
                          //   isAllSelected ? "accent-gray-700 bg-grey-700 text-red-500" : ""
                          // }`}
                          // checked={isAllSelected}
                          // onChange={handleSelectAll}
                        />
                      </div>
                    </TableHead>

                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Phone number{" "}
                        <CaretSortIcon
                        // onClick={() => sortCampaignList("ByCampaignChannel")}
                        // className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Display name{" "}
                        <CaretSortIcon
                        // onClick={() => sortCampaignList("ByCampaignStatus")}
                        // className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Status{" "}
                        <CaretSortIcon
                        // onClick={() => sortCampaignList("ByCampaignDate")}
                        // className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Quality{" "}
                        <CaretSortIcon
                        // onClick={() => sortCampaignList("ByCampaignAmount")}
                        // className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Message limit{" "}
                        <CaretSortIcon
                        // onClick={() => sortCampaignList("ByCampaignSent")}
                        // className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-left"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-left text-[14px] font-normal text-[#020617]">
                  {tableData.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell className="py-4 text-left">
                        <input
                          type="checkbox"
                          className="accent-gray-700 bg-grey-700"
                          // Add a state and handler if you want to manage checkbox selection
                        />
                      </TableCell>
                      <TableCell className="py-4 text-left">
                        {data.display_phone_number}
                      </TableCell>
                      <TableCell className="py-4 text-left">
                        {data.verified_name}
                      </TableCell>
                      <TableCell className="py-4 text-left">
                        {data.status}
                      </TableCell>
                      <TableCell className="py-4 text-left">
                        <Badge
                          className={data.quality_rating === "GREEN" ? "" : ""}
                          style={{
                            backgroundColor:
                              data.quality_rating === "GREEN"
                                ? "#479E98"
                                : "#DFA548",
                          }}
                        >
                          {data.quality_rating}
                        </Badge>
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        <DotsHorizontalIcon
                          // onClick={() => handleMenuToggle(Number(data.id))}
                          className="cursor-pointer w-6 h-6"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Whatsapp;
