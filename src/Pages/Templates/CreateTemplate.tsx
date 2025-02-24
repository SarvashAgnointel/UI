import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import { Button } from "../../Components/ui/button";
import Default_WhatsApp_background from "../../Assets/Default_WhatsApp_background.jpeg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../Components/ui/select";
import { Input } from "../../Components/ui/input";
import CloseIcon from "@mui/icons-material/Close";
import { Label } from "../../Components/ui/label";
import { Textarea } from "../../Components/ui/textarea";
import { FaTrash, FaTimes, FaFilePdf, FaFileWord } from "react-icons/fa";
import { FaPlus, FaCaretDown } from "react-icons/fa";
import CancelIcon from "@mui/icons-material/Cancel";
import { Add as AddIcon } from "@mui/icons-material";
import EmojiPicker from "emoji-picker-react";
import {
  Container,
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
//import { ToastContainer, toast } from "react-toastify";
import { toast, useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";
import { Value } from "@radix-ui/react-select";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import config from "../../config.json";
import {
  ChevronDownIcon,
  PlusIcon,
  InfoCircledIcon,
  FontBoldIcon,
  FontItalicIcon,
  CodeIcon,
} from "@radix-ui/react-icons";
import { useDispatch } from "react-redux";
import {
  setCreateBreadCrumb,
  setCreateTemplateLoading,
} from "../../State/slices/AdvertiserAccountSlice";
import { title } from "process";
import { Description } from "@radix-ui/react-toast";
import { CheckIcon } from "@radix-ui/react-icons";
import { Card } from "../../Components/ui/card";
import { RootState } from "../../State/store";
import { useSelector } from "react-redux";
import { text } from "stream/consumers";
import { Smile, Strikethrough } from "lucide-react";
import { Document, Page } from "react-pdf";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../Components/ui/dialog";
import { Root } from "react-dom/client";

interface BoxItem {
  action: string;
}

// Define the Country type
interface Language {
  language_id: number;
  language_name: string;
  language_code: string;
}

interface Country {
  country_id: number;
  country_code: number;
  country_name: string;
  country_shortname: string;
}

interface TemplatePlatform {
  platform_id: number;
  platform_name: string;
}

interface GetButtonTypeList {
  button_id: number;
  button_type: string;
}

interface Template {
  template_id: number;
  template_name: string;
}

interface Content {
  content_id: number;
  content_name: string;
}
interface RowData {
  buttonType: string;
  buttonText: string;
  buttonTypeDropdown: string;
  websiteUrl: string;
  countryCode: string;
  callPhoneNumber: string;
  copyOfferCode: string;
}

// interface GetButtonType {
//   button_id: number;
//   button_type: string;
// }

interface Channel {
  channel_id: number;
  channel_name: string;
}

const textAreaIcon = () => {
  return (
    <div className="relative w-8 h-8 flex justify-center items-center">
      <div
        className="absolute rounded w-[3px] h-8 transform rotate-45"
        style={{ borderLeft: "3px solid #64748B" }}
      />
      <div
        className="absolute w-[3px] h-4 rounded transform rotate-45 translate-x-2 translate-y-2"
        style={{ borderLeft: "3px solid #64748B" }}
      />
    </div>
  );
};

const CreateTemplate: React.FC = () => {
  // const [isLoading, setIsLoading] = useState(true);
  const isLoading = useSelector(
    (state: RootState) => state.advertiserAccount.create_template_is_loading
  );
  const navigate = useNavigate();
  const location = useLocation();
  const templateId = location.state?.templateId || "";

  const [platform, setPlatform] = useState("");
  const [templatePlatform, setTemplatePlatform] = useState<TemplatePlatform[]>(
    []
  );
  const [languageList, setLanguageList] = useState<Language[]>([]);
  const [countryList, setCountryList] = useState<Country[]>([]);
  const [language, setLanguage] = useState("en");
  const [Content, setContent] = useState("");
  const [ContentList, setContentList] = useState<Content[]>([]);
  const [buttonType, setButtonType] = useState("");
  const [buttonList, setButtonList] = useState<GetButtonTypeList[]>([]);
  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");
  let HeaderSelectedOption = "";
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState<string>("");
  let headerText = "";
  const [headerType, setHeaderType] = useState<string>("");
  const [updateHeaderType, setUpdateHeaderType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [bodyText, setBodyText] = useState<string>("");
  const [FooterText, setFooterText] = useState<string>("");
  const [buttonT, setButtonT] = useState<number>(0);
  const [templatePreview, setTemplatePreview] = useState<string>("");
  const [buttonData, setButtonData] = useState<{
    buttonText: string;
    websiteUrl: string;
  }>({
    buttonText: "",
    websiteUrl: "",
  });
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  let ButtonSelectedAction = "";
  const [buttonTypeDropdown, setButtonTypeDropdown] =
    useState<string>("static");
  const [buttonText, setButtonText] = useState<string>("");
  const [websiteUrl, setWebsiteUrl] = useState<string>("");
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [channelList, setChannelList] = useState<Channel[]>([]); // State for the channel list
  const [channel, setChannel] = useState("");
  const [templateType, setTemplateType] = useState("");

  const [updateplatform, setUpdatePlatform] = useState("");
  const [updateLanguage, setUpdateLanguage] = useState("");
  const [updateButtonType, setUpdateButtonType] = useState("");
  const [updateContentList, setUpdatedContentList] = useState("");
  const [updateTemplateList, setUpdatedTemplateList] = useState("");
  const [updateChannel, setUpdateChannel] = useState("");
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [whatsappApiUrl, setWhatsappApiUrl] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [PlatformNameError, setPlatformNameError] = useState<string | null>(
    null
  );
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [LanguageError, setLanguageError] = useState<string | null>(null);
  const [channelError, setChannelError] = useState<string | null>(null);
  const [BodyError, setBodyError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFileInput, setShowFileInput] = useState(true);

  const [rows, setRows] = useState<RowData[]>([]);
  const [warning, setWarning] = useState("");
  const [selectedButtonIds, setSelectedButtonIds] = useState<string[]>([]);
  const [websiteUrls, setWebsiteUrls] = useState<string[]>([]);
  const buttonTypeArray = selectedButtonIds; // Selected button IDs
  const buttonTextArray = rows.map((row) => row.buttonText);
  const Url = rows.map((row) => row.websiteUrl);
  const phoneNumber = rows.map((row) => row.callPhoneNumber);
  const phoneNumberCode = rows.map((row) => row.countryCode);
  const copyOfferCode = rows.map((row) => row.copyOfferCode);
  const currentDate = new Date().toISOString();
  const [fileName, setFileName] = useState("");
  const maxLength = 60;
  const [fileLength, setFileLength] = useState("");
  const [fileType, setFileType] = useState("");
  const [headerHandle, setHeaderHandle] = useState("");
  const [mediaBase64, setMediaBase64] = useState("");
  const [inputStr, setInputStr] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isFixed, setIsFixed] = useState(true);
  const [smsData, setSmsData] = useState({
    length7Bit: 0,
    lengthUnicode: 0,
    parts7Bit: 1,
    partsUnicode: 1,
    totalParts: 1,
    messageLength: 0,
  });
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const EmailId = useSelector(
    (state: RootState) => state.authentication.userEmail
  );

  useEffect(() => {
    // setIsLoading(true);
    dispatch(setCreateTemplateLoading(true));
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdvAcc(config.ApiUrlAdvAcc);
        setWhatsappApiUrl(config.WhatsApp);
        console.log("whatsapp : " + whatsappApiUrl);
      } catch (error) {
        console.error("Error isLoading config:", error);
      }
    };
    fetchConfig();
    // setIsLoading(false);
    dispatch(setCreateTemplateLoading(false));
  }, []);

  const handleRowInputChange = (
    index: number,
    field: keyof RowData,
    value: string
  ) => {
    const updatedRows = [...rows];
    console.log(`Field: ${field}, Value: ${value}`);

    // Update the specified field
    updatedRows[index] = { ...updatedRows[index], [field]: value };

    if (field === "buttonType") {
      const selectedButton = buttonList.find(
        (button) => button.button_type === value
      );
      if (selectedButton) {
        updatedRows[index].buttonType = selectedButton.button_type;

        // Update the selectedButtonIds array
        const updatedButtonIds = [...selectedButtonIds];
        updatedButtonIds[index] = selectedButton.button_type; // Store the button_type for the row
        setSelectedButtonIds(updatedButtonIds);
      } else {
        updatedRows[index].buttonType = "No buttons are selected";

        // Reset the button_type for this row if no valid selection
        const updatedButtonIds = [...selectedButtonIds];
        updatedButtonIds[index] = "Visit website"; // Or any default value
        setSelectedButtonIds(updatedButtonIds);
      }
    }

    if (field === "websiteUrl") {
      updatedRows[index].websiteUrl = value;
      console.log(`Website URL for row ${index}: ${value}`);
    }

    setRows(updatedRows);
  };

  const handleAddRow = () => {
    if (rows.length >= 3) {
      setWarning("You can only add up to 3 buttons.");
    } else {
      setRows([
        ...rows,
        {
          buttonType: "",
          buttonText: "",
          buttonTypeDropdown: "static",
          websiteUrl: "",
          countryCode: "",
          callPhoneNumber: "",
          copyOfferCode: "",
        },
      ]);

      // Add a default value (e.g., 0) to the selectedButtonIds array
      setSelectedButtonIds([...selectedButtonIds, "Visit website"]);

      setWarning("");
    }
  };

  const onDeleteRow = (row: any, index: number) => {
    // Create a copy of rows
    const updatedRows = [...rows];

    // Remove the row at the specified index
    updatedRows.splice(index, 1);

    // Update the rows state
    setRows(updatedRows);

    // Remove the corresponding entry in selectedButtonIds
    const updatedButtonIds = [...selectedButtonIds];
    updatedButtonIds.splice(index, 1);
    setSelectedButtonIds(updatedButtonIds);

    // Clear any warnings if present
    if (updatedRows.length < 3) {
      setWarning(""); // Reset warning
    }
  };

  const handleActionChange = (index: number, value: string) => {
    handleRowInputChange(index, "buttonType", value);
    setSelectedAction(value); // Set the selected action
  };

  const onEmojiClick = (emojiObject: any) => {
    setBodyText((prevBodyText) => prevBodyText + emojiObject.emoji);
    setShowPicker(false);
  };

  useEffect(() => {
    const checkHeight = () => {
      if (previewRef.current) {
        const height = previewRef.current.clientHeight; // Get the height of the preview
        if (height > window.innerHeight * 0.81) {
          setIsFixed(false); // Switch to 'relative' position if content exceeds 81% of window height
        } else {
          setIsFixed(true); // Keep 'fixed' position if content is small
        }
      }
    };

    // Initial check and event listener for resizing
    checkHeight();
    window.addEventListener("resize", checkHeight); // Listen to resize events

    return () => {
      window.removeEventListener("resize", checkHeight); // Cleanup event listener
    };
  }, [bodyText]); // Trigger this effect when bodyText changes

  const positionClass = isFixed ? "fixed" : "";

  const getLanguageList = async () => {
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetLanguageList`);

      // Assuming the response data contains a 'CountryList' field as discussed earlier
      if (response.data && response.data.languageList) {
        setLanguageList(response.data.languageList);
        console.log("Language List : ", response.data.languageList);
      } else {
        console.log("No Language list available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching Language list:", error);
    } finally {
    }
  };

  const getCountryList = async () => {
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetCountryDetails`);

      // Assuming the response data contains a 'CountryList' field as discussed earlier
      if (response.data && response.data.countryDetails) {
        setCountryList(response.data.countryDetails);
        console.log("Country List : ", response.data.countryDetails);
      } else {
        console.log("No Country list available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching Country list:", error);
    } finally {
    }
  };

  const getTemplatePlatform = async () => {
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetTemplatePlatform`);
      if (response.data && response.data.templatePlatform) {
        setTemplatePlatform(response.data.templatePlatform);
        console.log("Template Platform : ", response.data.templatePlatform);
      } else {
        console.log("No Template Platdform available in response.");
      }
    } catch (error) {
      console.error("Error fetching Template Platform:", error);
    } finally {
    }
  };

  const getbuttonType = async () => {
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetButtonType`);
      if (response.data && response.data.buttonType) {
        setButtonList(response.data.buttonType);
        console.log("ButtonType List : ", response.data.buttonType);
      } else {
        console.log("No Button Type available in response.");
      }
    } catch (error) {
      console.error("Error fetching Button Type:", error);
    } finally {
    }
  };

  const getContentType = async () => {
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetContentList`);

      if (response.data && response.data.contentList) {
        setContentList(response.data.contentList);
        console.log("ContentType : ", response.data.contentList);
      } else {
        console.log("No Content Type available in response.");
      }
    } catch (error) {
      console.error("Error fetching Content Type:", error);
    } finally {
    }
  };

  const getChannelList = async () => {
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

  const toLowerCase = (str: string): string => {
    return str
      .toLowerCase() // Convert to lowercase
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      ) // Capitalize letters except the first
      .replace(/\s+/g, ""); // Remove spaces
  };

  // Utility function to convert a string to camel case
  const toCamelCase = (str: string): string => {
    return str
      .toLowerCase() // Convert the entire string to lowercase first
      .replace(
        /([-_][a-z])/g,
        (match) => match.toUpperCase().replace(/[-_]/g, "") // Capitalize after '-' or '_'
      )
      .replace(/^\w/, (match) => match.toUpperCase()); // Capitalize the first character
  };

  const base64ToFile = (
    base64: string,
    fileName: string,
    mime: string
  ): File => {
    // Split the base64 string to get the data
    const arr = base64.split(",");
    const byteString = atob(arr[1]);

    // Create a byte array
    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }

    // Create a File object
    return new File([byteArray], fileName, { type: mime });
  };

  const simulateFileChangeEvent = (
    file: File
  ): React.ChangeEvent<HTMLInputElement> => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    const input = document.createElement("input");
    input.type = "file";
    input.files = dataTransfer.files;

    return {
      target: input,
      currentTarget: input,
      bubbles: false,
      cancelable: false,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: true,
      nativeEvent: {} as Event,
      preventDefault: () => {},
      stopPropagation: () => {},
      persist: () => {},
      timeStamp: Date.now(),
      type: "change",
    } as unknown as React.ChangeEvent<HTMLInputElement>;
  };

  const loadTemplateList = async (id: any) => {
    console.log("templateId API::", id);

    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetMetaTemplateDetailsById?template_id=` + id
      );
      console.log(
        "response.data.templateDetails:" + response.data.templateDetails
      );
      if (response.data && response.data.templateDetails) {
        const templateDetailslocal = response.data.templateDetails[0];

        console.log("Template List By Id:", templateDetailslocal);
        const components = JSON.parse(templateDetailslocal.components);
        console.log("Components : " + JSON.stringify(components));

        setTemplateName(templateDetailslocal.template_name);
        setUpdateChannel(templateDetailslocal.channel_type);
        setUpdateLanguage(templateDetailslocal.language);
        setChannel(templateDetailslocal.channel_id);
        debugger;

        if (templateDetailslocal.channel_id === 2) {
          const body = components.find(
            (item: { type: string }) => item.type === "BODY"
          );
          if (body) {
            setBodyText(body.text);
            console.log("Body Text :" + body.text);
          }
        }

        const header = components.find(
          (item: { type: string }) => item.type === "HEADER"
        );
        if (header && header.format) {
          debugger;
          HeaderSelectedOption = toLowerCase(header.format);
          setSelectedOption(toLowerCase(header.format));
          setUpdateHeaderType(toCamelCase(header.format));

          if (header.format == "TEXT") {
            setTextInput(header.text);
            headerText = header.text;
            console.log("Header Text : " + textInput);
          }
          if (
            header.format === "IMAGE" ||
            header.format === "VIDEO" ||
            header.format === "DOCUMENT"
          ) {
            debugger;
            console.log("Header Format: " + selectedOption);

            const formatToMime = {
              IMAGE: { mime: "image/png", extension: ".png" },
              VIDEO: { mime: "video/mp4", extension: ".mp4" },
              DOCUMENT: { mime: "application/pdf", extension: ".pdf" },
            };

            const formatDetails =
              formatToMime[header.format as keyof typeof formatToMime];
            const base64String = templateDetailslocal.mediaBase64;
            const fileName = `uploaded_file${formatDetails.extension}`;

            const file = base64ToFile(
              base64String,
              fileName,
              formatDetails.mime
            );

            const event = simulateFileChangeEvent(file);

            handleFileChange(event);
          }
        }
        const body = components.find(
          (item: { type: string }) => item.type === "BODY"
        );

        if (body) {
          setBodyText(body.text);
          console.log("Body Text :" + body.text);

          // Check if body.example.body_text exists and has content
          if (
            body.example &&
            body.example.body_text &&
            body.example.body_text.length > 0
          ) {
            const transformedData: BoxItem[] = body.example.body_text.map(
              (text: string) => ({ action: text })
            );

            setBoxes(transformedData);

            console.log("Body text variable : " + body.example.body_text);
          } else {
            console.log("No example body_text available.");
          }
        }

        const footer = components.find(
          (item: { type: string }) => item.type === "FOOTER"
        );

        if (footer) {
          setFooterText(footer.text);
          console.log("Footer Text :" + footer.text);
        }

        const buttons = components.find(
          (item: { type: string }) => item.type === "BUTTONS"
        );

        if (buttons) {
          console.log("Button values :" + buttons.buttons.length);
          const updatedRows = [...rows];
          const updatedButtonIds = [...selectedButtonIds]; // Create a new array to store button IDs
          buttons.buttons.forEach((button: any, i: number) => {
            if (button.type === "URL") {
              console.log("Button type : " + button.type);
              updatedRows[i] = {
                buttonType: "View Website",
                buttonText: button.text,
                websiteUrl: button.url,
                buttonTypeDropdown: "static",
                countryCode: "",
                callPhoneNumber: "",
                copyOfferCode: "",
              };
              updatedButtonIds[i] = "View Website"; // Update buttonType in selectedButtonIds
            } else if (button.type === "PHONE_NUMBER") {
              console.log("Button type : " + button.type);

              // Extract country code and phone number using regex
              const phoneNumberMatch =
                button.phone_number.match(/^(\+\d{1,2})(\d+)$/); // Match +countryCode and the rest of the number

              let countryCode = "";
              let callPhoneNumber = "";

              if (phoneNumberMatch) {
                countryCode = phoneNumberMatch[1].replace("+", ""); // Remove '+' sign, e.g., +91 -> 91
                callPhoneNumber = phoneNumberMatch[2]; // Get the remaining number
              }

              // Update row values
              updatedRows[i] = {
                buttonType: "Call Phone Number",
                buttonText: button.text,
                websiteUrl: "",
                buttonTypeDropdown: "static",
                countryCode: countryCode, // Assign extracted country code
                callPhoneNumber: callPhoneNumber, // Assign extracted phone number
                copyOfferCode: "",
              };

              // Update buttonType in selectedButtonIds
              updatedButtonIds[i] = "Call Phone Number";

              console.log("Country Code:", countryCode);
              console.log("Call Phone Number:", callPhoneNumber);
            }
            if (button.type === "COPY_CODE") {
              console.log("Button type : " + button.type);
              updatedRows[i] = {
                buttonType: "Copy Offer Code",
                buttonText: button.text,
                websiteUrl: "",
                buttonTypeDropdown: "",
                countryCode: "",
                callPhoneNumber: "",
                copyOfferCode: button.example[0],
              };
              updatedButtonIds[i] = "Copy Offer Code"; // Update buttonType in selectedButtonIds
            }
          });
          setRows(() => updatedRows);
          setSelectedButtonIds(updatedButtonIds); // Update selectedButtonIds state
          console.log("Updated Rows : ", updatedRows);
          console.log("Updated Button IDs : ", updatedButtonIds);
        }
      } else {
        console.log("No Templates details available in response.");
      }
    } catch (error) {
      console.error("Error fetching template details:", error);
    } finally {
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      //setIsLoading(true);
      dispatch(setCreateTemplateLoading(true));
      try {
        if (apiUrlAdvAcc) {
          await getTemplatePlatform(); // Ensure the channel list is loaded first
          if (templateId) {
            await loadTemplateList(templateId); // Load templates based on templateId
          }
          await Promise.all([
            getLanguageList(),
            getbuttonType(),
            getContentType(),
            getChannelList(),
            getCountryList(),
          ]);
          // updateTemplatePreview(); // Call to update the preview after isLoading data
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      //setIsLoading(false);
      dispatch(setCreateTemplateLoading(false));
    };

    fetchData();
  }, [apiUrlAdvAcc, templateId]); // Depend on apiUrlAdvAcc and templateId

  const validatePlatformName = () => {
    if (!platform && !updateplatform) {
      setPlatformNameError("Platform Name is required");
      return false;
    }
    setPlatformNameError(null);
    return true;
  };

  const validateTemplateName = (newTemplateName: string) => {
    debugger;
    const regex = /^[a-z]+[a-z0-9_]*$/;

    if (!newTemplateName.trim()) {
      setTemplateError("Template Name is Required");
      return false;
    }

    if (!regex.test(newTemplateName)) {
      setTemplateError(
        "Invalid Template Name. Use lowercase letters, underscore (_), and numbers only after alphabets."
      );
      return false;
    }

    setTemplateError(null); // Clear error when valid
    return true;
  };

  const validateLanguage = () => {
    debugger;
    if (!language && !updateLanguage) {
      setLanguageError("Please select a Language");
      return false;
    }
    setLanguageError(null);
    return true;
  };

  const validateChannel = (channel: any) => {
    debugger;
    if (!channel && !updateChannel) {
      setChannelError("Please select a channel");
      return false;
    }
    setChannelError(null);
    return true;
  };

  const validateBody = () => {
    debugger;
    if (!bodyText.trim()) {
      setBodyError("Please enter body text");
      return false;
    }
    setBodyError(null);
    return true;
  };

  const handleEdit = async () => {
    debugger;
    //setIsLoading(true);
    dispatch(setCreateTemplateLoading(true));
    console.log("buttonType:", buttonType);

    const selectedplatform = templatePlatform.find(
      (findPlatform) => findPlatform.platform_name === updateplatform
    );
    const updatePlatformId = selectedplatform
      ? selectedplatform.platform_id
      : null;

    const selectedLanguage = languageList.find(
      (findLanguage) => findLanguage.language_name === updateLanguage
    );
    const updateLanguageId = selectedLanguage
      ? selectedLanguage.language_id
      : null;

    const selectedButtonType = buttonList.find(
      (findButtonType) =>
        findButtonType.button_id === parseInt(updateButtonType)
    );
    // const updateButtonId = selectedButtonType ? selectedButtonType.button_id : null;
    const updateButtonId = selectedButtonType
      ? String(selectedButtonType.button_id)
      : null;

    const selectedContentType = ContentList.find(
      (findContentType) => findContentType.content_name === updateContentList
    );
    const updateContentId = selectedContentType
      ? selectedContentType.content_id
      : null;

    const selectedTemplateType = templateList.find(
      (findTemplateType) =>
        findTemplateType.template_name === updateTemplateList
    );
    const updateTemplateId = selectedTemplateType
      ? selectedTemplateType.template_id
      : null;

    const selectedChannel = channelList.find(
      (findchannel) => findchannel.channel_name === updateChannel
    );
    const updateChannelId = selectedChannel ? selectedChannel.channel_id : null;

    console.log("platform:", platform, "updatePlatformId:", updatePlatformId);
    console.log("language:", language, "updateLanguageId::", updateLanguageId);
    console.log("buttonType:", buttonType, "updateButtonId::", updateButtonId);
    console.log(
      "TemplatType:",
      templateType,
      "updateTemplateId::",
      updateTemplateId
    );

    if (
      // !validatePlatformName() ||
      // !validateTemplateName() ||
      // !validateLanguage() ||
      // !validateChannel() ||
      !validateBody()
    ) {
      // If validation fails, do not submit
      return;
    }

    try {
      let combinedActions: any[] = [];

      for (let box of boxes) {
        combinedActions.push(box.action);
      }

      const combinedData: any = {
        components: [],
      };

      if (updateHeaderType) {
        const format = headerType
          ? headerType.toUpperCase() // Use headerType if it has a value
          : updateHeaderType.toUpperCase(); // Fallback to updateHeaderType

        const headerComponent: {
          type: string;
          format: string;
          text?: string;
          example?: { header_handle: string[] }; // Make `text` optional since it's conditionally added
        } = {
          type: "HEADER",
          format: format,
        };

        // Conditionally handle different types
        if (format === "TEXT" && textInput) {
          headerComponent.text = textInput ? textInput : headerText; // Add `text` if the format is 'TEXT'
        } else if (["IMAGE", "VIDEO", "DOCUMENT"].includes(format)) {
          headerComponent.example = { header_handle: [headerHandle] }; // Handle example for other formats
        }

        // Push the headerComponent into combinedData
        combinedData.components.push(headerComponent);
      }

      if (bodyText) {
        const bodyComponent: any = {
          type: "body",
          text: bodyText,
        };

        if (combinedActions && combinedActions.length > 0) {
          bodyComponent.example = {
            body_text: combinedActions, // Pass it directly without extra brackets
          };
        }

        combinedData.components.push(bodyComponent);
      }

      if (FooterText) {
        combinedData.components.push({
          type: "FOOTER",
          text: FooterText,
        });
      }

      debugger;

      // Check if buttonTypeArray exists and is not empty
      if (buttonTypeArray && buttonTypeArray.length > 0) {
        let buttonsComponent = combinedData.components.find(
          (component: any) => component.type === "BUTTONS"
        );

        if (!buttonsComponent) {
          buttonsComponent = {
            type: "BUTTONS",
            buttons: [],
          };
          combinedData.components.push(buttonsComponent); // Push BUTTONS component only if buttons exist
        }

        // Loop through buttonTypeArray to add buttons
        for (let index = 0; index < buttonTypeArray.length; index++) {
          if (buttonTypeArray[index] === "View Website") {
            const button = {
              type: "URL",
              text: buttonTextArray[index], // Use the corresponding text from buttonTextArray
              url: Url[index], // Use the corresponding URL from Url array
            };

            console.log("Adding button:", button); // Debugging output

            // Add the button to the BUTTONS component
            buttonsComponent.buttons.push(button);
          }
          if (buttonTypeArray[index] === "Call Phone Number") {
            const button = {
              type: "PHONE_NUMBER",
              text: buttonTextArray[index],
              phone_number: phoneNumberCode[index] + phoneNumber[index], // Use the corresponding text from buttonTextArray
              // Use the corresponding URL from Url array
            };

            console.log("Adding button:", button); // Debugging output

            // Add the button to the BUTTONS component
            buttonsComponent.buttons.push(button);
          }
          if (buttonTypeArray[index] === "Copy Offer Code") {
            const button = {
              type: "COPY_CODE",
              example: copyOfferCode[index],
            };
            console.log("Adding button:", button); // Debugging output

            // Add the button to the BUTTONS component
            buttonsComponent.buttons.push(button);
          }
        }
      }

      console.log("data2:", JSON.stringify(combinedData, null, 2));
      debugger; // Output the final data2 object

      console.log("data2 :" + combinedData);

      console.log("Payload being sent:", JSON.stringify(combinedData));

      const jsonString = JSON.stringify(combinedData, null, 2);

      const payload: any = {
        templateId: templateId,
        components: jsonString,
        workspaceId: workspaceId,
        mediaBase64: mediaBase64,
      };

      const response = await axios.put(
        `${apiUrlAdvAcc}/EditMessageTemplate?TemplateId=${templateId}`,
        payload
      );

      if (response.data.status === "Success") {
        const Close = () => {
          //setIsLoading(false);
          dispatch(setCreateTemplateLoading(false));
          navigate("/navbar/TemplateList");
        };
        Close();
        toast.toast({
          title: "Success",
          description: "The Template details were updated successfully",
        });
      } else {
        console.error("Upload failed:", response.data.Status_Description);
        toast.toast({
          title: "Error",
          description: "An error occurred while updating the Template details",
        });

        setTimeout(() => {
          /* wait for 1 second */
        }, 1000);
      }
    } catch (e) {
      //setIsLoading(false);
      dispatch(setCreateTemplateLoading(false));
      console.error("Error in submitting form", e);
    }
  };

  // List of special characters that require escape sequences in 7-bit encoding
  const escapeSequenceChars = ["|", "~", "^", "{", "}", "\\", "€", "©"];

  // Function to detect if the character is Unicode (non-ASCII)
  const isUnicode = (char: string) => {
    return /[^\x00-\x7F]/.test(char);
  };

  // Function to calculate the message length considering encoding
  const calculateSMSParts = (text: string) => {
    const max7BitFirstPart = 160;
    const max7BitSubsequentParts = 153;
    const maxUnicode = 70;

    let length7Bit = 0;
    let lengthUnicode = 0;

    // Iterate over each character in the body text
    for (let char of text) {
      if (isUnicode(char)) {
        lengthUnicode += 1; // Unicode character (special character or emoji)
      } else {
        // If it's a 7-bit character, check if it requires escape sequence
        if (escapeSequenceChars.includes(char)) {
          length7Bit += 2; // Escape sequences count as 2 bytes
        } else {
          length7Bit += 1; // Normal 7-bit character (1 byte)
        }
      }
    }

    // Calculate parts based on encoding
    let parts7Bit = 0;
    let remaining7Bit = length7Bit;

    // Calculate parts for 7-bit encoding
    if (remaining7Bit > 0) {
      // First part can hold up to max7BitFirstPart characters
      parts7Bit = 1;
      remaining7Bit -= max7BitFirstPart;

      // If there are remaining characters, each subsequent part can hold max7BitSubsequentParts
      while (remaining7Bit > 0) {
        parts7Bit += 1;
        remaining7Bit -= max7BitSubsequentParts;
      }
    }

    // Calculate parts for Unicode encoding (this remains the same as previously)
    const partsUnicode = Math.ceil(lengthUnicode / maxUnicode);

    // Set the SMS data
    setSmsData({
      length7Bit,
      lengthUnicode,
      parts7Bit,
      partsUnicode,
      totalParts: Math.max(parts7Bit, partsUnicode), // We use the larger part count
      messageLength: text.length, // Total character count for the message
    });
  };

  const handleBodyTextChange = (text: string) => {
    setBodyText(text);
    if (Number(channel) === 2) {
      calculateSMSParts(text);
    }
    // Extract placeholders (e.g., {{1}}, {{2}}) from the text
    const placeholderRegex = /{{(\d+)}}/g;
    const matches = Array.from(text.matchAll(placeholderRegex));
    const detectedIndexes = matches.map((match) => parseInt(match[1], 10));

    // Update `boxes` to match the detected placeholders
    const newBoxes = [...boxes];
    detectedIndexes.forEach((index) => {
      if (!newBoxes[index - 1]) {
        newBoxes[index - 1] = { action: "" }; // Add missing box
      }
    });
    // Remove any extra boxes that are not in the body text
    const filteredBoxes = newBoxes.slice(0, Math.max(...detectedIndexes, 0));
    setBoxes(filteredBoxes);

    updateTemplatePreview(); // Update preview dynamically
  };

  const updatePreview = (text: string) => {
    const formattedText = text
      .replace(/\*(.*?)\*/g, "<b>$1</b>") // Bold
      .replace(/_(.*?)_/g, "<i>$1</i>") // Italics
      .replace(/~(.*?)~/g, "<del>$1</del>") // Strikethrough
      .replace(/`(.*?)`/g, "<code>$1</code>"); // Monospace

    setTemplatePreview(formattedText);
  };

  // Handle textarea input

  // Apply formatting (e.g., bold, italic) to selected text
  const applyFormatting = (symbol: string) => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Get selected text
      const selectedText = bodyText.substring(start, end);

      // Wrap the selected text with the symbol
      const formattedText = `${symbol}${selectedText}${symbol}`;
      const updatedText =
        bodyText.substring(0, start) + formattedText + bodyText.substring(end);

      setBodyText(updatedText); // Update text in textarea
      updatePreview(updatedText); // Update preview with formatting

      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = start + symbol.length;
        textarea.selectionEnd = end + symbol.length;
        textarea.focus();
      }, 0);
    }
  };

  const makeTextBold = () => applyFormatting("*");
  const makeTextItalic = () => applyFormatting("_");
  const makeTextStrikethrough = () => applyFormatting("~");
  const makeTextMonospace = () => applyFormatting("```");

  const addVariable = () => {
    const newPlaceholder = `{{${boxes.length + 1}}}`;
    setBodyText(bodyText + ` ${newPlaceholder}`);
    setBoxes([...boxes, { action: "" }]);
  };

  const updateButtonAction = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newBoxes = boxes.slice();
    newBoxes[index].action = event.target.value;
    setBoxes(newBoxes);
    updateTemplatePreview();
  };

  const onTextboxDelete = (index: number) => {
    const newBoxes = boxes.filter((_, i) => i !== index);
    let updatedBodyText = bodyText;
    const placeholderToRemove = `{{${index + 1}}}`;
    updatedBodyText = updatedBodyText.replace(placeholderToRemove, "").trim();

    for (let i = index + 1; i <= boxes.length; i++) {
      const oldPlaceholder = `{{${i + 1}}}`;
      const newPlaceholder = `{{${i}}}`;
      updatedBodyText = updatedBodyText.replace(
        new RegExp(`\\{\\{${i + 1}\\}\\}`, "g"),
        newPlaceholder
      );
    }

    setBoxes(newBoxes);
    setBodyText(updatedBodyText);
    updateTemplatePreview();
  };

  useEffect(() => {
    updateTemplatePreview();
  }, [
    bodyText,
    boxes,
    FooterText,
    file,
    headerType,
    buttonData,
    buttonText,
    websiteUrl,
  ]);

  const updateTemplatePreview = () => {
    let updatedText = bodyText
      // Match *text* for bold and replace with <b>text</b>
      .replace(/\*(.*?)\*/g, "<b>$1</b>") // Bold
      // Match _text_ for italic and replace with <i>text</i>
      .replace(/_(.*?)_/g, "<i>$1</i>") // Italics
      // Match ~text~ for strikethrough and replace with <del>text</del>
      .replace(/~(.*?)~/g, "<del>$1</del>") // Strikethrough
      // Match `text` for code formatting and replace with <code>text</code>
      .replace(/`(.*?)`/g, "<code>$1</code>"); // Monospace

    // Replace placeholders like {{1}}, {{2}} with actions from `boxes`
    const placeholderRegex = /{{(\d+)}}/g;
    updatedText = updatedText.replace(placeholderRegex, (match, p1) => {
      const index = parseInt(p1, 10) - 1; // Get the placeholder index
      // Replace with the corresponding action or keep the placeholder
      return boxes[index] && boxes[index].action ? boxes[index].action : match;
    });

    // Append footer if needed
    // updatedText += `\n\n${FooterText}`;

    // Update preview
    setTemplatePreview(updatedText);
  };

  const handleOptionChange = (value: string) => {
    // debugger
    setSelectedOption(value);
    setSelectedFile(null);
    setTextInput("");
    setHeaderType(value);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // debugger
  };

  const handleOptionChange1 = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHeaderType(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debugger;

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      console.log("File Name:", file.name);
      console.log("File Length (in bytes):", file.size);
      console.log("File Type:", file.type);

      if (isValidFile(file)) {
        setFileName(file.name);
        setFileLength(file.size.toString());
        setFileType(file.type);
        debugger;
        uploadMedia(file);
        setSelectedFile(file);
      } else {
        alert("Invalid file type selected.");
        setSelectedFile(null);

        // Clear the input value
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const getFileTypeMessage = () => {
    switch (selectedOption) {
      case "image":
        return "Choose JPG or PNG file.";
      case "video":
        return "Choose MP4 file.";
      case "document":
        return "Choose PDF.";
      default:
        return "";
    }
  };

  const isValidFile = (file: File) => {
    debugger;
    const fileType = file.type;

    if (selectedOption === "image" || HeaderSelectedOption === "image") {
      return fileType === "image/jpeg" || fileType === "image/png";
    }
    if (selectedOption === "video" || HeaderSelectedOption === "video") {
      return fileType.includes("video/");
    }
    if (selectedOption === "document" || HeaderSelectedOption === "document") {
      return fileType === "application/pdf"; // Allow only PDF
    }
    return false;
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    // Clear the input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle input change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
  };

  const handleFooterChange = (value: string) => {
    setFooterText(value); // Directly set the string value
  };

  const isFormValid = () => {
    return (
      templatePlatform &&
      templateList &&
      languageList &&
      headerType &&
      bodyText &&
      FooterText &&
      buttonType &&
      buttonText
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTemplateName = e.target.value;
    setTemplateName(newTemplateName); // Set the state with the new value

    // Validate the template name directly with the input value
    validateTemplateName(newTemplateName);
  };

  const resetForm = () => {
    setPlatform("");
    setTemplateName("");
    setTemplateType("");
    setLanguage("");
    setHeaderType("");
    setBodyText("");
    setFooterText("");
    setButtonType("");
    setButtonText("");
  };

  const uploadMedia = async (file: any) => {
    debugger;

    const formData = new FormData();
    formData.append("file_name", file.name);
    formData.append("file_length", file.size.toString()); // Convert number to string
    formData.append("file_type", file.type);
    formData.append("file", file); // Blob is fine here
    formData.append("workspace_id", workspaceId.toString()); // Convert number to string

    const response = await axios.post(`${apiUrlAdvAcc}/uploadfile`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Upload session response : " + response.data.h);
    setHeaderHandle(response.data.h);

    // Convert file to Base64 after success
    const convertToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); // Convert file to Base64
        reader.onload = () => resolve(reader.result as string); // Resolve with Base64 string
        reader.onerror = (error) => reject(error);
      });
    };

    // Call convertToBase64 and set the state
    const base64String = await convertToBase64(file);
    setMediaBase64(base64String);
  };

  const handleSMSTemplateSubmit = async () => {
    dispatch(setCreateTemplateLoading(true));
    if (
      !validateChannel(channel) ||
      !validateTemplateName(templateName) ||
      !validateLanguage() ||
      !validateBody()
    ) {
      // If validation fails, do not submit
      return;
    }

    const combinedData: any = {
      data2: {
        name: templateName,
        category: "UTILITY", // adjust based on your requirement
        allow_category_change: true,
        language: language,
        components: [
          {
            type: "BODY",
            text: bodyText,
          },
        ],
      },
      // mediaBase64: mediaBase64,
    };

    // if (bodyText) {
    //   const bodyComponent: any = {
    //     type: "body",
    //     text: bodyText,
    //   };
    //   // if (combinedActions && combinedActions.length > 0) {
    //   //   bodyComponent.example = {
    //   //     body_text: [combinedActions],
    //   //   };
    //   // }

    //   combinedData.data2.components.push(bodyComponent);
    // }
    debugger;
    console.log("sms data: ", smsData);
    try {
      const response = await axios.post(
        `${apiUrlAdvAcc}/CreateSMSMessageTemplate?channel_id=${channel}&workspace_id=${workspaceId}`,
        combinedData
      );
      const Close = () => {
        //setIsLoading(false);
        dispatch(setCreateTemplateLoading(false));
        dispatch(setCreateBreadCrumb(false));
        navigate("/navbar/TemplateList");
      };
      if (response.data.status === "Success") {
        resetForm();

        Close();

        toast.toast({
          title: "Success",
          description: "The template created successfully",
        });
      } else {
        console.error("Error in creating SMS Template");
        Close();

        toast.toast({
          title: "Error",
          description: "The template creation failed",
        });
      }
    } catch (error) {
      dispatch(setCreateBreadCrumb(false));
      navigate("/navbar/TemplateList");
      console.error("Exception occurred: ", error);

      toast.toast({
        title: "Error",
        description: "Something error while creating template",
      });
    }
  };

  const handleSubmit = async () => {
    debugger;
    //setIsLoading(true);
    dispatch(setCreateTemplateLoading(true));
    if (
      !validateChannel(channel) ||
      !validateTemplateName(templateName) ||
      !validateLanguage() ||
      !validateBody()
    ) {
      // If validation fails, do not submit
      return;
    }

    const data = {
      PlatformName: channel,
      TemplateName: templateName,
      TemplateLanguage: language,
      TemplateHeader: headerType,
      TemplateBody: bodyText,
      TemplateFooter: FooterText,
      Components: "String",
      ButtonType: JSON.stringify(buttonTypeArray),
      ButtonText: JSON.stringify(buttonTextArray),
      CreatedBy: 1,
      CreatedDate: currentDate,
      UpdateBy: 1,
      UpdatedDate: currentDate,
      Status: "Live",
      URLType: "",
      WebsiteURL: "",
      workspace_id: workspaceId,
    };
    // debugger
    console.log(data);

    let combinedActions: any[] = [];

    for (let box of boxes) {
      combinedActions.push(box.action);
    }

    const combinedData: any = {
      data2: {
        name: templateName,
        category: "UTILITY", // adjust based on your requirement
        allow_category_change: true,
        language: language,
        components: [],
      },
      mediaBase64: mediaBase64,
    };

    if (headerType) {
      const headerComponent: {
        type: string;
        format: string;
        text?: string;
        example?: { header_handle: string[] }; // Make text optional since it's conditionally added
      } = {
        type: "HEADER",
        format: headerType.toUpperCase(),
      };

      if (headerType === "text" && textInput) {
        headerComponent.text = textInput; // Conditionally add text only if headerType is 'text'
      } else if (headerType === "image") {
        debugger;
        headerComponent.example = { header_handle: [headerHandle] };
      } else if (headerType === "video") {
        headerComponent.example = { header_handle: [headerHandle] };
      } else if (headerType === "document") {
        headerComponent.example = { header_handle: [headerHandle] };
      }

      combinedData.data2.components.push(headerComponent);
    }

    if (bodyText) {
      const bodyComponent: any = {
        type: "body",
        text: bodyText,
      };

      if (combinedActions && combinedActions.length > 0) {
        bodyComponent.example = {
          body_text: [combinedActions],
        };
      }

      combinedData.data2.components.push(bodyComponent);
    }

    if (FooterText) {
      combinedData.data2.components.push({
        type: "FOOTER",
        text: FooterText,
      });
    }

    debugger;

    // Check if buttonTypeArray exists and is not empty
    if (buttonTypeArray && buttonTypeArray.length > 0) {
      let buttonsComponent = combinedData.data2.components.find(
        (component: any) => component.type === "BUTTONS"
      );

      if (!buttonsComponent) {
        buttonsComponent = {
          type: "BUTTONS",
          buttons: [],
        };
        combinedData.data2.components.push(buttonsComponent); // Push BUTTONS component only if buttons exist
      }

      // Loop through buttonTypeArray to add buttons
      for (let index = 0; index < buttonTypeArray.length; index++) {
        if (buttonTypeArray[index] === "View Website") {
          const button = {
            type: "URL",
            text: buttonTextArray[index], // Use the corresponding text from buttonTextArray
            url: Url[index], // Use the corresponding URL from Url array
          };

          console.log("Adding button:", button); // Debugging output

          // Add the button to the BUTTONS component
          buttonsComponent.buttons.push(button);
        }
        if (buttonTypeArray[index] === "Call Phone Number") {
          const button = {
            type: "PHONE_NUMBER",
            text: buttonTextArray[index],
            phone_number: phoneNumberCode[index] + phoneNumber[index], // Use the corresponding text from buttonTextArray
            // Use the corresponding URL from Url array
          };

          console.log("Adding button:", button); // Debugging output

          // Add the button to the BUTTONS component
          buttonsComponent.buttons.push(button);
        }
        if (buttonTypeArray[index] === "Copy Offer Code") {
          const button = {
            type: "COPY_CODE",
            example: copyOfferCode[index],
          };
          console.log("Adding button:", button); // Debugging output

          // Add the button to the BUTTONS component
          buttonsComponent.buttons.push(button);
        }
      }
    }

    console.log("data2:", JSON.stringify(combinedData.data2, null, 2));
    debugger; // Output the final data2 object

    console.log("data2 :" + combinedData);

    console.log("Payload being sent:", JSON.stringify(combinedData));

    debugger;
    //   try{
    //   const response = await axios.post(${apiUrlAdvAcc}/CreateTemplate, data);
    //   console.log("response:" , response)
    //   if (response.data.status === 'Success') {
    //     resetForm();
    //     const Close=()=>{
    //       dispatch(setCreateBreadCrumb(false));
    //       navigate('/navbar/TemplateList')
    //     }
    //     Close();
    //     toast.toast({
    //       title:"Success",
    //       description:"The template details saved successfully"
    //     })

    //   } else {
    //       console.error('Upload failed:', response.data.Status_Description);
    //       toast.toast({
    //         title:"Error",
    //         description:"An error occurred while saving the Template details"
    //       })

    //       setTimeout(() =>{/* wait for 1 second */},1000)
    //   }
    // }
    // catch(e){
    //   console.log('datas:', data);
    //   console.log("Error in submitting form");
    // }

    try {
      const response2 = await axios.post(
        `${apiUrlAdvAcc}/CreateMessageTemplate?workspaceId=${workspaceId}&channel_id=${channel}`,
        combinedData
      );
      const Close = () => {
        //setIsLoading(false);
        dispatch(setCreateTemplateLoading(false));
        dispatch(setCreateBreadCrumb(false));
        navigate("/navbar/TemplateList");
      };
      debugger;

      if (response2.status === 200) {
        if (response2.data.message === "Template name already exists.") {
          toast.toast({
            title: "Error",
            description: "Template already exists",
          });
          dispatch(setCreateTemplateLoading(false));

          return;
        }

        resetForm();

        Close();

        toast.toast({
          title: "Success",
          description: "The template created successfully",
        });
      } else {
        console.error(response2.data.message);
        Close();

        toast.toast({
          title: "Error",
          description: "The template creation failed",
        });
      }
    } catch (e: any) {
      //setIsLoading(false);

      dispatch(setCreateBreadCrumb(false));
      navigate("/navbar/TemplateList");
      console.error("Exception occurred: ", e);

      toast.toast({
        title: "Error",
        description: "Something error while creating template",
      });
    }
  };

  const handleDiscardClick = () => {
    setIsAlertOpen(true); // Open the alert dialog
  };

  const handleClose = () => {
    setIsAlertOpen(false);
  };

  const checkWhatsappAccount = async (value: any) => {
    debugger;
    if (value == 5) {
      try {
        //setIsLoading(true);
        dispatch(setCreateTemplateLoading(true));
        // Check token validity
        const response = await axios.get(
          `${apiUrlAdvAcc}/IsWhatsappTokenValid?workspaceId=${workspaceId}`
        );
        console.log("status: " + response.data.status);
        if (response.data.status === "Success") {
          console.log("Whatsapp business account connected");
          dispatch(setCreateTemplateLoading(false));
        } else {
          toast.toast({
            title: "Warning",
            description: "Please connect your WhatsApp business account",
          });
          //setIsLoading(false);
          dispatch(setCreateTemplateLoading(false));
          // Automatically navigate after a short delay to allow the user to read the toast
          setTimeout(() => {
            navigate("/navbar/channels");
          }, 1000); // Adjust the time (in milliseconds) for how long the toast stays
        }
      } catch (error) {
        console.error("Error checking token validity:", error);
        toast.toast({
          title: "Error",
          description: "An error occurred",
        });

        // You can add a timeout here as well, if necessary.
      }
    }
  };

  const renderPreview = () => {
    // Check if any content is available for the body or footer
    const isBodyEmpty = !bodyText?.trim();
    const isFooterEmpty = !FooterText?.trim();
    const isbuttonTextEmpty = !buttonText?.trim();
    const noContentSelected =
      !selectedOption &&
      !selectedFile &&
      isBodyEmpty &&
      isFooterEmpty &&
      rows.length === 0;

    return (
      <div
        className="flex rounded-[20px] flex-col justify-between w-full max-h-fit bottom-0"
        style={{
          backgroundImage: `url(${Default_WhatsApp_background})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        {noContentSelected ? (
          <div className="flex w-full h-[calc(100vh-200px)] items-center justify-center">
  <div className="text-center">
    <div>{textAreaIcon()}</div>
    <div className="mt-6">
      <p className="text-xl font-semibold">Mobile screen</p>
    </div>
    <div
      className="w-[125px] mt-2"
      style={{ fontWeight: 500, fontSize: "14px" }}
    >
      <p>Preview varies based on platform selection</p>
    </div>
  </div>
</div>

        ) : (
          <>
            {/* Image, Video, or Document Preview */}
            <div className="flex justify-center">
              {selectedOption === "image" && selectedFile && (
                <img
                  src={URL.createObjectURL(selectedFile!)}
                  alt="Preview"
                  className="w-[300px] h-[200px] mt-2 object-cover mx-auto"
                />
              )}
              {selectedOption === "video" && selectedFile && (
                <video
                  controls
                  className="w-[320px] h-[200px] object-cover mx-auto"
                >
                  <source src={URL.createObjectURL(selectedFile)} />
                </video>
              )}
              {selectedOption === "document" && selectedFile && (
                <div className="w-[320px] h-[200px] mx-auto border">
                  {selectedFile.type === "application/pdf" ? (
                    <iframe
                      src={URL.createObjectURL(selectedFile)}
                      className="w-full h-full no-scrollbar"
                      style={{
                        overflow: "hidden",
                        overflowX: "hidden",
                        overflowY: "hidden",
                      }}
                      title="PDF Preview"
                    />
                  ) : (
                    <p className="text-center text-gray-600 mt-8">
                      Cannot preview this document. Download:{" "}
                      <a
                        href={URL.createObjectURL(selectedFile)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        {selectedFile.name}
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Body Text */}
            <div className="flex-1  text-black w-full text-left">
              {selectedOption === "text" && textInput && (
                <p
                  className="w-full text-base font-sans p-2 font-bold"
                  style={{
                    whiteSpace: "pre-wrap", // Preserve newlines and spaces
                    wordWrap: "break-word", // Break long words
                  }}
                >
                  {textInput}
                </p>
              )}
              {!isBodyEmpty ? (
                <p
                  className="text-base font-sans p-2"
                  style={{
                    whiteSpace: "pre-wrap", // Preserve formatting
                    wordWrap: "break-word", // Handle long words
                  }}
                >
                  <div
                    className="w-full  rounded p-2  mt-4 min-h-fit"
                    dangerouslySetInnerHTML={{ __html: templatePreview }}
                  ></div>
                </p>
              ) : (
                <p className="text-base font-medium"></p>
              )}
            </div>

            {/* Footer Text */}
            <div className="border-t mt-2 pt-2 text-center">
              {!isFooterEmpty ? (
                <p
                  className="font-semibold text-black"
                  style={{ fontSize: "14px" }}
                >
                  {FooterText}
                </p>
              ) : (
                <p className="text-sm text-gray-500"></p>
              )}
            </div>

            {/* WebURL */}
            {/* <div className="border-t mt-2 pt-2 text-center">
            {!isbuttonTextEmpty ? (
              <p className="font-serif text-blue-400"><a href={websiteUrl} target="_blank" rel="noopener noreferrer">
              {buttonText}
            </a></p>
            ) : (
              <p className="text-sm text-gray-500"> </p>
            )}
          </div> */}

            {/* Buttons Preview */}

            <div className="border-t mt-2 pt-2 text-center">
              {rows.map((row, index) => (
                <p
                  key={index}
                  className="font-serif text-blue-400"
                  style={{ fontSize: "14px" }}
                >
                  <a
                    href={row.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {row.buttonText}
                    <div className="border-t mt-2"></div>
                  </a>
                </p>
              ))}
            </div>
            {/* <div className="border-t mt-2"></div> */}
          </>
        )}
      </div>
    );
  };

  const renderLabels = () => {
    if (selectedAction === "Call Phone Number") {
      return (
        <>
          <div className="w-[120px] pr-4 block text-sm font-medium ml-[2]">
            <label className="w-full font-bold text-center">
              Type of action
            </label>
          </div>
          <div className="w-[120px] pr-4 block text-sm font-medium">
            <label className="w-full ml-6 font-bold text-center">
              Button text
            </label>
          </div>
          <div className="w-[120px] pr-4 block text-sm font-medium">
            <label className="w-full ml-6 font-bold text-center">Country</label>
          </div>
          <div className="w-[120px] pr-4 block text-sm font-medium">
            <label className="w-full ml-4 font-bold text-center">
              Phonenumber
            </label>
          </div>
        </>
      );
    } else if (selectedAction === "Copy Offer Code") {
      // Labels for "Copy Offer Code"
      return (
        <>
          <div className="w-[120px] pr-4 block text-sm font-medium ml-[2]">
            <label className="w-full font-bold text-center">
              Type of action
            </label>
          </div>
          <div className="w-[120px] pr-4 block text-sm font-medium">
            <label className="w-full ml-6 font-bold text-center">
              Button text
            </label>
          </div>
          <div className="w-[120px] pr-4 block text-sm font-medium">
            <label className="w-full ml-6 font-bold text-center">
              Offer code
            </label>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="w-[120px] pr-4 block text-sm font-medium ml-[2]">
            <label className="w-full font-bold text-center">
              Type of action
            </label>
          </div>
          <div className="w-[120px] pr-4 block text-sm font-medium">
            <label className="w-full ml-6 font-bold text-center">
              Button text
            </label>
          </div>
          <div className="w-[120px] pr-4 block text-sm font-medium">
            <label className="w-full ml-6 font-bold text-center">
              URL type
            </label>
          </div>
          <div className="w-[120px] pr-4 block text-sm font-medium">
            <label className="w-full ml-4 font-bold text-center">
              Website URL
            </label>
          </div>
        </>
      );
    }
  };

  const renderRowFields = (row: RowData, index: number) => {
    switch (row.buttonType) {
      case "Call Phone Number":
        return (
          <div className="flex space-x-4">
            <div className="flex flex-col gap-2">
              <Label className="text-left">Button Text</Label>
              <Input
                value={row.buttonText}
                onChange={(e) => handleRowInputChange(index, "buttonText", e.target.value)}
                placeholder="Button text"
                className="w-[125px] h-[36px]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-left">Country Code</Label>
              <Select
                value={row.countryCode}
                onValueChange={(value) => handleRowInputChange(index, "countryCode", value)}
              >
                <SelectTrigger className="w-[125px] h-[36px]">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {countryList.map((country) => (
                    <SelectItem key={country.country_code} value={country.country_code.toString()}>
                      {`${country.country_shortname} +${country.country_code}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-left">Phone Number</Label>
              <Input
                value={row.callPhoneNumber}
                onChange={(e) => handleRowInputChange(index, "callPhoneNumber", e.target.value)}
                placeholder="Phone number"
                className="w-[120px] h-[36px]"
              />
            </div>
          </div>
        );
  
      case "Copy Offer Code":
        return (
          <div className="flex space-x-4">
            <div className="flex flex-col gap-2">
              <Label className="text-left">Button Text</Label>
              <Input
                value={row.buttonText}
                onChange={(e) => handleRowInputChange(index, "buttonText", e.target.value)}
                placeholder="Button text"
                className="w-[125px] h-[36px]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-left">Offer Code</Label>
              <Input
                value={row.copyOfferCode}
                onChange={(e) => handleRowInputChange(index, "copyOfferCode", e.target.value)}
                placeholder="Offer code"
                className="w-[220px] h-[36px]"
              />
            </div>
          </div>
        );
  
      default:
        return (
          <div className="flex space-x-4">
            <div className="flex flex-col gap-2">
              <Label className="text-left">Button Text</Label>
              <Input
                value={row.buttonText}
                onChange={(e) => handleRowInputChange(index, "buttonText", e.target.value)}
                placeholder="Button text"
                className="w-[125px] h-[36px]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-left">URL Type</Label>
              <Select
                value={row.buttonTypeDropdown}
                onValueChange={(value) => handleRowInputChange(index, "buttonTypeDropdown", value)}
              >
                <SelectTrigger className="w-[125px] h-[36px]">
                  <SelectValue placeholder="Static" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">Static</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-left">Website URL</Label>
              <Input
                value={row.websiteUrl}
                onChange={(e) => handleRowInputChange(index, "websiteUrl", e.target.value)}
                placeholder="Website URL"
                className="w-[120px] h-[36px]"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="overflow-y-auto">
      <Toaster />
      {isLoading && (
        <div className="loading-overlay">
          <CircularProgress color="primary" />
        </div>
      )} 
        <>
          <div className="fixed flex justify-end space-x-3 ml-[calc(70%-135px)] top-[-8px] z-20">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-[80px] border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  Discard
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogDescription>
                    Are you sure you want to discard this Template?
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="w-24">
                      Cancel
                    </Button>
                  </DialogClose>

                  <Button
                    className="w-24"
                    onClick={() => {
                      dispatch(setCreateBreadCrumb(false));
                      navigate("/navbar/templatelist");
                    }}
                    autoFocus
                  >
                    OK
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              className="w-fit"
              onClick={() => {
                debugger;
                if (templateId) {
                  handleEdit();
                } else {
                  if (Number(channel) === 2) {
                    handleSMSTemplateSubmit();
                  } else {
                    handleSubmit();
                  }
                }
                console.log("Clicked");
              }}
            >
              Save and exit
            </Button>
          </div>
          <div className="p-3 ">
            <div className=" flex flex-col md:flex-row gap-6 mb-[100px]">
              <div className="space-y-6 w-full md:w-3/5 ">
                <div className="border p-4 rounded-lg">
                  <h2
                    className="text-left mb-2"
                    style={{ fontWeight: 600, fontSize: "16px" }}
                  >
                    Platform
                  </h2>
                  <Select
                    value={channel}
                    onValueChange={(value) => {
                      console.log(
                        "Selected Channel ID:",
                        value + " channelId Type: " + typeof value
                      );
                      setChannel(value);
                      checkWhatsappAccount(value);
                      validateChannel(value);
                    }}
                  >
                    <SelectTrigger className="text-gray-500">
                      {" "}
                      {/* Apply gray text color to the trigger */}
                      <SelectValue
                        className="text-gray-500"
                        placeholder={
                          templateId
                            ? updateChannel
                            : "Select your Template channel"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {channelList
                        .filter(
                          (channel) =>
                            ["whatsapp", "sms"].includes(
                              channel.channel_name.toLowerCase()
                            ) // Filter both SMS & WhatsApp
                        )
                        .map((channel) => (
                          <SelectItem
                            className="text-gray-500 cursor-pointer"
                            key={channel.channel_id}
                            value={channel.channel_id as any}
                          >
                            {channel.channel_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {channelError && (
                    <p className="text-red-500 text-xs text-left mt-2 ml-2">
                      {channelError}
                    </p>
                  )}
                </div>
                <Card className="border w-full p-4 rounded-lg text-left">
                  <h2
                    className="text-lg text-left mb-2"
                    style={{ fontWeight: 600, fontSize: "16px" }}
                  >
                    Template name and language
                  </h2>
                  <div className="flex items-center space-x-4 mt-2">
                    {/* Template Column */}
                    <div className="flex-grow">
                      <Label htmlFor="template" className="mt-2 text-left">
                        Template
                      </Label>
                      <div className="relative w-full mt-2">
                        <Input
                          type="text"
                          placeholder="Name your message template"
                          className="w-full h-[35px] border rounded-md p-2 pr-10 text-gray-500"
                          value={templateName}
                          maxLength={512}
                          onChange={handleInputChange}
                        />
                        <span className="absolute top-[8px] right-[8px] text-xs text-gray-500">
                          {templateName.length}/{512}
                        </span>
                      </div>
                    </div>
                    {/* Language Column */}
                    <div className="flex-shrink-0">
                      <Label htmlFor="language" className="mt-2 text-left">
                        Language
                      </Label>
                      <Select onValueChange={(value) => setLanguage(value)}>
                        <SelectTrigger className="text-gray-500 w-48 mt-2">
                          <SelectValue
                            className="text-gray-500"
                            placeholder={
                              templateId ? updateLanguage : "English"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {languageList.map((type) => (
                            <SelectItem
                              className="text-gray-500 cursor-pointer"
                              key={type.language_id}
                              value={type.language_code}
                            >
                              {type.language_name}
                              {updateLanguage === type.language_name ? (
                                <CheckIcon />
                              ) : null}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {LanguageError && (
                        <p className="text-red-500 text-xs mt-2 ml-2">
                          {LanguageError}
                        </p>
                      )}
                    </div>
                  </div>
                  {templateError && (
                    <p className="text-red-500 text-xs mt-1 ml-2">
                      {templateError}
                    </p>
                  )}
                </Card>

                <div className="border p-4 rounded-lg">
                  <h2
                    className="mb-2 text-left"
                    style={{
                      fontWeight: 600,
                      fontSize: "16px",
                      paddingBottom: "10px",
                    }}
                  >
                    Content
                  </h2>

                  {Number(channel) !== 2 ? (
                    <>
                      <h5
                        className="text-md mb-2 text-left"
                        style={{ fontWeight: 500, fontSize: "14px" }}
                      >
                        Header
                        <div
                          style={{
                            background: "#F0F4F8", // Background color for the badge
                            color: "#64748B", // Fixed font color for testing
                            padding: "2px 10px", // Padding for the badge
                            borderRadius: "9999px", // Fully rounded badge
                            // Border style, matching the background
                            display: "inline-flex", // Ensures correct alignment
                            alignItems: "center", // Centers the text vertically
                            height: "20px", // Fixed height
                            marginLeft: "8px", // Space between title and badge
                            fontSize: "14px", // Optional: font size for better visibility
                            fontWeight: 600, // Set font weight for the badge text to bold
                          }}
                        >
                          Optional
                        </div>
                      </h5>
                    </>
                  ) : (
                    <></>
                  )}

                  <div className="space-y-4">
                    {Number(channel) !== 2 ? (
                      <Select
                        value={headerType}
                        onValueChange={handleOptionChange}
                      >
                        <SelectTrigger className="w-full text-gray-500">
                          <SelectValue
                            placeholder={templateId ? updateHeaderType : " "}
                          />
                        </SelectTrigger>
                        <SelectContent className="cursor-pointer">
                          <SelectItem value="image" className="cursor-pointer">Image</SelectItem>
                          <SelectItem value="text" className="cursor-pointer">Text</SelectItem>
                          <SelectItem value="document" className="cursor-pointer">Document</SelectItem>
                          <SelectItem value="video" className="cursor-pointer">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <></>
                    )}

                    {/* File Input for Image, Video, or Document */}
                    {(selectedOption === "image" ||
                      selectedOption === "video" ||
                      selectedOption === "document") && (
                      <div className="flex items-center space-x-4 mb-4">
                        <label className="text-sm font-medium text-gray-700">
                          {selectedOption.charAt(0).toUpperCase() +
                            selectedOption.slice(1)}
                        </label>
                        {selectedFile ? (
                          <div className="flex items-center space-x-2">
                            <span className="p-2 border rounded-md bg-gray-100">
                              {selectedFile?.name}
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              className="text-gray-600 hover:text-red-500"
                              aria-label="Remove File"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <Input
                            ref={fileInputRef}
                            style={{ fontFamily: "'Inter', sans-serif" }}
                            type="file"
                            accept={
                              selectedOption === "image"
                                ? "image/jpeg, image/png"
                                : headerType === "video"
                                ? "video/mp4, video/mov"
                                : headerType === "document"
                                ? ".pdf"
                                : ""
                            }
                            onChange={handleFileChange}
                            className="border rounded-md p-2 w-full cursor-pointer"
                          />
                        )}
                      </div>
                    )}

                    {/* Text Input for Text Header */}
                    {selectedOption === "text" && (
                      <div className="mt-4" style={{ position: "relative" }}>
                        <Input
                          value={textInput}
                          onChange={handleTextChange}
                          className="text-gray-500 border rounded-md p-2 mb-4 w-full"
                          placeholder="Enter your header text"
                          maxLength={60}
                        />
                        <span
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            fontSize: "12px",
                            color: "gray",
                          }}
                        >
                          {textInput.length}/{maxLength}
                        </span>
                      </div>
                    )}

                    <div>
                      <label
                        className="block text-left mb-2"
                        style={{ fontWeight: 500, fontSize: "14px" }}
                      >
                        Body
                      </label>
                      <div style={{ position: "relative" }}>
                        <textarea
                          className="w-full border rounded p-2 text-gray-500"
                          rows={4}
                          maxLength={1024}
                          value={bodyText}
                          placeholder="Hello"
                          onChange={(e) => handleBodyTextChange(e.target.value)}
                          style={{ paddingRight: "50px" }}
                        ></textarea>
                        <span
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            fontSize: "12px",
                            color: "gray",
                          }}
                        >
                          {bodyText.length}/1024
                        </span>
                      </div>
                      {BodyError && (
                        <p className="text-red-500 text-sm text-left">
                          {BodyError}
                        </p>
                      )}

                      <div className="flex gap-4 flex-row w-full justify-end">
                        <Smile
                          className="w-4 h-4 mt-2 cursor-pointer"
                          onClick={() => setShowPicker((val) => !val)}
                        />
                        <FontBoldIcon
                          className="w-4 z-50 h-4 mt-2 cursor-pointer"
                          onClick={makeTextBold}
                        />
                        <FontItalicIcon
                          className="w-4 h-4 mt-2 cursor-pointer"
                          onClick={makeTextItalic}
                        />
                        <Strikethrough
                          className="w-4 h-4 mt-2 cursor-pointer"
                          onClick={makeTextStrikethrough}
                        />
                        <CodeIcon
                          className="w-4 h-4 mt-2 cursor-pointer"
                          onClick={makeTextMonospace}
                        />
                        {Number(channel) !== 2 ? (
                          <Button
                            onClick={addVariable}
                            variant="ghost"
                            className="w-[125px] mt-[-6]  h-[30px]"
                          >
                            <AddIcon /> Add variable
                          </Button>
                        ) : (
                          <></>
                        )}

                        <InfoCircledIcon className="mt-2 ml-[5px] text-[#fffff] cursor-pointer" />
                      </div>
                      {showPicker && (
                        <div>
                          <EmojiPicker
                            className="z-10"
                            onEmojiClick={(emoji: any) => onEmojiClick(emoji)}
                          />
                        </div>
                      )}

                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            bodyText.length < 25
                              ? "error.main"
                              : "text.secondary",
                          mt: 1,
                          textAlign: "right",
                          fontFamily: "Salesforce Sans, sans-serif",
                        }}
                      ></Typography>

                      <Container>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            mt: 1,
                          }}
                        ></Box>

                        <div style={{ textAlign: "left", marginTop: "25px" }}>
                          {boxes.map((box, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: "15px",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ color: "black", fontSize: "12px" }}
                              >
                                <p>{`{{${i + 1}}}`}</p>
                              </Typography>
                              <TextField
                                size="small"
                                type="text"
                                variant="standard"
                                sx={{ marginLeft: "10px", flex: 1 }}
                                value={box.action}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                  updateButtonAction(i, e)
                                }
                              />
                              <IconButton
                                onClick={() => onTextboxDelete(i)}
                                sx={{
                                  color: "lightgray",
                                  borderRadius: "50%",
                                  padding: "8px",
                                  "&:hover": {
                                    backgroundColor: "rgba(211, 211, 211, 0.3)",
                                  },
                                  marginLeft: "10px",
                                }}
                              >
                                <CancelIcon />
                              </IconButton>
                            </div>
                          ))}
                        </div>
                      </Container>
                    </div>

                    {Number(channel) !== 2 ? (
                      <div>
                        <label
                          className="block text-left mb-2"
                          style={{ fontWeight: 500, fontSize: "14px" }}
                        >
                          Footer
                          <span
                            style={{
                              background: "#F0F4F8",
                              color: "#64748B",
                              padding: "2px 10px",
                              borderRadius: "9999px",
                              display: "inline-flex",
                              alignItems: "center",
                              height: "20px",
                              marginLeft: "8px",
                              fontSize: "14px",
                              fontWeight: 600,
                            }}
                          >
                            Optional
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter text"
                          className="w-full border rounded p-2"
                          value={FooterText}
                          onChange={(e) => setFooterText(e.target.value)}
                        />

                        {/*<Select value={FooterText} onValueChange={handleFooterChange}>
                    <SelectTrigger className="w-full border rounded p-2 text-gray-500">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Thank You">Thank You</SelectItem>
                      <SelectItem value="Welcome">Welcome</SelectItem>
                    </SelectContent>
                  </Select>*/}
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>

                  {/* </>):(<></>)} */}
                </div>
                {Number(channel) !== 2 ? (
                  <div className="border p-4 rounded-lg">
                    <Typography
                      variant="h6"
                      style={{
                        fontSize: "16px",
                        color: "black",
                        textAlign: "left",
                        fontWeight: "bold",
                        marginBottom: "8px",
                      }}
                    >
                      Buttons
                      <span
                        style={{
                          background: "#F0F4F8",
                          color: "#64748B",
                          padding: "2px 10px",
                          borderRadius: "9999px",
                          display: "inline-flex",
                          alignItems: "center",
                          height: "20px",
                          marginLeft: "8px",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        Optional
                      </span>
                    </Typography>

                    <div className="inline-block mt-4 w-full flex-col justify-start">
  <Button
    onClick={handleAddRow}
    className="flex items-center px-4 py-2 border border-gray-300 font-thin rounded-md text-white hover:bg-gray-900"
    style={{
      width: "125px",
      height: "40px",
      background: "#3A85F7",
      marginTop: "-8px",
      marginBottom: "15px",
      fontWeight: "normal",
    }}
  >
    <span className="mr-1">
      <PlusIcon className="w-4 h-4" />
    </span>
    Add button
    <span className="ml-1">
      <ChevronDownIcon className="w-4 h-4" />
    </span>
  </Button>

  {warning && <p className="text-red-500 text-sm mt-2">{warning}</p>}

  <div className="space-y-4">
    {rows.map((row, index) => (
      <div key={index} className="flex space-x-4 items-center">
        <div className="flex flex-col gap-2">
          <Label className="font-bold text-left">Type of action</Label>
          <Select
            value={row.buttonType}
            onValueChange={(value) => handleRowInputChange(index, "buttonType", value)}
          >
            <SelectTrigger className="w-[125px] h-[36px]">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              <SelectItem value="View Website">View Website</SelectItem>
              <SelectItem value="Call Phone Number">Call Phone Number</SelectItem>
              <SelectItem value="Copy Offer Code">Copy Offer Code</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {renderRowFields(row, index)}

        <IconButton
          onClick={() => onDeleteRow(row, index)}
          sx={{
            color: "gray",
            borderRadius: "10%",
            padding: "4px",
            "&:hover": {
              backgroundColor: "rgba(211, 211, 211, 0.3)",
            },
            marginLeft: "10px",
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </div>
    ))}
  </div>
</div>

                  </div>
                ) : (
                  <></>
                )}
              </div>

              <div
                ref={previewRef}
                className={`border  max-h-fit top-auto right-14 rounded-lg`}
                // style={{
                //   // Adjust top positioning when fixed
                //   right: "14px", // Fixed right position for the preview container
                //   zIndex: 10, // Ensure it appears above other content
                //   // Apply rounded corners for a cleaner design
                // }}
              >
                <h2 className="mb-2 mt-4 font-bold">Template Preview</h2>
                <div className="flex flex-col justify-between rounded-[30px] text-black p-4 w-[350px] min-h-auto">
                  <div className="justify-center">
                    <i className="fas fa-mobile-alt text-4xl mb-4"></i>
                    {renderPreview()}{" "}
                    {/* Function to render the preview content dynamically */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      
    </div>
  );
};

export default CreateTemplate;
