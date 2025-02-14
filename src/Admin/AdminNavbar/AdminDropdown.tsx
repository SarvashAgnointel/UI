import React, { FC, useEffect, useState } from "react";
import Logo from "../../Assets/Logo2.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../Components/ui/avatar";
import { User, LogOut, CircleArrowLeft } from "lucide-react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { setWorkspaceId, setworkspace } from "../../State/slices/AuthenticationSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import axios from "axios";


interface DropdownMenuDemoProps {
  profileImage: string;
  profileName: string;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Workspace {
  workspace_id: number;
  workspace_name: string;
}

interface WorkspaceDialogProps {
  open: boolean;
  handleClose: () => void;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}


// DropdownMenuDemo component
export function DropdownMenuDemo({
  profileImage,
  profileName,
  setAuthenticated,
}: DropdownMenuDemoProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [workspaceList, setWorkspaceList] = useState<Workspace[]>([]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const dispatch = useDispatch();
  const email = useSelector((state:RootState)=>state.authentication.userEmail);
  const apiUrl = useSelector((state:RootState)=>state.authentication.apiURL);
  const mdSize = "text-[14px]";
  const closeAddWorkspaceDialog = useSelector((state:RootState)=>state.advertiserAccount.closeAddWorkspaceDialog);


  useEffect(() => {
    // seturl();
    try{
      const GetMultipleWorkspacesByEmail = async () => {
        const response = await axios.get(
          `${apiUrl}/GetMultipleWorkspacesByEmail?EmailId=`+email
        );
        if (response.data.status == "Success") {
          console.log(response.data.workspaceList);
          setWorkspaceList(response.data.workspaceList);
        }
      };
      GetMultipleWorkspacesByEmail();
    }
    catch(error){
      console.error("Network error: ",error);
    }

  }, []);

  const backToWorkspace = async() =>{
    try{
      const response = await axios.post(`${apiUrl}/GetWorkspaceDetailsByEmail`,{email:email});
      debugger
      if(response.data[0].Status == "Success"){
        dispatch(setworkspace(response.data[0].Workspace_Name));
        dispatch(setWorkspaceId(Number(response.data[0].WorkspaceId)));        
      }
      else{
        console.error("sending user to adv workspace failed");
      }
    }
    catch(error){
      console.error("sending user to adv workspace failed: ",error);
    }
  }

  useEffect(()=>{
    if(closeAddWorkspaceDialog){
      handleClose();
    }
  },[closeAddWorkspaceDialog])


  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          
          <span className="w-[calc(100%-25px)] text-left flex items-center mr-3 text-gray-500 hover:text-black rounded-lg px-3 py-2 cursor-pointer">
            {/* <Avatar>
              <AvatarImage src={profileImage} alt="Profile" className="h-[25px] w-[25px] rounded-full mt-2" />
              <AvatarFallback>TA</AvatarFallback>
            </Avatar> */}
            <img
              src={Logo}
              alt="Logo"
              style={{ width: "85px", height: "16.512px" }}
            />
            <CaretSortIcon className="ml-6" style={{color:'#020617'}} />
          </span>
              
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              backToWorkspace();
              setTimeout(()=>{
                navigate("/navbar/dashboard");
              },500);
              
            }

            }
            className="cursor-pointer"
          >
            <CircleArrowLeft className="mr-2 h-4 w-4" />
            
            <span className="text-[14px] text-[#020617] font-normal">
              My Workspace
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          </DropdownMenuGroup>

          <DropdownMenuGroup>
                      
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="mb-1 cursor-pointer"
            onClick={() => {
              setAuthenticated(false);
              navigate("/");
            }} 
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span className="text-[14px] text-[#020617] font-normal">
              Log out
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
