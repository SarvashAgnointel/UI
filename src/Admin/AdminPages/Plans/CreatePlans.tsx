import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { Toaster } from "../../../Components/ui/toaster";
import { setCreateBreadCrumb } from "../../../State/slices/AdvertiserAccountSlice";
import { Button } from "../../../Components/ui/button";
import { Card } from "../../../Components/ui/card";
import { Label } from "../../../Components/ui/label";
import { useToast } from "../../../Components/ui/use-toast";
import { Switch } from "../../../Components/ui/switch";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "../../../Components/ui/select";
import { Input } from "../../../Components/ui/input";
import { Currency } from "lucide-react";
import axios from "axios";

const CreatePlans: React.FC = () => {

      const navigate = useNavigate();
      const dispatch = useDispatch();
      const location = useLocation();
      const toast = useToast();
      const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
      // const planId = location.state?.planId || "";
      const { planId, name, messages, per_message,price, countrySymbol: initialCurrency } = location.state || {};

      const [planName, setPlanName] = useState<string>("");
      const [planMessage, setPlanMessage] = useState<string>("");
      const [permessage, setPerMessage] = useState<string>("");
      const [planPrice, setPlanPrice] = useState<string>("");
      const [countrySymbol, setCountrySymbol] = useState<string>("");
      const [updateCurrency, setUpdateCurrency] = useState<string>("");
      const currentTime = new Date().toISOString();
      const [currencyList, setCurrencyList] = useState<string[]>([]);

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
        if (planId) {
            console.log("planId --- ", planId);
          setPlanName(name || "");
          setPlanMessage(messages || "");
          setPlanPrice(price || "");
          setPerMessage(per_message || "");
          setCountrySymbol(initialCurrency || "USD");
            
        }}, [planId, name, messages, per_message,price, initialCurrency]);


        useEffect(() => {
          debugger;
          const fetchCurrencyList = async () => {
            try {
              const response = await axios.get(`${apiUrlAdvAcc}/GetCurrencyNames`);
              debugger;
              if (response.data.status === "Success") {
                setCurrencyList(response.data.currencyList || []);
              } else {
                console.error("Failed to fetch currency list:", response.data.status_description);
              }
            } catch (error) {
              console.error("Error fetching currency list:", error);
            }
          };
      
          if (apiUrlAdvAcc) {
            fetchCurrencyList();
          }
        }, [apiUrlAdvAcc]);




        useEffect(() => {
            debugger;
            // Calculate per-message price dynamically
            const calculatePerMessage = () => {
                debugger;
              const priceValue = parseFloat(planPrice);
              const messagesValue = parseFloat(planMessage);
              if (!isNaN(priceValue) && !isNaN(messagesValue) && messagesValue > 0) {
                setPerMessage((priceValue / messagesValue).toFixed(2));
              } else {
                setPerMessage("");
              }
            };
        
            calculatePerMessage();
          }, [planPrice, planMessage]);
        


      const handleEdit = async () => {
        console.log("Editing plan:", { planId, planName, planMessage,permessage, planPrice, countrySymbol });

        const data = { 
            "billingId": planId,
            "messages": planMessage,
            "price": planPrice,
            "countrySymbol": countrySymbol,
            "permessage": permessage,
            "name": planName
        }
        console.log("Edit plan data: ", data);
        const response = await axios.put(`${apiUrlAdvAcc}/UpdateBillingFeature`, data);

        if (response.data.status === "Success") {
            console.log("Plan updated successfully");
            toast.toast({
              title: "Success.",
              description: "Plans updated Successfully.",
            });
            setTimeout(() => {
              dispatch(setCreateBreadCrumb(false));
              navigate("/adminNavbar/plans");
            }, 1000);         
        } 
        else {
          console.error("Upload failed:", response.data.Status_Description);
          setTimeout(() => {
          }, 1000);
        }
      };
    
      const handleSubmit = async () => {
        debugger;
        console.log("Creating new plan:", { planName, planMessage, planPrice,permessage, countrySymbol });
        const data = { 
            "messages": planMessage,
            "price": planPrice,
            "countrySymbol": countrySymbol,
            "permessage": permessage,
            "name": planName
        }
        console.log("New plan: ", data);
        const response = await axios.post(`${apiUrlAdvAcc}/InsertBillingFeature`, data);
debugger;
        if (response.data.status === "Success") {
            console.log("Plan created successfully");
            toast.toast({
              title: "Success.",
              description: "Plans Created Successfully.",
            });
            setTimeout(() => {
              dispatch(setCreateBreadCrumb(false));
              navigate("/adminNavbar/plans");
            }, 1000);         
        } 
        else {
          console.error("Upload failed:", response.data.Status_Description);
          setTimeout(() => {
          }, 1000);
        }
      };

      const handleDiscard = () => {
        dispatch(setCreateBreadCrumb(false));
        navigate("/adminNavbar/plans");
      };


  return (
    <>
    <div className="overflow-y-auto ml-[-7px]">
        <Toaster />
        <div className="fixed flex justify-end gap-4 mr-[40px] items-end right-[0px] top-[-15px] z-20 ">
          <Button className="w-[80px] border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            variant={"outline"}
            onClick={handleDiscard}
          >
            Discard
          </Button>
          <Button className="w-[80px] text-[#F8FAFC]"
                  onClick={() => (planId ? handleEdit() : handleSubmit())}
          >
            {planId ? "Update" : "Submit"}
          </Button>
        </div>

          <div className="ml-4">
            <Card className="w-[580px] mt-2 p-4">
              <div className="text-left">
                <h3 className="text-md font-semibold text-left"> 
                  {planId ? "Edit Plan" : "Add New Plan"} 
                </h3>
                <div className="mt-4">
                  <Label htmlFor="planName" className="mt-8"> Name </Label>
                  <Input
                    id="planName"
                    type="text"
                    placeholder="e.g. Executive"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="mt-2 text-gray-500"
                  />
                  {/* {campaignNameError && (
                    <p className="text-red-500 text-sm">{campaignNameError}</p>
                  )} */}
                </div>

                <div className="mt-4">
                  <Label htmlFor="planMessage" className="mt-2"> Included Messages </Label>
                  <Input
                    id="planMessage"
                    type="text"
                    placeholder="e.g. 100,000"
                    value={planMessage}
                    onChange={(e) => setPlanMessage(e.target.value)}
                    className="mt-2 text-gray-500"
                  />
                </div>

                <div className="mt-4">
                  <Label htmlFor="permessage" className="mt-2">Per Messages Price</Label>
                  <Input
                    id="per_message"
                    type="text"
                    placeholder="e.g. 1.0"
                    value={permessage}
                    onChange={(e) => setPerMessage(e.target.value)}
                    className="mt-2 text-gray-500"
                  />
                </div>

                <div className="mt-4">
                  <Label htmlFor="planPrice" className="mt-2">Price</Label>
                  <div className="flex gap-2">
                    <Input
                      id="planPrice"
                      type="text"
                      placeholder="$1,000"
                      value={planPrice}
                      onChange={(e) => setPlanPrice(e.target.value)}
                      className="mt-2 text-gray-500"
                    />

                    <Select
                      value={countrySymbol}
                      onValueChange={(value) => setCountrySymbol(value)}
                    >
                      <SelectTrigger className="text-gray-500 mt-2">
                        <SelectValue className="text-gray-500"
                          placeholder={ planId ? updateCurrency : "" }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyList.map((currency) => (
                            <SelectItem className="text-gray-500" key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    </div>
                </div>
              </div>
            </Card>
            </div>
        </div>
        </>
);

}

export default CreatePlans;