import { Button } from "../../Components/ui/button";
import { Card } from "../../Components/ui/card";
import { Label } from "../../Components/ui/label";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "../../Components/ui/select";
import { CircularProgress } from "@mui/material";
import { Input } from "../../Components/ui/input";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useState, SetStateAction, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; 
import { faArrowTrendUp } from "@fortawesome/free-solid-svg-icons";
import { Tabs, TabsContent } from "../../Components/ui/tabs";
import axios from "axios";
import { useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format, startOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar } from "../../Components/ui/calendar";

import { MultiSelect } from "../../Components/ui/multi-select";
import { Switch } from "../../Components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../Components/ui/popover";
import { cn } from "../../lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { setCreateBreadCrumb } from "../../State/slices/AdvertiserAccountSlice";
import { RootState } from "@/src/State/store";
import { FaPaperPlane } from "react-icons/fa";
import { LuPlane } from "react-icons/lu";
// import { useToast } from "react-toastify";

interface AudienceCardProps {
  selectedRecipients: number;
  totalRecipients: number;
}

// Define the Country type
interface Country {
  country_id: number;
  country_name: string;
}

interface multiselect {
  country_id: string;
}

interface Template {
  template_id: number;
  template_name: string;
  channel_type: string;
}

interface Channel {
  channel_id: number;
  channel_name: string;
}

interface Age {
  id: number;
  age: number;
}

interface Gender {
  id: number;
  gender: string;
}

interface IncomeLevel {
  id: number;
  income_level: string;
}

interface Location {
  id: number;
  location: string;
  city: string;
}

interface Interest {
  id: number;
  interest: string;
}

interface Behaviour {
  id: number;
  behaviour: string;
}

interface Device {
  id: number;
  device: string;
}

interface OS {
  id: number;
  os_device: string;
}

interface DatePickerWithRangeProps {
  className?: string;
}

interface Audience {
  list_id: number;
  listname: string;
  created_date: string;
  total_people: number;
}

interface BillingCountry {
  workspace_info_id: number;
  workspace_name: string;
  country_id: number;
  country_name: string;
  currency_name: string;
}

const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({
  className,
}) => {
  // Initialize the date range with the 1st of the current month and today's date
  const [date, setDate] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()), // First day of the current month
    to: new Date(), // Today
  });

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-[254px] justify-start text-left font-normal mt-0 ${
              !date.from && !date.to ? "text-muted-foreground" : ""
            }`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date.from ? (
              date.to ? (
                `'dd-mm-yyyy'`
              ) : (
                format(date.from, "dd-MM-yyyy")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={date}
            onSelect={(range) => setDate(range as { from: Date; to: Date })}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default function CreateCampaign() {
  const [campaignName, setCampaignName] = useState<string>("");
  const [channelList, setChannelList] = useState<Channel[]>([]); // State for the channel list
  const [templatefilterlist, setTemplatefilterlist] = useState<Template[]>([]);
  const [channel, setChannel] = useState("");
  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [audienceList, setAudienceList] = useState<Audience[]>([]);
  const [template, setTemplate] = useState("");
  const [reachPeopleFrom, setReachPeopleFrom] = useState<string[]>([]);
  const [reachPeopleIn, setReachPeopleIn] = useState<string[]>([]);
  const [campaignBudget, setCampaignBudget] = useState<string>("");
  const [FcampaignBudget, setFCampaignBudget] = useState<string>("");
  const [campaignStartDate, setCampaignStartDate] = useState<string>("");
  const [FcampaignStartDate, setFCampaignStartDate] = useState<string>("");
  const [campaignEndDate, setCampaignEndDate] = useState<string>("");
  const [FcampaignEndDate, setFCampaignEndDate] = useState<string>("");
  const [countryList, setCountryList] = useState<Country[]>([]);
  const [targetCountryList, setTargetCountryList] = useState<Country[]>([]); // New state
  const [roamingCountryList, setRoamingCountryList] = useState<Country[]>([]);
  const [updateChannel, setUpdateChannel] = useState("");
  const [updateTemplate, setUpdateTemplate] = useState("");
  const [updateCountry, setUpdateCountry] = useState("");
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([
    "react",
    "angular",
  ]);
  const [updateRoamingCountry, setUpdateRoamingCountry] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [isCardLoading, setIsCardLoading] = useState(false);

  const selectedRecipients = 1240;
  const totalRecipients = 3448;
  const percentage = Math.round((selectedRecipients / totalRecipients) * 100);
  const navigate = useNavigate();
  const location = useLocation();
  const campaignId = location.state?.campaignId || "";
  const channelName = location.state?.channelType || "";
  const [campaignNameError, setCampaignNameError] = useState<string | null>(
    null
  );
  const [channelError, setChannelError] = useState<string | null>(null);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [AudienceError, setAudienceError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [FbudgetError, setFBudgetError] = useState<string | null>(null);
  const [startdateError, setStartDateError] = useState<string | null>(null);
  const [enddateError, setEndDateError] = useState<string | null>(null);
  const [FstartdateError, setFStartDateError] = useState<string | null>(null);
  const [FenddateError, setFEndDateError] = useState<string | null>(null);
  const [targetCountryError, setTargetCountryError] = useState<string | null>(
    null
  );
  const [roamingCountryError, setRoamingCountryError] = useState<string | null>(
    null
  );
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [isStartCalendarOpen, setStartCalendarOpen] = useState(false);
  const [isFStartCalendarOpen, setFStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setEndCalendarOpen] = useState(false);
  const [isFEndCalendarOpen, setFEndCalendarOpen] = useState(false);
  const dispatch = useDispatch();
  const toast = useToast();
  const [isFocusedOrHasValue, setIsFocusedOrHasValue] = useState(false);
  const [audience, setAudience] = useState(0);
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );

  const [selectedTargetCountries, setSelectedTargetCountries] = useState<
    string[]
  >([]);
  const [selectedRoamingCountries, setSelectedRoamingCountries] = useState<
    string[]
  >([]);
  const [updateAudience, setUpdateAudience] = useState("");
  const [ageList, setAgeList] = useState<Age[]>([]);
  const [genderList, setGenderList] = useState<Gender[]>([]);
  const [IncomeLevelList, setIncomeLevelList] = useState<IncomeLevel[]>([]);
  const [locationList, setLocationList] = useState<Location[]>([]);
  const [interestList, setInterestList] = useState<Interest[]>([]);
  const [behaviourList, setBehaviourList] = useState<Behaviour[]>([]);
  const [deviceList, setDeviceList] = useState<Device[]>([]);
  const [osList, setOsList] = useState<OS[]>([]);
  const [age, setAge] = useState(0);
  const [gender, setGender] = useState(0);
  const [incomeLevel, setIncomeLevel] = useState(0);
  const [locationcity, setLocationCity] = useState(0);
  const [interest, setInterest] = useState(0);
  const [behaviour, setBehaviour] = useState(0);
  const [device, setDevice] = useState(0);
  const [osDevice, setOsDevice] = useState(0);
   

  
  const [updateAge, setUpdateAge] = useState("");
  const [updateGender, setUpdateGender] = useState("");
  const [updateIncomeLevel, setUpdateIncomeLevel] = useState("");
  const [updateLocation, setUpdateLocation] = useState("");
  const [updateInterest, setUpdateInterest] = useState("");
  const [updateBehaviour, setUpdateBehaviour] = useState("");
  const [updateDevice, setUpdateDevice] = useState("");
  const [updateOsDevice, setUpdateOsDevice] = useState("");

  const [ageError, setAgeError] = useState<string | null>(null);
  const [genderError, setGenderError] = useState<string | null>(null);
  const [incomeLevelError, setIncomeLevelError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [interestError, setInterestError] = useState<string | null>(null);
  const [behaviourError, setBehaviourError] = useState<string | null>(null);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [osDeviceError, setOsDeviceError] = useState<string | null>(null);
  const BillingCountrydata = useSelector( (state: RootState) => state.authentication.workspaceData?.billingCountry );
  const [currency, setCurrency] = useState("");
  const [currencyData, setCurrencyData] = useState<BillingCountry[]>([]);
  const [showRussiaAndKazakhstan, setShowRussiaAndKazakhstan] = useState(false);
  const [hasRussiaOrKazakhstanSelected, setHasRussiaOrKazakhstanSelected] = useState(false); 

  const [budgetType, setBudgetType] = useState("daily"); // default to daily budget
  const [messageFrequency, setMessageFrequency] = useState<string>("1"); // Default to daily
  //const [dailyRecipientLimit , setDailyRecipientLimit] = useState(0); // Default to daily
  const [dailyRecipientLimit, setDailyRecipientLimit] = useState<number | "">("");
  const [dailyLimitError, setDailyLimitError] = useState<string | null>(null);
  const [isDailyLimitTouched, setIsDailyLimitTouched] = useState(false);
  const [isFrequencyOpen, setIsFrequencyOpen] = useState(false);
  const [isReceiveLimitOpen, setIsReceiveLimitOpen] = useState(false);
  

const [isAdminApproved, setIsAdminApproved] = useState<boolean | null>(null);
const [isOperatorApproved, setIsOperatorApproved] = useState<boolean | null>(null);
const [budgetAndSchedule, setBudgetAndSchedule] = useState<string>("");
//const [messageFrequency, setMessageFrequency] = useState<string>("");
const [sequentialDelivery, setSequentialDelivery] = useState<boolean | null>(null);
const [preventDuplicateMessages, setPreventDuplicateMessages] = useState<boolean | null>(null);
//const [dailyRecipientLimit, setDailyRecipientLimit] = useState<number>(0);
const [deliveryStartTime, setDeliveryStartTime] = useState<string>("");
const [deliveryEndTime, setDeliveryEndTime] = useState<string>("");


  const [tempSelectedCountries, setTempSelectedCountries] = useState<string[]>([]);  // Temporary storage

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCampaignBudget(value);
    setIsFocusedOrHasValue(value.trim() !== "");
  };

  const handleFocus = () => {
    setHasInteracted(false);
    setIsFocusedOrHasValue(true);
  };

  const handleBlur = () => {
    setHasInteracted(true);
    validateCampaignName();
    validateBudget();
    validateStartDate(campaignStartDate);

    if (campaignBudget === "") {
      setIsFocusedOrHasValue(false);
    }
  };


  const handleMultiSelectClose = async () => {
    if (isCardLoading) return; // Prevent multiple clicks
  
    // ✅ Check if Russia/Kazakhstan is selected
    const hasRussiaOrKazakhstan = tempSelectedCountries.some((id) =>
      ["Russia", "Kazakhstan"].includes(
        targetCountryList.find((c) => c.country_id.toString() === id)
          ?.country_name ?? ""
      )
    );
  
    setShowRussiaAndKazakhstan(hasRussiaOrKazakhstan);
    setReachPeopleFrom(tempSelectedCountries);
  
    // ✅ If Russia/Kazakhstan is NOT selected, do NOT show loader
    if (!hasRussiaOrKazakhstan) {
      return;
    }
  
    // ✅ Show loader only when needed
    setIsCardLoading(true);
  
    try {
      await Promise.all([
        getAgeList(),
        getGenderList(),
        GetIncomeLevelList(),
        GetLocationList(),
        GetInterestList(),
        GetBehaviourList(),
        GetDeviceList(),
        GetOSDeviceList(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsCardLoading(false);
    }
  };
  

  const currentDate = new Date();

  const handleStartDateChange = (date: Date | undefined) => {
    if (!date || isNaN(date.getTime())) {
      setStartDateError("Start date is required");
      return;
    }
  
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight
  
    if (date < today) {
      setStartDateError("Start date must be greater than or equal to today.");
    } else {
      setStartDateError(null);
    }
  
    setCampaignStartDate(format(date, "dd/MM/yyyy"));
    setStartCalendarOpen(false); // Close the calendar after selection
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    if (!date || isNaN(date.getTime())) {
      setEndDateError("End date is required");
      return;
    }
  
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight
  
    if (date < today) {
      setEndDateError("End date must be greater than or equal to today.");
      return;
    }
  
    if (campaignStartDate) {
      const [startDay, startMonth, startYear] = campaignStartDate.split("/").map(Number);
      const startDate = new Date(startYear, startMonth - 1, startDay);
  
      if (startDate > date) {
        setEndDateError("End date must be after the start date.");
        return;
      }
    }
  
    setEndDateError(null);
    setCampaignEndDate(format(date, "dd/MM/yyyy"));
    setEndCalendarOpen(false); // Close the calendar after selection
  };
  
  
  // Handle Frequency Start Date Change
  const handleFrequencyStartDateChange = (date: Date | undefined) => {
    if (date) {
      setFCampaignStartDate(format(date, "dd/MM/yyyy"));
      setFStartCalendarOpen(false); // Close the calendar
    }
  };

  const handleFrequencyEndDateChange = (date: Date | undefined) => {
    if (date) {
      setFCampaignEndDate(format(date, "dd/MM/yyyy"));
      setFEndCalendarOpen(false); // Close the calendar
    }
  };

  // Disable dates before the current date for start date
  const isStartDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight
    date.setHours(0, 0, 0, 0); // Set the passed date to midnight for comparison
    return date < today; // Compare the date only (ignoring time)
  };

  const isEndDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight
    date.setHours(0, 0, 0, 0); // Set the passed date to midnight for comparison

    if (campaignStartDate) {
      const startDate = new Date(
        campaignStartDate.split("/").reverse().join("-")
      );
      startDate.setHours(0, 0, 0, 0); // Ensure startDate is also at midnight

      // Disable dates before today OR before the start date
      return date < today || date < startDate;
    }

    if (FcampaignStartDate) {
      const startDate = new Date(
        FcampaignStartDate.split("/").reverse().join("-")
      );
      startDate.setHours(0, 0, 0, 0); // Ensure startDate is also at midnight

      // Disable dates before today OR before the start date
      return date < today || date < startDate;
    }
    // Default condition if no start date is selected
    return date < today;
  };

  const formatingDate = (dateString: string) => {
    // debugger;
    const [day, month, year] = dateString.split("/").map(Number);
    // Create a new Date object (months are zero-indexed in JS)
    // Create a new Date object in UTC
    const dateUTC = new Date(Date.UTC(year, month - 1, day));
    // debugger;
    return dateUTC.toISOString();
    // debugger;
  };

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0"); // Get day and pad with zero if needed
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Get month (0-11) and pad
    const year = date.getFullYear(); // Get the full year

    return `${day}/${month}/${year}`; // Return formatted date string
  };

  // Fetch config on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        console.log("Config loaded:", config); // Debugging log
        setApiUrlAdvAcc(config.ApiUrlAdvAcc); // Set API URL from config
      } catch (error) {
        console.error("Error loading config:", error);
        toast.toast({
          title: "Error",
          description: "Something went wrong, Please try again later"
        });
      }
      finally{
      
      }
    };

    fetchConfig();
  }, []); // Runs only once on mount

  // Watch for apiUrlAdvAcc and campaignId to change and fetch data
  useEffect(() => {
    if(apiUrlAdvAcc){
      const fetchData = async () => {
        console.log(
          "Fetching data for apiUrlAdvAcc:",
          apiUrlAdvAcc,
          "campaignId:",
          campaignId
        ); // Debugging log
    
        try {
          await Promise.all([
            GetCurrencyById(),
            getChannelList(),
            getCountryList(),
            getTemplateList(),
            getAudienceList(),
            getTargetCountryList(),
            getRoamingCountryList(),
            campaignId ? loadCampaignList(campaignId) : Promise.resolve(),
          ]);
          console.log("CmapaignID Check?" ,campaignId );
          console.log("Data fetched successfully!..");
          setLoading(false); // Set loading to false only when all APIs succeed
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.toast({
            title: "Error",
            description: "Something went wrong, Please try again later",
          });
        }
      };
      fetchData();
    }else{
      console.log("Api Url not available yet")
    }
 
  }, [apiUrlAdvAcc]);
  

  

  const handleCampaignNameChange = (value: string) => {
    setCampaignName(value);
    //validateCampaignName();
    if (campaignNameError) validateCampaignName(); // Re-validate if there's already an error
  };

  const handleChannelChange = (value: string) => {
    setChannel(value);
    validateChannel(value); // Pass the updated value for validation
  };

  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    validateTemplate(value);
    console.log("temp:", template); // Pass the updated value for validation
  };

  const handleAudienceChange = (value: string) => {
    setAudience(parseInt(value));
    validateAudience(parseInt(value));
    console.log("Audi:", audience);
  };

  const handleReachPeopleFromChange = (values: string[]) => {
    validateFromCountry(values);
    setTempSelectedCountries(values);
  
    // Check if Russia/Kazakhstan is selected
    const hasRussiaOrKazakhstan = values.some((id) =>
      ["Russia", "Kazakhstan"].includes(
        targetCountryList.find((c) => c.country_id.toString() === id)
          ?.country_name ?? ""
      )
    );
  
    // Toggle visibility instantly
    //setShowRussiaAndKazakhstan(hasRussiaOrKazakhstan);
    setHasRussiaOrKazakhstanSelected(hasRussiaOrKazakhstan);
    if (!hasRussiaOrKazakhstan) {
      setShowRussiaAndKazakhstan(false);
    }
  };
  

  const handleReachPeopleInChange = (values: string[]) => {
    setReachPeopleIn(values);
    validateInCountry(values); // Pass the updated values for validation
  };

  const handleAgeChange = (value: string) => {
    setAge(parseInt(value));
    validateAge(parseInt(value)); // Pass the updated value for validation
  };

  const handleGenderChange = (value: string) => {
    setGender(parseInt(value));
    validateGender(parseInt(value)); // Pass the updated value for validation
  };

  const handleIncomeLevelChange = (value: string) => {
    setIncomeLevel(parseInt(value));
    validateIncomeLevel(parseInt(value)); // Pass the updated value for validation
  };

  const handleLocationChange = (value: string) => {
    setLocationCity(parseInt(value));
    validateLocation(parseInt(value)); // Pass the updated value for validation
  };

  const handleInterestChange = (value: string) => {
    setInterest(parseInt(value));
    console.log("InterestI:", interest);
    validateInterest(parseInt(value)); // Pass the updated
  };

  const handleBehaviourChange = (value: string) => {
    setBehaviour(parseInt(value));
    console.log("BehaviourI:", behaviour);
    validateBehaviour(parseInt(value)); // Pass the updated value for validation
  };

  const handleDeviceChange = (value: string) => {
    setDevice(parseInt(value));
    validateDevice(parseInt(value)); // Pass the updated value for validation
  };

  const handleOsDeviceChange = (value: string) => {
    setOsDevice(parseInt(value));
    validateOsDevice(parseInt(value)); // Pass the updated
  };

  const handleCampaignBudgetChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCampaignBudget(e.target.value);
    //validateBudget();
    if (budgetError) validateBudget();
  };

  const validateDailyLimit = (): boolean => {
    if (!isDailyLimitTouched) return true; // Skip validation if input was never clicked
  
    const numericValue = Number(dailyRecipientLimit);
    if (dailyRecipientLimit === "" || isNaN(numericValue) || numericValue < 1 || numericValue > 100) {
      setDailyLimitError("Please enter a valid percentage between 1 and 100");
      return false;
    }
  
    setDailyLimitError(null);
    return true;
  };

  const handleFCampaignBudgetChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFCampaignBudget(e.target.value);
    validateFBudget();
  };


  const handleDailyLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (!isDailyLimitTouched) {
      setIsDailyLimitTouched(true); // Mark as touched on first interaction
    }
    const inputValue = e.target.value;
  
    if (inputValue === "") {
      setDailyRecipientLimit("");
      setDailyLimitError("Please enter a valid percentage between 1 and 100");
    } else {
      const numericValue = Number(inputValue);
      if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 100) {
        setDailyRecipientLimit(numericValue);
        setDailyLimitError(null); // Remove error on valid input
      } else {
        setDailyLimitError("Please enter a valid percentage between 1 and 100"); // Show error on invalid input
      }
    }
  };
    

  const [hasInteracted, setHasInteracted] = useState(false);
  const validateCampaignName = (): boolean => {
    if (!campaignName.trim()) {
      setCampaignNameError("Campaign name is required");
      return false;
    }
    setCampaignNameError(null);
    return true;
  };

  const validateChannel = (value: string): boolean => {
    if (!value) {
      setChannelError("Please select a channel");
      return false;
    }
    setChannelError(null);
    return true;
  };

  const validateTemplate = (value: string): boolean => {
    console.log("Temp Value:" , value)
    if (!value) {
      setTemplateError("Please select a template");
      return false;
    }
    setTemplateError(null);
    return true;
  };

  const validateAudience = (value: number): boolean => {
    console.log("Audience Value:" , value)
    if (!value) {
      setAudienceError("Please select a Audience");
      return false;
    }
    setAudienceError(null);
    return true;
  };

  // const validateAudience = (value: string): boolean => {
  //   console.log("Audi Value:" , value);
  //   if (!value) {
  //     setAudienceError("Please select a template");
  //     return false;
  //   }
  //   console.log("Audii Value:" , value);
  //   setAudienceError(null);
  //   return true;
  // };

  const validateFromCountry = (values: string[]): boolean => {
    if (!values.length) {
      setTargetCountryError("Please select a country");
      return false;
    }
    setTargetCountryError(null);
    return true;
  };

  const validateInCountry = (values: string[]): boolean => {
    if (!values.length) {
      setRoamingCountryError("Please select a country");
      return false;
    }
    setRoamingCountryError(null);
    return true;
  };

  const validateBudget = (): boolean => {
    const parsedBudget = parseFloat(campaignBudget);
    if (!campaignBudget.trim() || isNaN(parsedBudget) || parsedBudget <= 0) {
      setBudgetError("Please enter a valid campaign budget");
      return false;
    }
    setBudgetError(null);
    return true;
  };

  const validateFBudget = (): boolean => {
    const parsedBudget = parseFloat(campaignBudget);
    if (!campaignBudget || isNaN(parsedBudget) || parsedBudget <= 0) {
      setFBudgetError("Please enter a valid campaign budget");
      return false;
    }
    setFBudgetError(null);
    return true;
  };

  const validateAge = (value: number): boolean => {
    if (!value) {
      setAgeError("Please select a Age");
      return false;
    }
    setAgeError(null);
    return true;
  };

  const validateGender = (value: number): boolean => {
    if (!value) {
      setGenderError("Please select a Gender");
      return false;
    }
    setGenderError(null);
    return true;
  };

  const validateIncomeLevel = (value: number): boolean => {
    if (!value) {
      setIncomeLevelError("Please select a Income Level");
      return false;
    }
    setIncomeLevelError(null);
    return true;
  };

  const validateLocation = (value: number): boolean => {
    if (!value) {
      setLocationError("Please select a Location");
      return false;
    }
    setIncomeLevelError(null);
    return true;
  };

  const validateInterest = (value: number): boolean => {
    if (!value) {
      setInterestError("Please select a Interest");
      return false;
    }
    setInterestError(null);
    return true;
  };

  const validateBehaviour = (value: number): boolean => {
    if (!value) {
      setBehaviourError("Please select a Behaviour");
      return false;
    }
    setBehaviourError(null);
    return true;
  };

  const validateDevice = (value: number): boolean => {
    if (!value) {
      setDeviceError("Please select a Device");
      return false;
    }
    setDeviceError(null);
    return true;
  };

  const validateOsDevice = (value: number): boolean => {
    if (!value) {
      setOsDeviceError("Please select a OS Device");
      return false;
    }
    setOsDeviceError(null);
    return true;
  };

  const validateStartDate = (value: string): boolean => {
    let isValid = true;
    if (!value) {
      setStartDateError("Start date is required");
      isValid = false;
    } else {
      setStartDateError(null);
    }
    return isValid;
  }

  const validateEndDate = (value: string): boolean => {
    let isValid = true;
    if (!value) {
      setEndDateError("End date is required");
      isValid = false;
     
    } else if (new Date(campaignEndDate) < new Date(campaignStartDate)) {
      setEndDateError("End date cannot be earlier than start date");
      isValid = false;
     
    } else {
      setEndDateError(null);
    }
    return isValid;
  }

  const validateDates = (value: string): boolean => {
    let isValid = true;
    //debugger;
    if (!value) {
      setStartDateError("Start date is required");
      isValid = false;
    } else {
      setStartDateError(null);
    }

    if (!value) {
      setEndDateError("End date is required");
      isValid = false;
    } else if (new Date(campaignEndDate) < new Date(campaignStartDate)) {
      setEndDateError("End date cannot be earlier than start date");
      isValid = false;
    } else {
      setEndDateError(null);
    }

    // if (!FcampaignStartDate) {
    //   setFStartDateError("Start date is required");
    //   isValid = false;
    // } else {
    //   setFStartDateError(null);
    // }

    // if (!FcampaignEndDate) {
    //   setFEndDateError("End date is required");
    //   isValid = false;
    // } else if (new Date(FcampaignEndDate) < new Date(FcampaignStartDate)) {
    //   setFEndDateError("End date cannot be earlier than start date");
    //   isValid = false;
    // } else {
    //   setFEndDateError(null);
    // }

    return isValid;
  };

  const resetForm = () => {
    setCampaignName("");
    setCampaignBudget("");
    setTemplate("");
    setReachPeopleFrom([]);
    setReachPeopleIn([]);
    setChannel("");
    setCampaignStartDate("");
    setCampaignEndDate("");
    setFCampaignStartDate("");
    setFCampaignEndDate("");
    setAge(0);
    setGender(0);
    setIncomeLevel(0);
    setLocationCity(0);
    setInterest(0);
    setBehaviour(0);
    setDevice(0);
    setOsDevice(0);
    setAudience(0);
  };

  const getCountryList = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetCountryList`);

      // Assuming the response data contains a 'CountryList' field as discussed earlier
      if (response.data && response.data.countryList) {
        setCountryList(response.data.countryList);
        console.log("Country List : ", response.data.countryList);
      } else {
        console.log("No country list available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching country list:", error);
    } finally {
    }
  };

  const getTargetCountryList = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetReachPeopleFromList`
      );

      // Assuming the response data contains a 'CountryList' field as discussed earlier
      if (response.data && response.data.reachPeopleFromList) {
        setTargetCountryList(response.data.reachPeopleFromList);
        console.log("TargetCountry List : ", response.data.reachPeopleFromList);
      } else {
        console.log("No targetCountryList available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching targetCountryList:", error);
    } finally {
    }
  };

  const getRoamingCountryList = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetReachPeopleToList`);

      // Assuming the response data contains a 'CountryList' field as discussed earlier
      if (response.data && response.data.reachPeopleToList) {
        setRoamingCountryList(response.data.reachPeopleToList);
        console.log("RoamingCountry List : ", response.data.reachPeopleToList);
      } else {
        console.log("No RoamingCountry List available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching RoamingCountry List:", error);
    } finally {
    }
  };

  const GetCurrencyById = async () => {
    setLoading(true);

    try {
      console.log("workspaceeid:", workspaceId);
      // const response = await axios.get(`${apiUrlAdvAcc}/GetCurrencyById/${workspaceId}`);
      const response = await axios.get(`${apiUrlAdvAcc}/GetCurrencyById`, {
        params: { workspaceId },
      });
      if (response.data && response.data.currencyList) {
        setCurrencyData(response.data.currencyList);
        console.log(" Currencyy : ", response.data.currencyList);
      } else {
        console.log("No currencyy available in response.", response.data);
      }
    
    } catch (error) {
      console.error("Error fetching in currency data: " + error);
    }
    finally {
    }
  };


  const getAudienceList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetAdvAudienceListDetailsByWorkspaceId?workspace_id=${workspaceId}`
      );
      if (response.data.status === "Success") {
        setAudienceList(response.data.audienceList);
        console.log("audience list: ", response.data.audienceList);
      } else {
        console.error("No audience list found for workspace");
      }
    } catch (error) {
      console.error("Error calling audience list api: " + error);
    }
    finally {
    }
  };

  const getTemplateList = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetMetaTemplateDetails?workspace_id=${workspaceId}`
      );

      if (response.data && response.data.templateDetails) {
        setTemplateList(response.data.templateDetails);
        console.log(response.data.templateDetails);
      } else {
        console.log("No template list available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching template list:", error);
    } finally {
    }
  };

  const getChannelList = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetChannelList`);

      if (response.data && response.data.channelList) {
        setChannelList(response.data.channelList);
        console.log("Channel List : ", response.data.channelList);
      } else {
        console.log("No channel list available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching country list:", error);
    } finally {
    }
  };

  const getAgeList = async () => {
  //  setLoading(true);

    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetAgeList`);

      if (response.data && response.data.ageList) {
        setAgeList(response.data.ageList);
        console.log("Age List : ", response.data.ageList);
      } else {
        console.log("No Age list available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching Age list:", error);
    } 
  };

  const getGenderList = async () => {
    
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetGenderList`);

      if (response.data && response.data.genderList) {
        setGenderList(response.data.genderList);
        console.log("Gender List : ", response.data.genderList);
      } else {
        console.log("No Gender available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching Gender list:", error);
    }
  };

  const GetIncomeLevelList = async () => {
    
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetIncomeLevelList`);

      if (response.data && response.data.incomeLevelList) {
        setIncomeLevelList(response.data.incomeLevelList);
        console.log("Income Level List : ", response.data.incomeLevelList);
      } else {
        console.log("No Income Level List available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching Income Level list:", error);
    } 
  };

  const GetLocationList = async () => {
    
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetLocationList`);

      if (response.data && response.data.locationList) {
        setLocationList(response.data.locationList);
        console.log("Income Level List : ", response.data.locationList);
      } else {
        console.log("No location List List available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching location list:", error);
    } 
  };

  const GetInterestList = async () => {
   
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetInterestList`);

      if (response.data && response.data.interestList) {
        setInterestList(response.data.interestList);
        console.log("Interest List : ", response.data.interestList);
      } else {
        console.log("No Interest List available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching Interest list:", error);
    } 
  };

  const GetBehaviourList = async () => {
    
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetBehaviourList`);

      if (response.data && response.data.behaviourList) {
        setBehaviourList(response.data.behaviourList);
        console.log("Behaviour List : ", response.data.behaviourList);
      } else {
        console.log("No Behaviour List available in response.");
      }
    } catch (error) {      
      console.error("Error fetching Behaviour list:", error);
    } 
  };

  const GetDeviceList = async () => {
    
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetDeviceList`);

      if (response.data && response.data.deviceList) {
        setDeviceList(response.data.deviceList);
        console.log("Device List : ", response.data.deviceList);
      } else {
        console.log("No Device List available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching Device list:", error);
    } 
  };

  const GetOSDeviceList = async () => {
    
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetOSDeviceList`);

      if (response.data && response.data.osDeviceList) {
        setOsList(response.data.osDeviceList);
        console.log(" OS Device List : ", response.data.osDeviceList);
      } else {
        console.log("No OS Device List available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching OS Device list:", error);
    } 
  };


  const loadCampaignList = async (id: any) => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetCampaignDetailsById?CampaignId=` + id
      );

      if (response.data && response.data.campaignDetails) {
        const campaignDetailslocal = response.data.campaignDetails[0];
        // debugger;
        console.log("Campaign List By Id:", campaignDetailslocal);

        setCampaignName(campaignDetailslocal.campaign_name);
        setCampaignBudget(campaignDetailslocal.campaign_budget);
        setUpdateChannel(campaignDetailslocal.channel_type);
        setUpdateTemplate(campaignDetailslocal.template_name);
        //setUpdateCountry(campaignDetailslocal.target_country);
        setUpdateRoamingCountry(
          campaignDetailslocal.roaming_country
            ? campaignDetailslocal.roaming_country.split(",").map((c: string) => c.trim()) // ✅ Explicitly define c as string
            : []
        );
        
        setUpdateRoamingCountry(campaignDetailslocal.roaming_country);
        setUpdateAge(campaignDetailslocal.age);
        setUpdateGender(campaignDetailslocal.gender);
        setUpdateIncomeLevel(campaignDetailslocal.income_level);
        setUpdateLocation(campaignDetailslocal.location);
        setUpdateInterest(campaignDetailslocal.interests);
        setUpdateBehaviour(campaignDetailslocal.behaviours);
        setUpdateDevice(campaignDetailslocal.device);
        setUpdateOsDevice(campaignDetailslocal.os_device);
        setCampaignStartDate(campaignDetailslocal.start_date_time);
        setCampaignEndDate(campaignDetailslocal.end_date_time);
        setCampaignBudget(campaignDetailslocal.campaign_budget);
        setUpdateAudience(campaignDetailslocal.listname);

        setIsAdminApproved(campaignDetailslocal.isAdminApproved);
        setIsOperatorApproved(campaignDetailslocal.isOperatorApproved);
        setBudgetAndSchedule(campaignDetailslocal.budget_and_schedule);
        setMessageFrequency(campaignDetailslocal.message_frequency);
        setSequentialDelivery(campaignDetailslocal.sequential_delivery);
        setPreventDuplicateMessages(campaignDetailslocal.prevent_duplicate_messages);
        setDailyRecipientLimit(campaignDetailslocal.daily_recipient_limit);
        setDeliveryStartTime(campaignDetailslocal.delivery_start_time);
        setDeliveryEndTime(campaignDetailslocal.delivery_end_time);

        const formattedStartDate =
          campaignDetailslocal.start_date_time.split("T")[0];
        handleStartDateChange(new Date(formattedStartDate)); // Call handleDateChange for the start date

        // Format and set the end date using handleDateChange
        const formattedEndDate =
          campaignDetailslocal.end_date_time.split("T")[0];
        handleEndDateChange(new Date(formattedEndDate)); // Call handleDateChange for the end date
        console.log("API Target Country:", campaignDetailslocal.target_country);
        console.log("API Roam Country:", campaignDetailslocal.roaming_country);
        console.log("Updated State Target Country:", updateCountry);
        console.log("Updated State Roaming Country:", updateRoamingCountry);


        const formattedTargetCountry = campaignDetailslocal.target_country
        ? campaignDetailslocal.target_country.split(",").map((c: string) => c.trim())
        : [];
  
      console.log("✅ Processed Target Country:", formattedTargetCountry);
  
      setUpdateCountry(formattedTargetCountry); // Ensure it's an array
  


      } else {
        console.log("No campaign details available in response.");
      }
    } catch (error) {
      console.error("Error fetching campaign details:", error);
    } finally {
    }
  };

  const handleSubmit = async () => {
    setIsDailyLimitTouched(true);
    
    const isCampaignNameValid = validateCampaignName();
    const isChannelValid = validateChannel(channel);
    const isTemplateValid = validateTemplate(template);
    const isAudienceValid = validateAudience(audience);
    //const isAudienceValid = validateAudience(audience.toString());
    const isFromCountryValid = validateFromCountry(reachPeopleFrom);
    const isInCountryValid = validateInCountry(reachPeopleIn);
    const isBudgetValid = validateBudget();
    const isFBudgetValid = validateFBudget();
    const isStartDateValid = validateStartDate(campaignStartDate);
    const isEndDateValid = validateEndDate(campaignEndDate);
   // const areDatesValid = validateDates(campaignStartDate);
    const isAgeValid = validateAge(age);
    const isGenderValid = validateGender(gender);
    const isIncomeLevelValid = validateIncomeLevel(incomeLevel);
    const isLocationValid = validateLocation(locationcity);
    const isInterestValid = validateInterest(interest);
    const isBehaviourValid = validateBehaviour(behaviour);
    const isDeviceValid = validateDevice(device);
    const isOsDeviceValid = validateOsDevice(osDevice);
    const isDailyLimitValid = validateDailyLimit();

    if (!isDailyLimitValid) {
      setDailyLimitError("Please enter a valid percentage between 1 and 100"); // Ensure error message appears on submit
    }
  
    if (
      !isCampaignNameValid ||
      !isChannelValid ||
      !isTemplateValid ||
      !isAudienceValid ||
      !isFromCountryValid ||
      !isInCountryValid ||
      !isBudgetValid ||
      !isBudgetValid ||
      !isStartDateValid ||
      !isEndDateValid ||
      !isDailyLimitValid
      //!areDatesValid
      // !isAgeValid ||
      // !isGenderValid ||
      // !isIncomeLevelValid ||
      // !isLocationValid ||
      //  !isInterestValid ||
      //  !isBehaviourValid ||
      //  !isDeviceValid ||
      //  !isOsDeviceValid
    ) {
      return;
    }

    try {
      console.log("API Calling : ");
      console.log("Age : " + age);
      console.log("Gender:", gender);
      console.log("Income Level : " + incomeLevel);
      console.log("Location : " + locationcity);
      console.log("Interest : " + interest);
      console.log("Behaviour : " + behaviour);
      console.log("Device : " + device);
      console.log("OS Device : " + osDevice);
      console.log("Channel :", channel);
      console.log("Audi:", audience);
      console.log("AudiN:", Number(audience));
      // debugger;
      // const
      //  channelId = channelList.find(
      //   (data) => data.channel_name === channel
      // );
      //  debugger;
      

      const data = {
        CampaignName: campaignName,
        CampaignBudget: campaignBudget,
        ChannelType: channel,
        TargetCountry: JSON.stringify(reachPeopleFrom),
        RoamingCountry: JSON.stringify(reachPeopleIn),
        StartDateTime: formatingDate(campaignStartDate),
        EndDateTime: formatingDate(campaignEndDate),
        // FStartDateTime: formatingDate(FcampaignStartDate),
        // FEndDateTime: formatingDate(FcampaignEndDate),
        status: "In review",
        TemplateName: template,
        CreatedBy: 1,
        UpdatedBy: 1,
        WorkspaceId: workspaceId,
        ListId: Number(audience),
        device_id: device ? device : 0,
        Delivered: "Delivered",
        ReadCampaign: "ReadCampaign",
        CTR: "CTR",
        DeliveryRate: "DeliveryRate",
        ButtonClick: "ButtonClick",
        Age: age ? age : 0,
        Gender: gender ? gender : 0,
        IncomeLevel: incomeLevel ? incomeLevel : 0,
        Location: locationcity ? locationcity : 0,
        interests: interest ? interest : 0,
        behaviours: behaviour ? behaviour : 0,
        OSDevice: osDevice ? osDevice : 0,
        FCampaignBudget: "FCampaignBudget",
        fStartDateTime: "2025-01-02T05:37:38.105Z",
        fEndDateTime: "2025-01-02T05:37:38.105Z",
       // campaignId: 495, // Hardcoded Campaign ID
        isAdminApproved: "", // Placeholder
        isOperatorApproved: "", // Placeholder
        budgetAndSchedule: budgetType, // Placeholder
        messageFrequency: "string", // Placeholder
        sequentialDelivery: "string", // Placeholder
        preventDuplicateMessages: "string", // Placeholder
        dailyRecipientLimit: dailyRecipientLimit, // Hardcoded as per request
        deliveryStartTime: "2025-01-31T05:11:44.329Z", // Hardcoded DateTime
        deliveryEndTime: "2025-01-31T05:11:44.329Z" // Hardcoded DateTime
      };
      

      // debugger;
      console.log(data);
      //debugger;
      const response = await axios.post(`${apiUrlAdvAcc}/CreateCampaign`, data);

      if (response.data.status === "Success") {
        try {
          const response2 = await axios.get(
            `${apiUrlAdvAcc}/Getcampaigncontacts?CampaignId=${response.data.campaign_id}`
          );
          if (response2.data.status === "Success") {
            console.log("Campaign Contact loaded successfully");
          } else {
            console.log("Api could not fetch campaign contacts for workspace");
          }
        } catch (error) {
          console.log("Error in capaign contact api: ", error);
        } finally {
          resetForm();
          toast.toast({
            title: "Success.",
            description: "Campaign Created Successfully.",
          });
          setTimeout(() => {
            dispatch(setCreateBreadCrumb(false));
            navigate("/navbar/campaignlist");
          }, 1000);
        }
      } else {
        console.error("Upload failed:", response.data.Status_Description);
        //toast.("An error occurred while saving the campaign details");
        setTimeout(() => {
          /* wait for 1 second */
        }, 1000);
      }
    } catch (e) {
      console.log("Error in submitting form");
    }
  };

  const handleEdit = async () => {
    console.log("channel : " + channel + "updatechannel : " + updateChannel);

    // Determine whether to use 'channel' or 'updateChannel'
    const channelToFind = channel || updateChannel;

    // Find the selected channel from the list
    const selectedChannel = channelList.find(
      (findchannel) => findchannel.channel_name === channelToFind
    );

    // Get the channel ID, or null if not found
    const updateChannelId = selectedChannel ? selectedChannel.channel_id : null;

    // const updateChannelId= channelList.find((data)=>data.channel_name===channel);

    const selectedTemplate = templateList.find(
      (findtemplate) => findtemplate.template_name === updateTemplate
    );
    const updateTemplateId = selectedTemplate
      ? selectedTemplate.template_id
      : null;

    const AudienceToFind = audience || updateAudience;
    const selectedAudience = audienceList.find(
      (findAudience) => findAudience.listname === AudienceToFind
    );
    const updateAudienceId = selectedAudience ? selectedAudience.list_id : null;

    const AgeToFind = age || updateAge;
    const GenderToFind = gender || updateGender;
    const IncomeLevelToFind = incomeLevel || updateIncomeLevel;
    const LocationToFind = locationcity || updateLocation;
    const InterestToFind = interest || updateInterest;
    const BehaviourToFind = behaviour || updateBehaviour;
    const DeviceToFind = device || updateDevice;
    const OsDeviceToFind = osDevice || updateOsDevice;

    //  const selectedAudience = audienceList.find((findAudience) => findAudience.audience_name === AudienceToFind);
    const selectedAge = ageList.find((findAge) => findAge.age === AgeToFind);
    const selectedGender = genderList.find(
      (findGender) => findGender.gender === GenderToFind
    );
    const selectedIncomeLevel = IncomeLevelList.find(
      (findIncomeLevel) => findIncomeLevel.income_level === IncomeLevelToFind
    );
    const selectedLocation = locationList.find(
      (findLocation) => findLocation.location === LocationToFind
    );
    const selectedInterest = interestList.find(
      (findInterest) => findInterest.interest === InterestToFind
    );
    const selectedBehaviour = behaviourList.find(
      (findBehaviour) => findBehaviour.behaviour === BehaviourToFind
    );
    const selectedDevice = deviceList.find(
      (findDevice) => findDevice.device === DeviceToFind
    );
    const selectedOsDevice = osList.find(
      (findOsDevice) => findOsDevice.os_device === OsDeviceToFind
    );

    const updateAgeId = selectedAge ? selectedAge.id : null;
    const updateGenderId = selectedGender ? selectedGender.id : null;
    const updateIncomeLevelId = selectedIncomeLevel
      ? selectedIncomeLevel.id
      : null;
    const updateLocationId = selectedLocation ? selectedLocation.id : null;
    const updateInterestId = selectedInterest ? selectedInterest.id : null;
    const updateBehaviourId = selectedBehaviour ? selectedBehaviour.id : null;
    const updateDeviceId = selectedDevice ? selectedDevice.id : null;
    const updateOsDeviceId = selectedOsDevice ? selectedOsDevice.id : null;

    console.log("age : ", age + "updateAgeId : ", updateAgeId);
    console.log("updateAge : ", updateAge);
    console.log(
      "updateInterestId : ",
      updateInterestId,
      "updateInterest:",
      updateInterest
    );

    // const selectedCountry = countryList.find(
    //   (findcountry) => findcountry.country_name === updateCountry
    // );
    // const updateCountryId = selectedCountry ? selectedCountry.country_id : null;

    const countryArray = updateCountry.split(","); // Split the string into an array

    const countryIds = countryArray
      .map((countryName) => {
        const selectedCountry = targetCountryList.find(
          (findcountry) =>
            findcountry.country_name.trim() === countryName.trim()
        );
        return selectedCountry ? selectedCountry.country_id : null; // Get the country_id or null
      })
      .filter((id) => id !== null); 

    const updateCountryId = JSON.stringify(countryIds);

    const roamingCountryArray = updateRoamingCountry.split(","); 

    const roamingCountryIds = roamingCountryArray
      .map((countryName) => {
        const selectedCountry = roamingCountryList.find(
          (findcountry) =>
            findcountry.country_name.trim() === countryName.trim()
        );
        return selectedCountry ? selectedCountry.country_id : null; // Get the country_id or null
      })
      .filter((id) => id !== null); 

    const updateRoamingCountryId = JSON.stringify(roamingCountryIds);
    console.log("updateRoamingCountryId 1: ", updateRoamingCountryId);
    const TargetCountry =
      reachPeopleFrom.length === 0 
        ? updateCountryId 
        : reachPeopleFrom.map((id) => id.trim());

    const RoamingCountry =
      reachPeopleFrom.length === 0 // Check if the array is empty
        ? updateRoamingCountryId // Use the array of IDs
        : reachPeopleIn.map((id) => id.trim());

    if (
      !validateCampaignName() &&
      !validateChannel(channel) &&
      !validateTemplate(template) &&
      !validateAudience(audience) &&
      !validateFromCountry(reachPeopleFrom) &&
      !validateInCountry(reachPeopleIn) &&
      !validateBudget() &&
      !validateFBudget() &&
      !validateStartDate(campaignStartDate) &&
      !validateEndDate(campaignEndDate) &&
     // !validateDates(campaignStartDate) &&
      !validateAge(age) &&
      !validateGender(gender) &&
      !validateIncomeLevel(incomeLevel) &&
      !validateLocation(locationcity) &&
      !validateInterest(interest) &&
      !validateBehaviour(behaviour) &&
      !validateDevice(device) &&
      !validateOsDevice(osDevice)
    ) {
      return;
    }

    try {
      const data = {
        CampaignId: campaignId,
        CampaignName: campaignName,
        CampaignBudget: campaignBudget,
        ChannelType: updateChannelId ? updateChannelId : channel,
        TargetCountry:
          reachPeopleFrom.length === 0
            ? TargetCountry
            : JSON.stringify(reachPeopleFrom),
        RoamingCountry:
          reachPeopleIn.length === 0
            ? RoamingCountry
            : JSON.stringify(reachPeopleIn),
        StartDateTime: formatingDate(campaignStartDate),
        EndDateTime: formatingDate(campaignEndDate),
        // FStartDateTime: formatingDate(FcampaignStartDate),
        // FEndDateTime: formatingDate(FcampaignEndDate),
        TemplateName: template == "" ? updateTemplateId : template,
        status: "In review",
        CreatedBy: 1,
        CreatedDate: "2025-01-03T06:55:17.555Z",
        UpdatedBy: 1,
        UpdatedDate: "2025-01-03T06:55:17.555Z",
        WorkspaceId: workspaceId,
        ListId: audience == 0 ? updateAudienceId : Number(audience),
        device_id: updateDeviceId ? updateDeviceId : device,
        Delivered: "Delivered",
        ReadCampaign: "ReadCampaign",
        CTR: "CTR",
        DeliveryRate: "DeliveryRate",
        ButtonClick: "ButtonClick",
        Age: updateAgeId ? updateAgeId : age,
        Gender: updateGenderId ? updateGenderId : gender,
        IncomeLevel: updateIncomeLevelId ? updateIncomeLevelId : incomeLevel,
        Location: updateLocationId ? updateLocationId : locationcity,
        interests: updateInterestId ? updateInterestId : interest,
        behaviours: updateBehaviourId ? updateBehaviourId : behaviour,
        OSDevice: updateOsDeviceId ? updateOsDeviceId : osDevice,
        FCampaignBudget: "FCampaignBudget",
        fStartDateTime: "2025-01-02T05:37:38.105Z",
        fEndDateTime: "2025-01-02T05:37:38.105Z",

        isAdminApproved: "string", 
        isOperatorApproved: "string", 
        budgetAndSchedule: "string", 
        messageFrequency: "string", 
        sequentialDelivery: "string", 
        preventDuplicateMessages: "string", // Placeholder
        dailyRecipientLimit: 0, // Hardcoded as per request
        deliveryStartTime: "2025-01-31T06:07:59.625Z", // Hardcoded DateTime
        deliveryEndTime: "2025-01-31T06:07:59.625Z"
      };
      // debugger;
      console.log(data);
      // debugger;
      console.log("Channel :" + channel);
      const response = await axios.put(`${apiUrlAdvAcc}/UpdateCampaign`, data);
      if (response.data.status === "Success") {
        toast.toast({
          title: "success",
          description: "The campaign details were updated successfully",
        });
        setTimeout(() => {
          navigate("/navbar/campaignlist");
        }, 1000);
      } else {
        console.error("Upload failed:", response.data.Status_Description);
        toast.toast({
          title: "Error",
          description: "An error occurred while updating the campaign details",
        });
        setTimeout(() => {
          /* wait for 1 second */
        }, 1000);
      }
    } catch (e) {
      console.error("Error in submitting form", e);
    }
  };

  const isRussiaOrKazakhstanSelected = (): boolean => {
    const russiaId = targetCountryList.find(
      (country) => country.country_name === "Russia"
    )?.country_id;

    const kazakhstanId = targetCountryList.find(
      (country) => country.country_name === "Kazakhstan"
    )?.country_id;

    // Check Russia selection in both arrays
    const isRussiaSelected =
      !!russiaId && reachPeopleFrom.includes(russiaId.toString());
    const isUpdatedRussiaSelected = updateCountry.includes("Russia");

    console.log("isRussiaSelected:", isRussiaSelected);
    console.log("isUpdatedRussiaSelected:", isUpdatedRussiaSelected);

    // Check Kazakhstan selection in both arrays
    const isKazakhstanSelected =
      !!kazakhstanId && reachPeopleFrom.includes(kazakhstanId.toString());
    const isUpdatedKazakhstanSelected = updateCountry.includes("Kazakhstan");

    console.log("isKazakhstanSelected:", isKazakhstanSelected);
    console.log("isUpdatedKazakhstanSelected:", isUpdatedKazakhstanSelected);

    // Return true if either Russia or Kazakhstan is selected
    return (
      isRussiaSelected ||
      isUpdatedRussiaSelected ||
      isKazakhstanSelected ||
      isUpdatedKazakhstanSelected
    );
  };

  // useEffect(() => {
  //   console.log("updateCountry UE ", updateCountry);
  //   console.log("updateRoamingCountry UE", updateRoamingCountry);

  //   if (
  //     reachPeopleFrom ||
  //     (targetCountryList && targetCountryList.length > 0) ||
  //     (updateCountry && updateCountry.length > 0) ||
  //     (updateRoamingCountry && updateRoamingCountry.length > 0)
  //   ) 
  //   {
  //     setShowRussiaAndKazakhstan(!!isRussiaOrKazakhstanSelected());
  //   }

  // }, [
  //   JSON.stringify(reachPeopleFrom),
  //   JSON.stringify(targetCountryList),
  //   JSON.stringify(updateCountry),
  //   JSON.stringify(updateRoamingCountry),
  // ]);


  const channelFilter = (channelTemplate: any) => {
    console.log("Channel : " + channelTemplate);

    const channelFilterId = channelList.find(
      (cid) => cid.channel_id === channelTemplate
    );
    const channelFilterName = channelFilterId
      ? channelFilterId.channel_name
      : "";

    const templatefilterlist1 = templateList.filter(
      (tname) => tname.channel_type === channelFilterName
    );
    setTemplatefilterlist(templatefilterlist1);

    console.log("Filter list : " + templatefilterlist);
  };

  // const getTemplateChannel = () => {
  //   const findchannel = templateList.find(
  //     (findtemplate) => findtemplate.template_id === parseInt(template)
  //   );
  //   const channelType = findchannel ? findchannel.channel_type : "";
  //   setChannel(channelType);
  // };

  // useEffect(() => {
  //   getTemplateChannel();
  // }, [template]);

  const getCurrentDateTime = () => {
    const now = new Date();
    return format(now, "MMM dd, yyyy 'at' HH:mm"); // Example: Dec 30, 2024 at 07:55
  };

  return (
    
    
    <>
      <div className="overflow-y-auto ml-[-7px]">
        <Toaster />
  
        {/* {isLoading && (
          <div className="flex flex-col items-center justify-center h-[500px]">
            <CircularProgress color="primary" />
          </div>
        )} */}

{isLoading ? (
      <div className="flex flex-col items-center justify-center h-[500px]">
        <CircularProgress color="primary" />
      </div>
    ) : (
      <>

        <div className="fixed flex justify-end gap-4 mr-[40px] items-end right-[0px] top-[-15px] z-20 ">
          <Button
            variant={"outline"}
            className="w-[80px] border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            onClick={() => {
              dispatch(setCreateBreadCrumb(false));
              navigate("/navbar/campaignlist");
            }}
          >
            Discard
          </Button>
          <Button
            className="w-[80px] text-[#F8FAFC]"
            onClick={() => {
              if (campaignId) {
                handleEdit(); // Call handleEdit if campaignId exists
              } else {
                handleSubmit(); // Call handleSubmit if campaignId does not exist
              }
              console.log("Clicked"); // Log the click event
            }}
          >
            {campaignId ? "Update" : "Submit"}
          </Button>
        </div>
        <div className="gap-4 flex ">
          <div className="ml-4">
            <Card className="w-[580px] mt-2 p-4 shadow-sm">
              <div className="text-left">
                <h3 className="text-base font-bold text-[#020617] text-left">
                  Create campaign
                </h3>
                <div className="mt-4">
                  <Label
                    htmlFor="campaignName"
                    className="mt-8 font-medium text-[#020617]"
                    style={{ fontSize: "14px" }}
                  >
                    Campaign name
                  </Label>
                  <Input
                    id="campaignName"
                    type="text"
                    placeholder={"New campaign - " + getCurrentDateTime()}
                    value={campaignName}
                    onChange={(e) => handleCampaignNameChange(e.target.value)}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className="mt-2 text-[#64748B] text-sm font-normal"
                  />
                  {campaignNameError && (
                    <p className="text-red-500 text-sm">{campaignNameError}</p>
                  )}
                </div>

                <div className="mt-4">
                  <Label
                    htmlFor="channel"
                    className="mt-2 font-medium text-[#020617]"
                    style={{ fontSize: "14px" }}
                  >
                    Channel
                  </Label>
                  <Select
                    value={channel}
                    onValueChange={(value) => {
                      handleChannelChange(value);
                      channelFilter(value);
                      console.log("Selected Channel ID:", value);
                    }}
                  >
                    <SelectTrigger className="text-gray-500 mt-2">
                      <SelectValue
                        className="text-[#64748B] text-sm font-normal"
                        placeholder={
                          campaignId
                            ? updateChannel
                            : "Select your campaign channel"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {channelList
                        .filter(
                          (channel) =>
                            channel.channel_name.toLowerCase() === "whatsapp"
                        ) // Filter WhatsApp channel
                        .map((channel) => (
                          <SelectItem
                            className="text-[#64748B] text-sm font-normal"
                            key={channel.channel_id}
                            value={channel.channel_id as any}
                          >
                            {channel.channel_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {channelError && (
                    <p className="text-red-500 text-sm">{channelError}</p>
                  )}
                </div>

                <div className="mt-4 mb-4">
                  <Label
                    htmlFor="template"
                    className="mt-2 font-medium text-[#020617]"
                    style={{ fontSize: "14px" }}
                  >
                    Template
                  </Label>
                  <Select
                    value={template}
                    onValueChange={(value) => {
                      console.log("Selected Template ID:", value);
                      handleTemplateChange(value);
                    }} // Use onValueChange instead of onChange
                  >
                    <SelectTrigger className="text-gray-500 mt-2">
                      <SelectValue
                        className="text-[#64748B] text-sm font-normal"
                        placeholder={
                          campaignId
                            ? updateTemplate
                            : "Select your template to send"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {templatefilterlist.map((template) => (
                        <>
                          {/* {setChannel(template.channel_type)} */}
                          <SelectItem
                            className="text-[#64748B] text-sm font-normal"
                            key={template.template_id}
                            value={template.template_id as any}
                          >
                            {template.template_name}{" "}
                          </SelectItem>
                        </>
                      ))}
                    </SelectContent>
                  </Select>
                  {templateError && (
                    <p className="text-red-500 text-sm">{templateError}</p>
                  )}
                </div>
                {/* Add small gray text below */}
                <p className="text-gray-500 text-xs mt-0">
                  Note: To start a campaign, you must first create and add a
                  template. Campaigns can only be initiated after a template has
                  been successfully added.
                </p>
              </div>
            </Card>

            <Card className="w-[580px] mt-6 p-4 shadow-sm">
              <div className="mt-2 text-left">
                <h3
                  className="text-base text-[#020617] font-bold text-left"
                  style={{ fontSize: "16px" }}
                >
                  Target audience
                </h3>
                <p
                  className="mt-1"
                  style={{
                    fontWeight: 200,
                    fontSize: "14px",
                    color: "#64748B",
                  }}
                >
                  Our ad technology automatically finds your audience.
                </p>
                <div className="mt-4">
                  <Label
                    htmlFor="reachPeopleFrom"
                    className="mt-2 text-sm font-medium text-[#020617]"
                  >
                    Reach people from
                  </Label>
                  <MultiSelect
                    className="text-[#64748B] text-sm font-normal mt-1"
                    options={targetCountryList.map((country) => ({
                      label: country.country_name,
                      value: country.country_id.toString(), // Convert ID to string
                    }))}
                    onValueChange={(values) => {
                      console.log("Selected Country IDs:", values);
                      console.log("updateCountry:::" ,   updateCountry);
                      handleReachPeopleFromChange(values); // Update selected values
                    }}
                  //  onValueChange={handleReachPeopleFromChange}
                    // defaultValue={
                    //   updateCountry
                    //     ? Array.isArray(updateCountry)
                    //       ? updateCountry.map(String) // Ensure it's an array of strings
                    //       : [updateCountry.toString()] // Convert single value to an array
                    //     : [] // Default to an empty array if no value is present
                    // }
                    value={tempSelectedCountries.length > 0 ? tempSelectedCountries : []} // Ensuring proper binding
                    placeholder={tempSelectedCountries.length > 0 ? tempSelectedCountries.join(", ") : "Select country"}
// Bind pre-selected values
                   //value={reachPeopleFrom}
                   // placeholder={campaignId ? updateCountry : "Select country"}
                    maxCount={3}
                    variant="inverted"
                    onClose={handleMultiSelectClose} 
                  />

                  {targetCountryError && (
                    <p className="text-red-500 text-sm">{targetCountryError}</p>
                  )}
                </div>
                <div className="mt-4">
                  <Label
                    htmlFor="reachPeopleIn"
                    className="mt-2 text-sm font-medium text-[#020617]"
                  >
                    Reach people traveling to
                  </Label>
                  <MultiSelect
                    className="text-[#64748B] text-sm font-normal mt-1"
                    options={roamingCountryList.map((country) => ({
                      label: country.country_name,
                      value: country.country_id.toString(), // Convert to string
                    }))}
                    onValueChange={(values) => {
                      console.log("Selected Country IDs:", values);
                      console.log("RoamCountry:::" , updateRoamingCountry);
                      handleReachPeopleInChange(values); // Expecting values as string[]
                    }}
                    value={reachPeopleFrom}
                    placeholder={
                      campaignId ? updateRoamingCountry : "Select country"
                    }
                    maxCount={3}
                    variant="inverted"
                  />
                  {roamingCountryError && (
                    <p className="text-red-500 text-sm">
                      {roamingCountryError}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <Label
                    htmlFor="template"
                    className="mt-2 text-sm font-medium text-[#020617]"
                  >
                    Predefined audiences
                  </Label>
                  <Select
                    // value={age.toString()}
                    value={audience !== 0 ? audience.toString() : undefined}
                    onValueChange={(value) => {
                      console.log("Selected audience ID:", value);
                      console.log("Updated audience:", updateAudience);
                      handleAudienceChange(value);
                    }}
                  >
                    <SelectTrigger className="text-gray-500 mt-2">
                      <SelectValue
                        className="text-[#64748B] text-sm font-normal"
                        // placeholder={age === 0 ? "Select Age" : age}
                        placeholder={campaignId ? updateAudience : "Audience"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {audienceList.map((audience) => (
                        <>
                          {/* {setChannel(template.channel_type)} */}
                          <SelectItem
                            className="text-[#64748B] text-sm font-normal"
                            key={audience.list_id}
                            value={audience.list_id.toString()}
                          >
                            {audience.listname}
                          </SelectItem>
                        </>
                      ))}
                    </SelectContent>
                  </Select>
                  {AudienceError && (
                    <p className="text-red-500 text-sm">{AudienceError}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Conditional Rendering for Russia and Kazakhstan */}
            {/* isRussiaAndKazakhstanSelected() && ( */}


  {isCardLoading ? (
    <div className="flex flex-col items-center justify-center h-[500px]">
    <CircularProgress color="primary" />
    </div>
     ) :showRussiaAndKazakhstan ? (
              <Card className="w-[580px] mt-6 p-4 shadow-sm">
                <div className="mt-2 text-left">
                  <h3 className="text-base text-[#020617] font-bold text-left">
                    Target segment (Russia and Kazakhstan only)
                  </h3>
                  <p
                    className="mt-1"
                    style={{
                      fontWeight: 200,
                      fontSize: "14px",
                      color: "#64748B",
                    }}
                  >
                    Select from the options below.
                  </p>

                  {/* Demographics */}
                  <div className="mt-4 flex space-x-4">
                    <div className="flex-1">
                      <Label
                        htmlFor="age"
                        className="text-sm font-medium text-[#020617] "
                      >
                        Demographics
                      </Label>
                      <Select
                        value={age !== 0 ? age.toString() : undefined} // Dynamically bind selected value
                        onValueChange={(value) => {
                          console.log("Selected age ID:", value);
                          handleAgeChange(value);
                        }}
                      >
                        <SelectTrigger className="text-gray-500 mt-2 flex items-center justify-between px-3">
                          <SelectValue
                            placeholder={campaignId ? updateAge : "Age"} // Placeholder or selected value
                            className="text-[#ecf4ff] text-sm font-normal"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {ageList.map((age) => (
                            <SelectItem
                              className="text-[#64748B] text-sm font-normal"
                              key={age.id}
                              value={age.id.toString()}
                            >
                              {age.age}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      {/* <Label htmlFor="gender" className="text-sm font-normal text-[#020617]">
              Gender
            </Label> */}
                      {/* <Select
                          value={gender ! ==0 ? gender.toString() : undefined}
                          onValueChange={(value) => {
                            console.log("Selected gender ID:", value);
                            handleGenderChange(value);
                          }} >
                        <SelectTrigger className="text-gray-500 mt-7">
                          <SelectValue
                            className="text-[#64748B] text-sm font-normal"
                            
                            placeholder={campaignId ? updateGender : "Gender"}
                          />
                        </SelectTrigger> */}
                      <Select
                        value={gender !== 0 ? gender.toString() : undefined} // Dynamically bind selected value
                        onValueChange={(value) => {
                          console.log("Selected gender ID:", value);
                          handleGenderChange(value);
                        }}
                      >
                        <SelectTrigger className="text-gray-500 mt-7 flex items-center justify-between px-3">
                          <SelectValue
                            placeholder={campaignId ? updateGender : "Gender"} // Placeholder or selected value
                            className="text-[#64748B] text-sm font-normal"
                          />
                        </SelectTrigger>
                        {/* <SelectContent>
                <SelectItem value="male" className="text-[#64748B] text-sm font-normal">Male</SelectItem>
                <SelectItem value="female" className="text-[#64748B] text-sm font-normal">Female</SelectItem>
              </SelectContent> */}
                        <SelectContent>
                          {genderList.map((gender) => (
                            <>
                              <SelectItem
                                className="text-[#64748B] text-sm font-normal"
                                key={gender.id}
                                value={gender.id.toString()}
                              >
                                {gender.gender}
                              </SelectItem>
                            </>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      {/* <Label htmlFor="income" className="text-sm font-normal text-[#020617]">
              Income Level
            </Label> */}
                      <Select
                        value={
                          incomeLevel !== 0 ? incomeLevel.toString() : undefined
                        } // Dynamically bind selected value
                        onValueChange={(value) => {
                          console.log("Selected incomeLevel ID:", value);
                          handleIncomeLevelChange(value);
                        }}
                      >
                        <SelectTrigger className="text-gray-500 mt-7 flex items-center justify-between px-3">
                          <SelectValue
                            placeholder={
                              campaignId ? updateIncomeLevel : "IncomeLevel"
                            } // Placeholder or selected value
                            className="text-[#64748B] text-sm font-normal"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {IncomeLevelList.map((incomeLevel) => (
                            <>
                              <SelectItem
                                className="text-[#64748B] text-sm font-normal"
                                key={incomeLevel.id}
                                value={incomeLevel.id.toString()}
                              >
                                {incomeLevel.income_level}
                              </SelectItem>
                            </>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mt-4">
                    <Label
                      htmlFor="location"
                      className="text-sm font-medium text-[#020617]"
                    >
                      Location
                    </Label>
                    <Select
                      value={
                        locationcity !== 0 ? locationcity.toString() : undefined
                      }
                      onValueChange={(value) => {
                        console.log("Selected location ID:", value);
                        handleLocationChange(value);
                      }}
                    >
                      <SelectTrigger className="text-gray-500 mt-2 flex items-center justify-between px-3">
                        <SelectValue
                          className="text-[#64748B] text-sm font-normal"
                          placeholder={
                            campaignId ? updateLocation : "Select city"
                          }
                        />
                      </SelectTrigger>
                      {/* <SelectContent>
              <SelectItem value="Moscow" className="text-[#64748B] text-sm font-normal">Moscow</SelectItem>
              <SelectItem value="Almaty" className="text-[#64748B] text-sm font-normal">Almaty</SelectItem>
            </SelectContent> */}

                      <SelectContent>
                        {locationList.map((locationcity) => (
                          <>
                            <SelectItem
                              className="text-[#64748B] text-sm font-normal"
                              key={locationcity.id}
                              value={locationcity.id.toString()}
                            >
                              {locationcity.city}
                            </SelectItem>
                          </>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Interests */}
                  <div className="mt-4">
                    <Label
                      htmlFor="interests"
                      className="text-sm font-medium text-[#020617]"
                    >
                      Interests
                    </Label>

                    <Select
                      value={interest !== 0 ? interest.toString() : undefined} // Dynamically bind selected value
                      onValueChange={(value) => {
                        console.log("Selected interest ID:", value);
                        handleInterestChange(value);
                      }}
                    >
                      <SelectTrigger className="text-gray-500 mt-2 flex items-center justify-between px-3">
                        <SelectValue
                          placeholder={
                            campaignId ? updateInterest : "Select interest"
                          } // Placeholder or selected value
                          className="text-[#64748B] text-sm font-normal"
                        />
                      </SelectTrigger>
                      {/* <SelectContent>
                <SelectItem value="tech" className="text-[#64748B] text-sm font-normal">Technology</SelectItem>
              <SelectItem value="fashion" className="text-[#64748B] text-sm font-normal">Fashion</SelectItem>
            </SelectContent> */}
                      <SelectContent>
                        {interestList.map((interest) => (
                          <>
                            <SelectItem
                              className="text-[#64748B] text-sm font-normal"
                              key={interest.id}
                              value={interest.id.toString()}
                            >
                              {interest.interest}
                            </SelectItem>
                          </>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Behaviours */}
                  <div className="mt-4">
                    <Label
                      htmlFor="behaviours"
                      className="text-sm font-medium text-[#020617]"
                    >
                      Behaviours
                    </Label>
                    <Select
                      value={behaviour !== 0 ? behaviour.toString() : undefined}
                      onValueChange={(value) => {
                        console.log("Selected behaviour ID:", value);
                        handleBehaviourChange(value);
                      }}
                    >
                      <SelectTrigger className="text-gray-500 mt-2 flex items-center justify-between px-3">
                        <SelectValue
                          className="text-[#64748B] text-sm font-normal"
                          placeholder={
                            campaignId ? updateBehaviour : "Select Behaviour"
                          }
                        />
                      </SelectTrigger>
                      {/* <SelectContent>
              <SelectItem value="onlineShopping" className="text-[#64748B] text-sm font-normal">Online Shopping</SelectItem>
              <SelectItem value="traveling" className="text-[#64748B] text-sm font-normal">Traveling</SelectItem>
            </SelectContent> */}

                      <SelectContent>
                        {behaviourList.map((behaviour) => (
                          <>
                            <SelectItem
                              className="text-[#64748B] text-sm font-normal"
                              key={behaviour.id}
                              value={behaviour.id.toString()}
                            >
                              {behaviour.behaviour}
                            </SelectItem>
                          </>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Device Selection */}
                  <div className="mt-4 mb-4 flex space-x-4">
                    <div className="flex-1">
                      <Label
                        htmlFor="device"
                        className="text-sm font-medium text-[#020617]"
                      >
                        Device
                      </Label>
                      <Select
                        value={osDevice !== 0 ? osDevice.toString() : undefined}
                        onValueChange={(value) => {
                          console.log("Selected OS Device ID:", value);
                          handleOsDeviceChange(value);
                        }}
                      >
                        <SelectTrigger className="text-gray-500 mt-2 flex items-center justify-between px-3">
                          <SelectValue
                            className="text-[#64748B] text-sm font-normal"
                            placeholder={
                              campaignId
                                ? updateOsDevice
                                : "Select operating system"
                            }
                            //placeholder="Select operating system"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {osList.map((os_device) => (
                            <>
                              <SelectItem
                                className="text-[#64748B] text-sm font-normal"
                                key={os_device.id}
                                value={os_device.id.toString()}
                              >
                                {os_device.os_device}
                              </SelectItem>
                            </>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Select
                        value={device !== 0 ? device.toString() : undefined}
                        onValueChange={(value) => {
                          console.log("Selected Device ID:", value);
                          console.log("ccurency:", currency);
                          handleDeviceChange(value);
                        }}
                      >
                        <SelectTrigger className="text-gray-500 mt-7 mr-6 flex items-center justify-between px-3">
                          <SelectValue
                            className="text-[#64748B] text-sm font-normal"
                            placeholder={
                              campaignId ? updateDevice : "Select device"
                            }
                            // placeholder="Select device"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {deviceList.map((device) => (
                            <>
                              <SelectItem
                                className="text-[#64748B] text-sm font-normal"
                                key={device.id}
                                value={device.id.toString()}
                              >
                                {device.device}
                              </SelectItem>
                            </>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
           ) : null}

            <Card className="w-[600px] mt-6 p-4 shadow-sm border border-gray-200">
              <div className="mt-2 text-left">
                <h3 className="text-base text-[#020617] font-semibold text-left">
                  Budget & schedule
                </h3>
                <div className="mt-4 flex gap-4">
                   {/* Budget Type Dropdown */}
                   <div className="flex-1">
                    <Label
                      htmlFor="budgetType"
                      className="text-sm font-normal text-[#020617]"
                    >
                      Budget type
                    </Label>
                    <Select
                      value={budgetType}
                      onValueChange={(value) => setBudgetType(value)}
                    >
                      <SelectTrigger className="mt-2 w-full border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring">
                        <SelectValue placeholder="Select budget type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily budget</SelectItem>
                        <SelectItem value="lifetime">Lifetime budget</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Budget Amount Input */}
                  <div className="flex-1">
                  <Label
                    htmlFor="campaignBudget"
                    className="text-sm font-medium text-[#020617]"
                  >
                    {budgetType === 'daily' ? 'Daily budget' : 'Lifetime budget'}
                  </Label>
                  <div className="relative mt-2">
                  <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring">
                  <span className="flex items-center text-gray-500">$</span>
                    <input
                      id="campaignBudget"
                      type="number"
                      value={campaignBudget}
                      placeholder="10.00"
                       className="w-full border-0 bg-transparent p-0 pl-1 focus:outline-none focus:ring-0"
                      onChange={handleCampaignBudgetChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      
                    />
                    <span className="text-[#64748B] text-sm font-normal">
                      {currencyData.length > 0
                        ? currencyData[0].currency_name
                        : "null"}
                    </span>
                  </div>
                  {budgetError && (
                    <p className="text-red-500 text-sm mt-1">{budgetError}</p>
                  )}
                 </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Label
                    htmlFor="campaignStartDate"
                    className=" mt-2 text-sm font-medium text-[#020617]"
                  >
                    Campaign start date
                  </Label>
                  <div className="relative mt-2 text-[#64748B] text-sm font-normal">
                    <input
                      id="campaignStartDate"
                      type="text"
                      value={campaignStartDate}
                      onChange={(e) => {
                        const input = e.target.value;
                        // Allow only numbers and `/`
                        if (/^[0-9/]*$/.test(input)) {
                          setCampaignStartDate(input);
                        }
                      }}
                      onFocus={handleFocus}
                      onBlur={() => {
                        if (!campaignStartDate.trim()) {
                          setStartDateError("Start date is required"); // Reset error if field is empty
                          return;
                        }
                          const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
                          if (!dateRegex.test(campaignStartDate)) {
                            setStartDateError("Invalid date format (dd/MM/yyyy required)");
                            return;
                          }

                          // Convert input to a Date object
                          const [day, month, year] = campaignStartDate.split("/").map(Number);
                          const dateValue = new Date(year, month - 1, day);

                        if (isNaN(dateValue.getTime())) {
                          setStartDateError("Invalid date format");
                          return;
                        }
                        handleStartDateChange(dateValue);

                      }}
                      placeholder="dd/mm/yyyy"
                      style={{ fontSize: "14px" }}
                      className="w-full p-2 border border-gray-300 rounded text-[#64748B] text-sm font-normal"
                    />                  
                    <Popover
                      open={isStartCalendarOpen}
                      onOpenChange={setStartCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <CalendarIcon className="text-gray-500" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          selected={
                            campaignStartDate
                              ? new Date(
                                  campaignStartDate
                                    .split("/")
                                    .reverse()
                                    .join("-")
                                )
                              : undefined
                          }
                          onSelect={(date) => {
                            if (!date) {
                              setStartDateError("Start date is required"); // Reset error when clearing the selection
                              return;
                            }
                            handleStartDateChange(date);
                           
                          }}
                        disabled={(date: Date) => isStartDateDisabled(date)} // Disable dates before today
                      />
                      </PopoverContent>
                    </Popover>
                    {startdateError && (
                      <p className="text-red-500 text-sm h-[20px]">{startdateError}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                <Label
                  htmlFor="campaignEndDate"
                  className="mt-2 text-sm font-medium text-[#020617]"
                >
                  Campaign end date
                </Label>
                <div className="relative mt-2 text-[#64748B] text-sm font-normal">
                  <input
                    id="campaignEndDate"
                    type="text"
                    value={campaignEndDate}
                    onChange={(e) => {
                      const input = e.target.value;
                      // Allow only numbers and `/`
                      if (/^[0-9/]*$/.test(input)) {
                        setCampaignEndDate(input);
                      }
                    }}
                    onFocus={handleFocus}
                    onBlur={() => {
                      if (!campaignEndDate.trim()) {
                        setEndDateError("End date is required"); // Reset error if field is empty
                        return;
                      }
                      const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
                      if (!dateRegex.test(campaignEndDate)) {
                        setEndDateError("Invalid date format (dd/MM/yyyy required)");
                        return;
                      }
                      const [day, month, year] = campaignEndDate.split("/").map(Number);
                      const dateValue = new Date(year, month - 1, day);

                      if (isNaN(dateValue.getTime())) {
                        setEndDateError("Invalid date format");
                        return;
                      }
                      handleEndDateChange(dateValue);
                    }}
                    placeholder="dd/mm/yyyy"
                    style={{ fontSize: "14px" }}
                    className="w-full p-2 border border-gray-300 rounded text-[#64748B] text-sm font-normal"
                  />
                  <Popover open={isEndCalendarOpen} onOpenChange={setEndCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <CalendarIcon className="text-gray-500" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={
                          campaignEndDate
                            ? new Date(campaignEndDate.split("/").reverse().join("-"))
                            : undefined
                        }
                        onSelect={(date) => {
                          if (!date) {
                            setEndDateError("End date is required"); // Reset error when clearing the selection
                            return;
                          }
                          handleEndDateChange(date);
                        }}
                        disabled={(date: Date) => isEndDateDisabled(date)} // Disable dates before start date
                      />
                    </PopoverContent>
                  </Popover>
                  {enddateError && (
                    <p className="text-red-500 text-sm h-[20px]">{enddateError}</p>
                  )}
                </div>
              </div>
              </div>
            </Card>
            <Card className="w-[600px] mt-6 mb-[100px] p-4 shadow-sm border border-gray-200">
              <div className="mt-2 text-left">
                <h3 className="text-base font-semibold text-gray-900"> Frequency & caps</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Control how your campaign messages are delivered to recipients
                </p>
                {/* Daily Recipient Percentage */}
                <div className="mt-4">
                  <Label htmlFor="dailyPercentage" className="text-sm font-medium text-gray-900">
                    Daily recipient limit
                  </Label>
                  <div className="mt-2 relative">
                    <Input
                      id="dailyPercentage"
                      type="number"
                      placeholder="25"
                      min="1"
                      max="100"
                      className="pr-12 text-gray-500"
                      value={dailyRecipientLimit}
                      onChange={handleDailyLimitChange}
                      onBlur={validateDailyLimit}
                      onFocus={() => setIsDailyLimitTouched(true)}
                    />
                    {dailyLimitError && <p className="text-red-500 text-sm mt-1">{dailyLimitError}</p>}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 text-sm">%</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Percentage of total recipients to message each day
                  </p>
                </div>

                {/* Message Frequency */}
                <div className="mt-6">
                  <Label className="text-sm font-medium text-gray-900">
                    Message frequency
                  </Label>
                  <div className="mt-2">
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select sending frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Every day</SelectItem>
                        <SelectItem value="2">Every 2 days</SelectItem>
                        <SelectItem value="3">Every 3 days</SelectItem>
                        <SelectItem value="7">Once a week</SelectItem>
                        <SelectItem value="14">Every 2 weeks</SelectItem>
                        <SelectItem value="30">Once a month</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-sm text-gray-500">
                      Define how often the campaign messages should be sent
                    </p>
                  </div>
                </div>

                {/* Message Queue Settings */}
                <div className="mt-6">
                  <Label className="text-sm font-medium text-gray-900">
                    Message delivery schedule
                  </Label>
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="sequential" />
                      <Label htmlFor="sequential" className="text-sm text-gray-600">
                        Enable sequential delivery
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="deduplication" defaultChecked />
                      <Label htmlFor="deduplication" className="text-sm text-gray-600">
                        Prevent duplicate messages
                      </Label>
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        Recommended
                      </span>
                    </div>
                  </div>
                </div>

                {/* Time Window */}
                <div className="mt-6">
                  <Label className="text-sm font-medium text-gray-900">
                    Delivery time window
                  </Label>
                  <div className="mt-2 flex gap-4">
                    <div className="flex-1">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Start time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00">09:00</SelectItem>
                          <SelectItem value="10:00">10:00</SelectItem>
                          <SelectItem value="11:00">11:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="End time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="17:00">17:00</SelectItem>
                          <SelectItem value="18:00">18:00</SelectItem>
                          <SelectItem value="19:00">19:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Messages will only be sent during this time window
                  </p>
                </div>
              </div>
            </Card>

          </div>
          <div className="mt-2 mb-8">
            <Card className="w-[420px] p-4 rounded-lg shadow-sm border border-gray-200">
              {/* Title */}
              <h3 className="text-md text-[#020617] font-semibold text-left">
                Audience size
              </h3>

              {/* Circular Progress Bar */}
              <div className="mt-10 flex flex-col items-center justify-center">
                <div className="w-[170px] h-[170px] relative flex items-center justify-center">
                  <CircularProgressbar
                    value={percentage}
                    styles={buildStyles({
                      textSize: "30px",
                      pathColor: "#007bff", // Blue progress color
                      textColor: "#1C2024", // Dark text color
                      trailColor: "#f0f0f0", // Light gray trail
                      strokeLinecap: "round", // Rounded progress bar edges
                    })}
                  />
                  {/* Dynamic Content Inside Progress Bar */}
                  <div className="flex flex-col items-center justify-center absolute">
                    <span className="text-[30px] font-bold text-[#1C2024]">
                      {selectedRecipients.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1 font-normal  text-[#64748B] text-[12px] mt-1">
                      <LuPlane className="text-[#64748B]" />
                      Recipients
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipients Count */}
              <div className="ml-4">
                <div className="mt-4 text-center text-[14px] space-x-8 text-[#1C2024] font-medium">
                  {selectedRecipients} out of {totalRecipients} total recipients
                </div>

                {/* Information Section */}
                <div className="flex pl-16 pr-16 items-start mt-4 pt-2">
                  {/* Icon */}
                  <FontAwesomeIcon
                    className="text-[#64748B] text-[10px] mt-[2px]"
                    icon={faArrowTrendUp}
                  />
                  {/* Description */}
                  <p className="text-[10px] font-medium text-[#64748B] text-left leading-relaxed">
                    The accuracy of estimates is based on factors such as past
                    campaign data, the budget you entered, market data,
                    targeting criteria, and channel numbers. These estimates are
                    provided to give you an idea of performance for your budget,
                    but are only estimates and don't guarantee results.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        </>
    )}
      </div>
    </>

  );
}
