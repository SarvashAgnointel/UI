import axios from "axios";
import React, { useEffect, useState } from "react";
import { Dialog ,DialogContent, DialogTitle, DialogHeader, DialogDescription} from "../../../Components/ui/dialog";
import { Button } from "../../../Components/ui/button";


interface ViewAccountPopupProps {
  isOpen: boolean;
  onOpenChange:(open: boolean) => void;
  accountId: number;
  accountEmail: string;
}

const PersonalInfoPopup: React.FC<ViewAccountPopupProps> = ({
  isOpen,
  onOpenChange,
  accountId,
  accountEmail,
}) => {
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [workspaceType,setWorkspaceType]=useState<string>("");


  // Load configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdvAcc(config.ApiUrlAdvAcc); // Set the API URL from config
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };
    loadConfig();
  }, []);

  // Fetch personal info when the popup is open and dependencies are ready
  useEffect(() => {
    const GetPersonalInfo = async () => {
      try {
        console.log("Fetching Personal Info...");
        const response = await axios.post(`${apiUrlAdvAcc}/GetPersonalinfoByEmail`, {
          UserEmail: accountEmail,
        });
        console.log("Response:", response.data);
        if (response.data.status === "Success" && response.data.personalInfoList.length > 0) {
          const user = response.data.personalInfoList[0];
          setFirstName(user.firstName);
          setLastName(user.lastName);
          setWorkspaceType(user.workspace_type);
        } else {
          console.log("No personal info found for the given email.");
        }
      } catch (error) {
        console.error("Error fetching personal info:", error);
      }
    };

    if (isOpen && apiUrlAdvAcc && accountEmail) {
      GetPersonalInfo();
    }
  }, [isOpen, apiUrlAdvAcc, accountEmail]);


  if (!isOpen){
          // Restore pointer events after a short delay
          setTimeout(() => {
            document.body.style.pointerEvents = "";
          }, 500);
          return null;
  } 

  const handleDialogChange = (event: any) => {
    onOpenChange(event.target?.checked || false);
  };

  return (
<Dialog open={isOpen} onOpenChange={handleDialogChange}>
  <DialogContent >
    <DialogHeader className="flex items-center mt-2">
      <DialogTitle>Account Details</DialogTitle>
    </DialogHeader>
    <div className="grid grid-cols-2 gap-y-3">
      <span className="text-14px font-medium text-[#020617]">Account ID</span>
      <span className="text-[14px] font-normal">: {accountId}</span>

      <span className="text-14px font-medium text-[#020617]">Account Email</span>
      <span className="text-[14px] font-normal">: {accountEmail}</span>

      <span className="text-14px font-medium text-[#020617]">First Name</span>
      <span className="text-[14px] font-normal">: {firstName || "Loading..."}</span>

      <span className="text-14px font-medium text-[#020617]">Last Name</span>
      <span className="text-[14px] font-normal">: {lastName || "Loading..."}</span>

      <span className="text-14px font-medium text-[#020617]">Workspace Type</span>
      <span className="text-[14px] font-normal">: {workspaceType || "Loading..."}</span>

    </div>
    <div className="flex justify-center flex-wrap">
        <Button className="py-1 w-full bg-[#3A85F7] text-[14px] font-medium text-[#FAFAFA]"  onClick={handleDialogChange}>
             Cancel
        </Button>
    </div>
  </DialogContent>
</Dialog>

  );
  
  
  
  
};

export default PersonalInfoPopup;
