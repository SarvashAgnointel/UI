// import React, { useEffect, useRef, useState } from 'react';

// const OperatorMembers: React.FC = () => {
//   const [state, setState] = useState<string>(''); // Example state with type
//   const ref = useRef<HTMLDivElement | null>(null); // Example ref with type

//   useEffect(() => {
//     // Example effect
//     console.log('OperatorDashboard is mounted');
//     return () => {
//       console.log('OperatorDashboard is unmounted');
//     };
//   }, []);

//   return (
//     <div ref={ref}>
//       <h1>This page is under development</h1>
//     </div>
//   );
// };

// export default OperatorMembers;

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../Components/ui/table";
import { Badge } from "../Components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '../Components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../Components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../Components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../Components/ui/select'
import { Label } from '../Components/ui/label';
import { CaretSortIcon } from "@radix-ui/react-icons";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../State/store';
import { ToastContainer, toast } from "react-toastify";

interface Member {
 name:string
  email: string;
  role:string;
  joinedDate:string;
  wId: number;
// assuming date is a string in ISO format
}

interface InviteMember{
  name:string;
  role:string;
  invitedAt:string;
  expiresAt:string;
  status:string
}

interface Roles{
  role_id:string;
  role_name:string
}

const OperatorMembers: React.FC= () => {

const initialMembers: Member[] = [
    { name: 'Sebastian', email: 'sebastian@sibiatech.com',role:'Owner', joinedDate:'2024-10-11T10:30:00Z',wId:0 },
    { name: 'Nour', email: 'nour@sibiatech.com',role:'Super Admin', joinedDate:'2024-09-25T09:15:00Z',wId:0 },
];

const inviteMembersList : InviteMember[] = [
    { name: "malek@sibiatech.com", role: "Owner", invitedAt: "03/01/2024", expiresAt: "03/03/2024", status: "Active"},
];

const [open, setOpen] = useState(false);
const [currentMembers, setCurrentMembers] = useState<Member[]>(initialMembers);
const [originalMembers, setOriginalMembers] = useState<Member[]>(initialMembers);
const [isSorted, setIsSorted] = useState(false);

const [inviteCurrentMembers, setInviteCurrentMembers] = useState<InviteMember[]>(inviteMembersList);
const [inviteOriginalMembers, setInviteOriginalMembers] = useState<InviteMember[]>(inviteMembersList);
const [isInviteSorted, setIsInviteSorted] = useState(false);
const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
const [apiUrl, setApiUrl] = useState('');
const workspaceId = useSelector((state:RootState)=>state.authentication.workspace_id);
const [invitedMembers, setInvitedMembers] = useState([{ email: '', role: '' ,name:'fazil',wId:workspaceId}]);
const [roles, setRoles] = useState<Roles[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdvAcc(config.ApiUrlAdvAcc);
        setApiUrl(config.API_URL);
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (apiUrlAdvAcc) {
        try {
          await getRolesList();
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        console.log("apiUrlAdvAcc is missing", {
          apiUrlAdvAcc,
        });
      }
    };

    fetchData();
  }, [apiUrlAdvAcc]);


  
  const getRolesList = async () => {

    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetRolesList`);

      if (response.data && response.data.rolesList) {
        setRoles(response.data.rolesList);
        console.log("Country List : ", response.data.rolesList);
      } else {
        console.log("No roles list available in response.");
      }
    } catch (error) {
      console.error("Error fetching error list:", error);
    } finally { }
  };

  const handleInputChange = (index: number, field: keyof Member, value: string) => {
    const updatedMembers = [...invitedMembers];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value,
    } as unknown as Member;
    setInvitedMembers(updatedMembers);
  };
  

  const handleAddMember = () => {
    setInvitedMembers([...invitedMembers, {
      email: '', role: '',
      name: '',
      wId: 0
    }]);
  };

  const handleRemoveMember = (index: number) => {
    const updatedMembers = invitedMembers.filter((_, i) => i !== index);
    setInvitedMembers(updatedMembers);
  };

  const handleSendInvites = async () => {
    try {
      // Map invitedMembers to match the expected backend API model
      const requestData = invitedMembers.map((member) => ({
        Email: member.email,
        Name: member.name,
        WorkspaceId: member.wId,
        RoleId: parseInt(member.role),
      }));
  
      // Send the array directly to the API without wrapping it in an object
      const response = await axios.post(`${apiUrl}/SendInvite/send-invite`, requestData);
  
      if (response.data.status === 'Success') {
        toast.success(response.data.message, { autoClose: 1000 });
        // Reset form or invitedMembers array after a successful response
        setInvitedMembers([{ email: '', role: '', name: '', wId: 0 }]);
      } else {
        toast.error("Error sending invites", { autoClose: 1000 });
      }
    } catch (error) {
      console.error("Failed to send invites:", error);
      toast.error("An error occurred while sending invites", { autoClose: 1000 });
    }
  
    // Optionally close the dialog or modal after the request
    handleClose();
  };
  
  
  


  const sortByField = (field: keyof Member, type: "string" | "number" | "date" = "string") => {
    const sortedMembers = [...currentMembers].sort((a, b) => {
      if (type === "number") {
        return Number(a[field]) - Number(b[field]);
      } else if (type === "date") {
        return Date.parse(a[field] as string) - Date.parse(b[field] as string);
      } else {
        return String(a[field]).localeCompare(String(b[field]));
      }
    });
    setOriginalMembers(currentMembers); // Save original state
    setCurrentMembers(sortedMembers); // Set sorted members
  };

  // Function to handle sorting based on column clicked
  const sorting = (tableHeader: string) => {
    if (isSorted) {
      // Reset to original list if already sorted
      setCurrentMembers(originalMembers);
    } else {
      switch (tableHeader) {
        case "ByAdminsName":
          sortByField("name", "string");
          break;
        case "ByAdminsEmail":
          sortByField("email", "string"); 
          break;
        case "ByAdminsPermissions":
          sortByField("role", "string"); 
          break;
        case "ByAdminsJoinDate":
          sortByField("joinedDate", "string");
          break;
        default:
          console.warn("Unknown table header");
      }
    }

    setIsSorted(!isSorted); // Toggle sorting state
    console.log("Sorted members:", currentMembers); // Debugging

  }

  const sortInviteByField = (field: keyof InviteMember, type: "string" | "number" | "date" = "string") => {
    const sortedMembers = [...inviteCurrentMembers].sort((a, b) => {
      if (type === "number") {
        return Number(a[field]) - Number(b[field]);
      } else if (type === "date") {
        return Date.parse(a[field] as string) - Date.parse(b[field] as string);
      } else {
        return String(a[field]).localeCompare(String(b[field]));
      }
    });
    setInviteOriginalMembers(inviteCurrentMembers); // Save original state
    setInviteCurrentMembers(sortedMembers); // Set sorted members
  };

  // Function to handle sorting based on column clicked
  const sortInviteMembers = (tableHeader: string) => {
    if (isSorted) {
      // Reset to original list if already sorted
      setInviteCurrentMembers(inviteOriginalMembers);
    } else {
      switch (tableHeader) {
        case "ByInviteMemberName":
          sortInviteByField("name", "string");
          break;
        case "ByInviteMemberRole":
          sortInviteByField("role", "string"); 
          break;
        case "ByMemberInvitedAt":
          sortInviteByField("invitedAt", "string"); 
          break;
        case "ByMemberExpiresAt":
          sortInviteByField("expiresAt", "string"); 
          break;
          case "ByMemberStatus":
            sortInviteByField("status", "string"); 
            break;
        default:
          console.warn("Unknown table header");
      }
    }
    setIsSorted(!isSorted); 
  }
  
  const handleOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };

  return (
 
    <div className="flex-col gap-6 h-full overflow-y-auto no-scrollbar">
         <ToastContainer />
      <Card >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-left">Admins</h2>
              <p className="text-sm text-gray-600">Here you can manage the TravelAd admins</p>
            </div>
            <Button className="w-48 text-white mt-0" onClick={()=>{handleOpen()}} >
              + Invite members
            </Button>

            <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Members to your Team</DialogTitle>
          <DialogDescription>
            Invite members to your team by entering their email and role.
          </DialogDescription>
        </DialogHeader>

        {invitedMembers.map((member, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <div className="flex-col">
              <Label>Email</Label>
              <Input
                type="email"
                value={member.email}
                onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                className="w-72"
              />
            </div>

            <div className="flex-col">
              <Label>Role</Label>
              <Select
                value={member.role}
                onValueChange={(value) => handleInputChange(index, 'role', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {invitedMembers.length > 1 && (
              <Button
                variant="outline"
                className="w-4 mt-4"
                onClick={() => handleRemoveMember(index)}
              >
                ✕
              </Button>
            )}
          </div>
        ))}

        <Button variant="link" onClick={handleAddMember} className="mt-2 ml-2">
          + Add another one
        </Button>

        <Button className="w-full text-white mt-2" onClick={handleSendInvites}>
          Send invites
        </Button>
      </DialogContent>
    </Dialog>
          
          </div>
        </CardHeader>
        <div className='mt-1 pr-6 pl-6'>
            <Input placeholder="Search admins" />
          </div>
        <CardContent>
        <div className="rounded-md border mt-4">
        <Table
        className="rounded-xl whitespace-nowrap border-gray-200 "
        style={{ color: "#020202", fontSize: "15px" }}
      >
        <TableHeader className="text-center">
          <TableRow>
            <TableHead className="text-left">
              <div className="flex items-center gap-2 justify-start cursor-pointer">
                Name <CaretSortIcon onClick={() => sorting("ByAdminsName")}  className="cursor-pointer" />
              </div>
            </TableHead>
            <TableHead className="text-left">
              <div className="flex items-center gap-2 justify-start">
                Email <CaretSortIcon  onClick={() => sorting("ByAdminsEmail")} className="cursor-pointer" />
              </div>
            </TableHead>
            <TableHead className="text-left">
              <div className="flex items-center gap-2 justify-start">
                Permissions <CaretSortIcon onClick={() => sorting("ByAdminsPermissions")}  className="cursor-pointer" />
              </div>
            </TableHead>
            <TableHead className="text-left">
              <div className="flex items-center gap-2 justify-start">
                Joined at <CaretSortIcon onClick={() => sorting("ByAdminsJoinDate")}  className="cursor-pointer" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        {currentMembers.map((member, index) => (
          <><TableRow key={index}>
            <TableCell className="flex items-center space-x-2 py-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span>{member.name}</span>
              {index === 0 && ( // Conditionally rendering "You" badge for the first row
                <Badge className="ml-2 bg-blue-500 text-white">You</Badge>
              )}
            </TableCell>
            <TableCell className='text-left'>{member.email}</TableCell>
            <TableCell className='text-left'>
              <Badge className="text-white" style={{
                backgroundColor: member.role === "Owner" 
                    ? "#DFA548" 
                    : member.role === "Super Admin" 
                    ? "#1a1a1a" 
                    : "#cccccc" 
                }}>{member.role}</Badge>
            </TableCell>
            <TableCell className='text-left'>03/02/2024</TableCell>
            
            <TableCell className='text-left'>
            <DropdownMenu>
                <DropdownMenuTrigger className="ml-2  cursor-pointer">•••</DropdownMenuTrigger>
                <DropdownMenuContent className="absolute right-0" style={{ width: "145px" }}>
                  <DropdownMenuItem>Update Invitation</DropdownMenuItem>
                  <DropdownMenuItem>Remove Invitation</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </TableCell>
          </TableRow></>
        ))}
        </TableBody>
      </Table>
        </div>


        </CardContent>
      </Card>

      {/* Pending Invites Section */}
      <Card className='mb-[100px] mt-2'>
        <CardHeader>
          <div>
            <h2 className="text-lg font-bold text-left">Pending Invites</h2>
            <p className="text-sm text-gray-600 text-left">Here you can manage the pending admin invitations.</p>
          </div> <br></br>
          <Input placeholder="Search invitations" />
        </CardHeader>
        <CardContent>
        <div className='rounded-md border' >
        <Table
      className="rounded-xl whitespace-nowrap border-gray-200"
      style={{ color: "#020202", fontSize: "15px" }}
    >
      <TableHeader className="text-center">
        <TableRow>
          <TableHead className="text-left">
            <div className="flex items-center gap-2 justify-start">
              Name <CaretSortIcon onClick={() => sortInviteMembers("ByInviteMemberName")} className="cursor-pointer" />
            </div>
          </TableHead>
          <TableHead className="text-left">
            <div className="flex items-center gap-2 justify-start">
              Role <CaretSortIcon onClick={() => sortInviteMembers("ByInviteMemberRole")} className="cursor-pointer" />
            </div>
          </TableHead>
          <TableHead className="text-left">
            <div className="flex items-center gap-2 justify-start">
              Invited at <CaretSortIcon onClick={() => sortInviteMembers("ByMemberInvitedAt")}  className="cursor-pointer" />
            </div>
          </TableHead>
          <TableHead className="text-left">
            <div className="flex items-center gap-2 justify-start">
              Expires at <CaretSortIcon onClick={() => sortInviteMembers("ByMemberExpiresAt")}  className="cursor-pointer" />
            </div>
          </TableHead>
          <TableHead className="text-left">
            <div className="flex items-center gap-2 justify-start">
              Status <CaretSortIcon onClick={() => sortInviteMembers("ByMemberStatus")} className="cursor-pointer" />
            </div>
          </TableHead>
          <TableHead></TableHead>
          
        </TableRow>
      </TableHeader>
      <TableBody className="text-left">
      {inviteCurrentMembers.map((member, index) => (
        <TableRow key={index}>
          <TableCell className="flex items-center space-x-2 py-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span>{member.name}</span>
          </TableCell>
          <TableCell>
            <Badge className="text-white" style={{backgroundColor: "#DFA548"}}>{member.role}</Badge>
          </TableCell>
          <TableCell>{member.invitedAt}</TableCell>
          <TableCell>{member.expiresAt}</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Badge className="text-white" style={{backgroundColor: "#479E98"}}>{member.status}</Badge>
            </div>
          </TableCell>
          <TableCell>
          <DropdownMenu>
                <DropdownMenuTrigger className="ml-2  cursor-pointer">•••</DropdownMenuTrigger>
                <DropdownMenuContent className="absolute right-0" style={{ width: "145px" }}>
                  <DropdownMenuItem>Update Invitation</DropdownMenuItem>
                  <DropdownMenuItem>Remove Invitation</DropdownMenuItem>
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

    </div>
  );
};

export default OperatorMembers;

