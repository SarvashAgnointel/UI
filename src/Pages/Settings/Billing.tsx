import React, { FC, useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Progress } from "../../Components/ui/progress";
import { Toaster } from "../../Components/ui/toaster";
import { toast, useToast } from "../../Components/ui/use-toast";
import { Input } from "../../Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../Components/ui/table";
import { Badge } from "../../Components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '../../Components/ui/avatar';
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../Components/ui/dropdown-menu';
import EmbeddedCheckout1 from "./EmbeddedCheckout1";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/src/State/store";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import ReactDOM from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../Components/ui/dialog";

interface Workspaces {
  workspaceid: number;
  workspace: string
  billingstatus: string;
  paireddate: string;
}

interface Transactions {
  paymentId: string;
  amount: string;
  paymentDate: string;
  symbol: string;
  receipturl: string;
  name: string;
  messages: string;
  fundtype: string;
}
interface Debitdetials {
  amount: string;
  messagecount: string;
  paymentdate:string;
  symbol:string;
}
interface BillingPlan {
  billing_name: string;
  amount: number;
  features: string;
  symbol: string;
  currency: string;
  permessage: string;

}
type EmbeddedCheckoutProps = {
  priceId: any;
  quantity: number;
  productName: string;
};

type BillingDialogProps={
  open: boolean;
  handleClose: () => void;
  priceId:string;
  quantity: number;
}

export const BillingDialog: FC<BillingDialogProps> = ({
  open,
  handleClose,
  priceId,
  quantity,
}) => {
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 500);
    }
  }, [open]);
  const [next, setNext] = useState(true);
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="m-2 overflow-y-auto p-6 no-scrollbar h-full min-w-auto">
        <DialogHeader>
          <DialogTitle className="font-semibold text-[#09090B] text-[18px]"></DialogTitle>
          <DialogDescription className="font-medium text-[#71717A] text-[14px]">
            
          </DialogDescription>
        </DialogHeader>
        {/* Content, e.g., form fields, buttons */}

        <EmbeddedCheckout1 priceId={priceId} quantity={quantity} />


      </DialogContent>
    </Dialog>
  );
};

const Billing: FC = () => {

  // const intialWorkspacesList: Workspaces[] = [
  //     { workspace: 'Dubai Mall', paired:'03/02/2024'},
  //     { workspace: 'Emaar', paired:'29/12/2024'},
  // ];
  const toast = useToast();
  // const intialTransactionList: Transactions[] = [
  //   { value: '560,000', message: '+ 400,000', description: 'Platinum Package purchaced, quantity 1', date:'03/02/2024 ∙ 13:32'},
  //   { value: '12,000', message: '- 6000', description: 'Cost for message sent', date:'29/02/2024 ∙ 13:32'},
  // ];
  const [isPrimaryOwner, setIsPrimaryOwner] = useState(false);
  const [billingDetails, setBillingDetails] = useState<BillingPlan[]>([]);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [workspaceslist, setWorkspaceslist] = useState<Workspaces[]>([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionList, setTransactionList] = useState<Transactions[]>([]);
  const [debitList, setdebitList] = useState<Debitdetials[]>([]);
  const [transactionSortOrder, setTransactionSortOrder] = useState("asc");
  const mailId = useSelector((state:RootState)=>state.authentication.userEmail);
  const [isSorted, setIsSorted] = useState(false);
  const [walletAmount, setWalletAmount] = useState<number | null>(null);
  // const accountId = useSelector((state:RootState)=>state.authentication.account_id);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
 const [isLoading, setIsLoading] = useState(false);
 const workspaceId = useSelector((state: RootState) => state.authentication.workspace_id);
 const accountId = useSelector((state:RootState) => state.authentication.account_id);

  useEffect(() => {
    setIsLoading(true);
    const fetchConfig = async () => {
      try {

        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdvAcc(config.ApiUrlAdvAcc);
        const id = localStorage.getItem("userid");
        const response1 = await axios.get(`${config.ApiUrlAdvAcc}/Getuserrole?accountid=${id}`);
        debugger;
        console.log("user role Response : ", response);

        // Accessing the first item in the user_role array and getting role_name
        if (response1.data.user_role && response1.data.user_role.length > 0) {
          const roleName = response1.data.user_role[0].role_name;
          console.log("User role name: ", roleName);

          if (roleName === 'Primary Owner') {
            setIsPrimaryOwner(true);  // Set state to true if role is 'Primary Owner'
          } else {
            setIsPrimaryOwner(false);  // Set state to false if the role is not 'Primary Owner'
          }
        } else {
          console.error("No roles found in response.");
          setIsPrimaryOwner(false);  // Ensure it's set to false if there are no roles
        }
      } catch (error) {
        console.error("Error loading config:", error);
      }
      finally {
        setIsLoading(false);
      };
    };

    fetchConfig();

  }, []);


  useEffect(() => {
    if (apiUrlAdvAcc) {
      fetchBillingDetails();
      workspaceslists();
      usertransactionlist();
      userdebitlist();
      handleGetWalletAmount();
    }
  }, [apiUrlAdvAcc]);



  console.log("id :" + workspaceId);
  const fetchBillingDetails = async () => {
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetbillingDetails?workspaceid=${workspaceId}`);
      console.log("Response : ", response.data.billingDetails);
      if (response.data.status == "Success") {
        if (response.data && response.data.billingDetails) {
          setBillingDetails(response.data.billingDetails);
          console.log("billingDetails List : ", response.data.billingDetails);
        } else {
          console.error("Error fetching billing details: response - ", response);
        }
      }
    } catch (error) {
      console.error("Error fetching billing details:", error);
    }

  };


  const handleGetWalletAmount = async () => {
    debugger;
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetWalletAmountByWorkspaceId?workspaceId=${workspaceId}`);
      console.log("Response : ", response.data);
      if (response.data.status == "Success") {
        if (response.data.status === "Success" && response.data.walletDetails) {
          setWalletAmount(response.data.walletDetails.totalAmount);
        }  else {
          console.error("Error fetching billing details: response - ", response);
        }
      }
    } catch (error) {
      console.error("Error fetching billing details:", error);
    }

  };

  
  const workspaceslists = async () => { 
    try {
      debugger;
      // const id = localStorage.getItem("userid");
      const response = await axios.get(`${apiUrlAdvAcc}/GetBillingWorkspaceDetailsByAccountId?accountid=${accountId}`);
      console.log("Response : ", response.data.workspacelist);
      if (response.data.status == "Success") {
        if (response.data && response.data.workspacelist) {
          setWorkspaceslist(response.data.workspacelist);
          console.log("workspace List : ", response.data.workspacelist);
        } else {
          console.error("Error fetching workspace details: response - ", response);
        }
      }
    } catch (error) {
      console.error("Error fetching workspace details:", error);
    }

  }
  const pairworkspace = async (workspaceid: any) => {
    try {
      debugger;
      const id = localStorage.getItem("userid");
      const response = await axios.get(`${apiUrlAdvAcc}/pairworkspaceid?accountid=${id}&workpaceid=${workspaceid}`);
      console.log("Response : ", response.data.workspacelist);
      if (response.data.status == "Success") {
        if (response.data) {
          toast.toast({
            title: "Success",
            description: "workspace paired successfully",
          })
          workspaceslists();
        } else {
          console.error("Error fetching workspace details: response - ", response);
        }
      }
    } catch (error) {
      console.error("Error fetching workspace details:", error);
    }

  }

  const unpairworkspace = async (workspaceid: any) => {
    try {
      debugger;
      const id = localStorage.getItem("userid");
      const response = await axios.get(`${apiUrlAdvAcc}/unpairworkspaceid?workpaceid=${workspaceid}`);
      console.log("Response : ", response.data.workspacelist);
      if (response.data.status == "Success") {
        if (response.data) {
          toast.toast({
            title: "Success",
            description: "workspace unpaired successfully",
          })
          workspaceslists();
        } else {
          console.error("Error fetching workspace details: response - ", response);
        }
      }
    } catch (error) {
      console.error("Error fetching workspace details:", error);
    }

  }

  const parseTransactionCustomDate = (dateString: string) => {

    const [datePart, timePart] = dateString.split("∙");
    const [day, month, year] = datePart.trim().split("/");
    return new Date(`${year}-${month}-${day}T${timePart.trim()}`);
  };

  const parseCustomDate = (dateString: string) => {
    const [day, month, year] = dateString.trim().split("/");
    return new Date(`${year}-${month}-${day}`);
  };

  const formatDescription = (features: string, symbol: string) => {
    debugger
    // Split the features by commas and process each feature
    let formattedDescription = "Includes: ";
    const formattedFeatures = features.split(",").map((feature) => {
      // If the feature contains "per message", handle it
      if (feature.includes("per message")) {
        debugger;
        const parts = feature.trim().split(" "); // Split into parts (e.g., ["100000", "messages", "per", "message", "1.20"])

        // Ensure the feature contains a price at the end (e.g., "1.20")
        if (parts.length >= 2 && !isNaN(parseFloat(parts[2]))) {
          // Format the feature as "100000 messages, per message ₹ 1.20"
          return ` ${parts[0]} ${parts[1]} ${symbol} ${parts[2]}`;
        } else {
          // If the format is invalid, return the feature unchanged
          return feature;
        }
      } else {
        // If the feature does not include "per message", return it unchanged
        return feature;
      }
    });

    // Join the features back into a single string and return it
    formattedDescription += formattedFeatures.join(", ");

    // Return the formatted description
    return formattedDescription;
  };


  const usertransactionlist = async () => {

    try {
      debugger;
      const id = localStorage.getItem("userid");
      const response = await axios.get(`${apiUrlAdvAcc}/GetuserTransaction?accountid=${id}`);
      console.log("Response : ", response.data.user_transaction);
      setTransactionList(response.data.user_transaction)
      if (response.data.status === "Success") {
        if (response.data) {
          // toast.toast({
          //   title: "Success",
          //   description: "Transaction received successfully",
          // })
          console.log("Transaction Received")
        } else {
          console.error("Error fetching Transaction details: response - ", response);
        }
      }
    } catch (error) {
      console.error("Error fetching Transaction details:", error);
    }

  }

  const userdebitlist = async () => {

    try {
      debugger;
      //const id = localStorage.getItem("userid");
      const response = await axios.get(`${apiUrlAdvAcc}/Getdebitdetails?emailid=${mailId}`);
      console.log("Response : ", response.data.user_transaction);
      setdebitList(response.data.user_transaction)
      if (response.data.status == "Success") {
        if (response.data) {
          toast.toast({
            title: "Success",
            description: "Transaction received successfully",
          })
        } else {
          console.error("Error fetching Transaction details: response - ", response);
        }
      }
    } catch (error) {
      console.error("Error fetching Transaction details:", error);
    }

  }
  const downloadInvoice = async (id: string) => {
    debugger;
    try {
      // Send GET request to your backend endpoint
      const response = await axios.get(
        `${apiUrlAdvAcc}/DownloadInvoicePdf?invoiceId=${id}`,
        {
          responseType: "blob", // Ensure the response is treated as a file
        }
      );

      // Create a Blob from the response
      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create a link element to initiate download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "receipt.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading receipt:", error);
      alert("Failed to download receipt.");
    }
  };




  const downloadInvoice1 = async (url: string) => {
    debugger;
    if (!url) {
      alert("Receipt URL is not available.");
      return;
    }

    const proxyUrl = `http://localhost:5008/proxy/download-receipt?url=${encodeURIComponent(url)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch the invoice.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      debugger;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "Invoice.pdf";
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Unable to download the invoice.");
    }
  };

  const [productDetails, setProductDetails] = useState(null);



  const [priceId, setPriceId] = useState<string | null>(null);
  // const [productName, setproductname] = useState<string | null>();
  // const [clientSecret, setclientSecret] = useState<string | null>();
  const [quantity, setQuantity] = useState<number>(1);
  const [workspaceid, setWorkspaceid] = useState<number>();
  const handlePurchase = async (plan: BillingPlan) => {
    try {
      debugger;
      handleOpen();


      const formattedDescription = formatDescription(plan.features, plan.symbol);
      const data = {
        Amount: plan.amount,
        Currency: plan.currency, // Assuming you have a currency property
        ProductName: plan.billing_name,
        Description: formattedDescription,
      }
      debugger;
      const response1 = await axios.post(`${apiUrlAdvAcc}/Checkpaymenturl`, data, {

      });

      if (response1.data.payment[0].price_id != null) {
        debugger;
        const price_id = response1.data.payment[0].price_id; // Assuming `url` is returned in the response
        setPriceId(price_id);
        setQuantity(1);
        // Open the payment link
        // window.location.href = paymenturl;
      }
      else {
        debugger;
        const response = await axios.post(`${apiUrlAdvAcc}/CreateProductWithPrice`, data, {
          headers: {
            'Content-Type': 'application/json', // Include the token here
          },

        });
        console.log(response.data);
        if (response.data) {
          const { productId, priceId, productName } = response.data;

          console.log(priceId, productName, 'product details');

          const productDetails = {
            priceId: priceId, // Replace with your real price ID
            quantity: 1,
          };
          setPriceId(priceId); // Example Price ID
          // setproductname(productName);
          setQuantity(1);
          setWorkspaceid(workspaceId)
          await handleCreatePaymentLink(priceId, productName, quantity)
        }
      }
    } catch (error) {
      console.error("Error while creating product:", error);
    }
  };
  const handleCreatePaymentLink = async (PriceId: any, ProductName: any, Quantity: number) => {
    try {
      debugger;
      const data = {
        PriceId: PriceId,
        Quantity: Quantity,
        ProductName: ProductName
      };

      // Send the request to CreatePaymentLink API
      const response = await axios.post(`${apiUrlAdvAcc}/CreatePaymentLink`, data);

      if (response.data) {
        const paymentLink = response.data; // Assuming `url` is returned in the response
        const paymentId = response.data.paymentId; // Assuming paymentId is returned as well

        // Open the payment link
        //   window.location.href = paymentLink;


      }
    } catch (error) {
      console.error("Error while creating payment link:", error);
    }
  };


  const sortWorkspaces = (tableHeader: string) => {
    let sortedData = [...workspaceslist];

    switch (tableHeader) {
      case "Byworkspace":
        sortedData.sort((a, b) =>
          sortOrder === "asc"
            ? a.workspace.localeCompare(b.workspace)
            : b.workspace.localeCompare(a.workspace)
        );
        break;
      case "ByPaired":
        sortedData.sort((a, b) =>
          sortOrder === "asc"
            ? parseCustomDate(a.billingstatus).getTime() - parseCustomDate(b.billingstatus).getTime()
            : parseCustomDate(b.billingstatus).getTime() - parseCustomDate(a.billingstatus).getTime()
        );
        break;
      default:
        console.warn("Unknown table header");
        return;
    }

    setWorkspaceslist(sortedData);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const formatAmount = (amount: number): string => { return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  const debitMessageCount = Array.isArray(debitList)
  ? debitList.reduce((sum, item) => sum + Number(item.messagecount || 0), 0)
  : 0;

const creditMessageCount = Array.isArray(transactionList)
  ? transactionList.reduce((sum, item) => sum + Number(item.messages || 0), 0)
  : 0;
  const sortTransactions = (field: string) => {
    let sortedList = [...transactionList];

    switch (field) {
      case "ByValues":
        sortedList.sort((a, b) =>
          transactionSortOrder === "asc"
            ? a.amount.localeCompare(b.amount)
            : b.amount.localeCompare(a.amount)
        );
        break;

      case "ByMessages":
        sortedList.sort((a, b) =>
          transactionSortOrder === "asc"
            ? a.messages.localeCompare(b.messages)
            : b.messages.localeCompare(a.messages)
        );
        break;

      case "ByDescription":
        sortedList.sort((a, b) =>
          transactionSortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );
        break;

      case "ByDate":
        sortedList.sort((a, b) =>
          transactionSortOrder === "asc"
            ? parseTransactionCustomDate(a.paymentDate).getTime() - parseTransactionCustomDate(b.paymentDate).getTime()
            : parseTransactionCustomDate(b.paymentDate).getTime() - parseTransactionCustomDate(a.paymentDate).getTime()
        );
        break;

      default:
        console.warn("Unknown field for sorting");
    }

    setTransactionList(sortedList);
    setTransactionSortOrder(transactionSortOrder === "asc" ? "desc" : "asc");
  };


  return (
    <div className="flex-col gap-6 h-full overflow-y-auto">
     {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center z-50">
              <CircularProgress className="text-primary" />
            </div>
          )}
      <Toaster/>
      <Card className='mb-[15px] mt-2'>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
            <p className="text-sm text-gray-600 text-left">
              Total funds  
              {billingDetails.length > 0 
                ? ` (${billingDetails[0].currency}) ` 
                : "(AED)"}  
              and remaining messages in your wallet
            </p>
            </div>
            {!showAddFunds && (
              <Button className="w-15 text-white mt-0" 
              onClick={() => 
                {billingDetails.length>0?
                  setShowAddFunds(true):
                  toast.toast({
                    title: "Alert",
                    description: "No available plans for your billing country",
                    duration:1000
                  })
                }}> + Add funds </Button>
            )}
          </div>

          <div className="flex items-center mt-2">
          <span className="text-3xl font-bold text-gray-900 ml-1">
            {billingDetails.length > 0 ? billingDetails[0].symbol : "د.إ"}
          </span>

            <span className="text-3xl font-bold text-gray-900 ml-1">
                {walletAmount !== null ? walletAmount.toLocaleString() : "0"}
            </span>
                <span className="text-4xl text-gray-200 ml-3"> / </span>
                <div className="ml-4 flex flex-col items-start">
                  <span className="text-sm text-gray-800 font-semibold text-left">  
                    {debitMessageCount.toLocaleString()} / {creditMessageCount.toLocaleString()} Messages
                    </span>
                  <div className="w-72">
                    <Progress value={(debitMessageCount/creditMessageCount)*100} className="h-2 rounded-full" />
                  </div>
                </div>
             
          </div>
        </CardHeader>
      </Card>
      {/* {priceId && <EmbeddedCheckout1 priceId={priceId} quantity={quantity} />} */}
      {priceId && <BillingDialog priceId={priceId} quantity={quantity} open={open} handleClose={handleClose}/>}

      {showAddFunds && (
        <div className="flex-col gap-4 mb-18">
          {/* Top Row */}
          <div className="flex gap-4">
            {billingDetails.slice(0, 2).map((plan, index) => (
              <Card key={index} className="p-6 border border-grey text-left w-1/2">
                <Typography
                  component="h3" className="flex flex-col items-center justify-center text-sm font-semibold mb-1 pb-1"
                  style={{ fontWeight: 600, fontSize: "14px" }}
                >
                  <span className="mb-1">{plan.billing_name}</span>
                  <div className="flex items-center space-x-1 ml-2">
                    <span>{plan.symbol}</span>
                    <span>{formatAmount(plan.amount)}</span>
                  </div>
                </Typography>

                <Typography
                  component="p" className="flex flex-col text-sm text-gray-500 mb-4" style={{ fontSize: "14px" }}
                >
                  <span style={{ fontWeight: 600 }}>Includes:</span>
                  {plan.features.split(",").map((feature, i) => {
                    const isPerMessage = feature.includes("per message");
                    if (isPerMessage) {
                      const parts = feature.split(" ");
                      return (
                        <div key={i} className="flex items-center space-x-1 mt-1">
                          <span>✓</span> <span>{parts[0]} {parts[1]}</span>
                          <span>{plan.symbol}</span> <span>{parts[2]}</span>
                        </div>);
                    }
                    else {
                      return (
                        <div key={i} className="flex flex-col space-y-1 mt-1">
                        <div className="flex items-center space-x-1">
                          <span>✓</span> <span>{feature}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>✓</span> per message {plan.symbol} <span>{plan.permessage}</span>
                        </div>
                      </div>
                      );
                    }
                  })}
                </Typography>

                <Button className="py-1 px-3 text-sm w-full mt-4" style={{ fontWeight: 500, fontSize: "14px" }} onClick={() => handlePurchase(plan)} >
                  Purchase
                </Button>

              </Card>
            ))}
          </div>



          {/* Bottom Row */}
          <div className="flex gap-4 mt-4 mb-[60px]">
            {billingDetails.slice(2).map((plan, index) => (
              <Card key={index} className="p-6 border border-grey text-left w-1/4">
                <Typography component="h3" className="flex flex-col items-center justify-center text-sm font-semibold mb-1 pb-1" style={{ fontWeight: 600, fontSize: "14px" }} >
                  <span className="mb-1">{plan.billing_name}</span>
                  <div className="flex items-center space-x-1 ml-2">
                    {plan.amount !== 0 ? (<> <span>{plan.symbol}</span> <span>{formatAmount(plan.amount)}</span> </>) : (<span style={{ marginTop: '1rem' }}> </span>)}
                  </div>
                </Typography>

                <Typography component="p" className="text-sm text-gray-500 mb-4" style={{ fontSize: "14px" }} >
                  <span style={{ fontWeight: 600 }}>Includes:</span>
                  {plan.features.split(",").map((feature, i) => {
                    const isPerMessage = feature.includes("per message");
                    if (isPerMessage) {
                      const parts = feature.split(" ");
                      return (
                        <div key={i} className="flex items-center space-x-1 mt-1">
                          <span>✓</span> <span>{parts[0]} {parts[1]}</span>
                          <span>{plan.symbol}</span> <span>{parts[2]}</span>
                        </div>);
                    }
                    else {
                      return (
                        <div key={i} className="flex flex-col space-y-1 mt-1">
                        <div className="flex items-center space-x-1">
                          <span>✓</span> <span>{feature}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>✓</span> per message {plan.symbol} <span>{plan.permessage}</span>
                        </div>
                      </div>
                      );
                    }
                  })}
                </Typography>
                <Button className="py-1 px-3 text-sm w-full mt-4" style={{ fontWeight: 500 }} onClick={() => handlePurchase(plan)} > Purchase </Button> </Card>))} </div>
        </div>

      )}

      {!showAddFunds && (
        <>

          {/* { workspace }  */}
          <Card className='mb-[15px] mt-2'>
            <CardHeader>
              <div>
                <h2 className="text-lg font-bold text-left">Workspaces</h2>
                <p className="text-sm text-gray-600 text-left">This wallet is paired with the following Workspaces</p>
              </div> <br></br>
            </CardHeader>

            <CardContent>
              <div className='rounded-md border' >
                <Table className="rounded-xl whitespace-nowrap border-gray-200" style={{ color: "#020202", fontSize: "14px" }}>
                  <TableHeader className="text-center">
                    <TableRow>
                      <TableHead className="text-left">
                        <div className="flex items-center gap-2 justify-start ml-2">
                          Workspace <CaretSortIcon onClick={() => sortWorkspaces("Byworkspace")} className="cursor-pointer" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2 justify-end">
                          Paired at <CaretSortIcon onClick={() => sortWorkspaces("ByPaired")} className="cursor-pointer" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="text-left">
                    {workspaceslist.map((workspaceItem, index) => (
                      <TableRow key={index}>
                        <TableCell className="flex items-center space-x-3 py-4 ml-2">
                          <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <span>{workspaceItem.workspace}</span>
                           {workspaceItem.workspaceid === workspaceId && (
                              <Badge className="ml-2 bg-blue-500 text-white">
                                 You
                              </Badge>
                           )}
                          <Badge className="ml-2 bg-[#DFA548] text-white">{workspaceItem.billingstatus}</Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">{workspaceItem.paireddate}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="ml-2  cursor-pointer">•••</DropdownMenuTrigger>
                            <DropdownMenuContent className="absolute right-0 mt-0" style={{ width: "60px" }}>
                             {workspaceItem.billingstatus === "Paired"?  
                                 (<DropdownMenuItem  className="mt-0 cursor-pointer" style={{ color: 'red' }} onClick={() => unpairworkspace(workspaceItem.workspaceid)}>Unpair</DropdownMenuItem>) :     
                                 (<DropdownMenuItem className="mt-0 cursor-pointer"  onClick={() => pairworkspace(workspaceItem.workspaceid)}>Pair</DropdownMenuItem>)} 
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>

                </Table>
              </div>
            </CardContent>

          </Card>

          {/* { Transactions }  */}
          <Card className='mb-[60px] mt-2'>
            <CardHeader>
              <div>
                <h2 className="text-lg font-bold text-left">Transactions</h2>
                <p className="text-sm text-gray-600 text-left">Here you can manage the pending invitations to your team.</p>
              </div> <br></br>
              <Input placeholder="Search transactions..." />
            </CardHeader>

            <CardContent>
              <div className='rounded-md border' >
                <Table className="rounded-xl whitespace-nowrap border-gray-200" style={{ color: "#020202", fontSize: "14px" }}>
                  <TableHeader className="text-center">
                    <TableRow>
                      <TableHead className="text-left">
                        <div className="flex items-center gap-2 justify-start ml-2">
                          Value <CaretSortIcon onClick={() => sortTransactions("ByValues")} className="cursor-pointer" />
                        </div>
                      </TableHead>
                      {/* <TableHead>
                          <div className="flex items-center gap-2 justify-start">
                            Messages <CaretSortIcon onClick={() => sortTransactions("ByMessages")} className="cursor-pointer" />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-2 justify-start">
                            Description <CaretSortIcon onClick={() => sortTransactions("ByDescription")} className="cursor-pointer" />
                          </div>
                        </TableHead> */}
                      <TableHead>
                        <div className="flex items-center gap-2 justify-start">
                          Messages <CaretSortIcon onClick={() => sortTransactions("ByDate")} className="cursor-pointer" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2 justify-start">
                          Description <CaretSortIcon onClick={() => sortTransactions("ByDate")} className="cursor-pointer" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2 justify-start">
                          Date <CaretSortIcon onClick={() => sortTransactions("ByDate")} className="cursor-pointer" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  {Array.isArray(transactionList) && transactionList.length > 0 ? (
                    transactionList.map((transactionItem, index) => (
                      <TableRow key={index}>
                        <TableCell className="flex items-center space-x-2 py-4 ml-2">
                          <span>{transactionItem.symbol}</span> <span>{transactionItem.amount}</span>
                          {transactionItem.fundtype === "payment" && (
                            <Badge
                              className="text-white"
                              style={{
                                backgroundColor: "#3399ff", // Credit color
                              }}
                            >
                              Credit
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-start">+{transactionItem.messages}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-start">
                            {transactionItem.name} Package purchased
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-start">
                            {transactionItem.paymentDate}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="ml-2 cursor-pointer">•••</DropdownMenuTrigger>
                            <DropdownMenuContent
                              className="absolute right-0"
                              style={{ width: "145px" }}
                            >
                              <DropdownMenuItem onClick={() => downloadInvoice(transactionItem.receipturl)}>
                                Download invoice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // Display a fallback message or loader when no transactions exist
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No transactions available.
                      </TableCell>
                    </TableRow>
                  )}
 {/* Debit Transactions */}
        {Array.isArray(debitList) && debitList.length > 0 ? (
          debitList.map((debitItem, index) => (
            <TableRow key={`debit-${index}`}>
              <TableCell className="flex items-center space-x-2 py-4 ml-2">
                <span>{debitItem.symbol}</span> <span>{debitItem.amount}</span>
                
                  <Badge
                    className="text-white"
                    style={{
                      backgroundColor: "#660066", // Debit color
                    }}
                  >
                    Debit
                  </Badge>
                
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center gap-2 justify-start">-{debitItem.messagecount}</div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center gap-2 justify-start">
                   Cost for messages sent
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center gap-2 justify-start">
                {debitItem.paymentdate}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger className="ml-2 cursor-pointer">•••</DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="absolute right-0"
                    style={{ width: "145px" }}
                  >
                    <DropdownMenuItem   >
                      Download invoice
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              No debit transactions available.
            </TableCell>
          </TableRow>
        )}

                </Table>
              </div>
            </CardContent>

          </Card>


        </>
      )}
    </div>
  );
};

export default Billing;