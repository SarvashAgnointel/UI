import React, { FC, useState, useEffect } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiFilter } from "react-icons/fi";
import { Label } from "../../Components/ui/label";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "../../Components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";

interface Channel {
  channel_id: number;
  channel_name: string;
}

const TemplateDropdownMenuDemo: FC<{
  setFilterData: React.Dispatch<
    React.SetStateAction<{ filter: string; subFilter: string; value: number }>
  >;
}> = ({ setFilterData }) => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<string>("none");
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>(""); // Track selected value
  const [value, setValue] = useState<number>(10);
  const [channelList, setChannelList] = useState<Channel[]>([]);
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false); // Track dropdown open state

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
      }
    };

    fetchConfig();
  }, []); // Runs only once on mount

  // Watch for apiUrlAdvAcc to change and fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (apiUrlAdvAcc) {
        console.log("Fetching data for apiUrlAdvAcc:", apiUrlAdvAcc); // Debugging log
        try {
          await getChannelList(); // Load the channel list
          console.log("Data fetched successfully");
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        console.log("apiUrlAdvAcc is missing"); // Log to help debug
      }
    };

    fetchData();
  }, [apiUrlAdvAcc]);

  useEffect(() => {
    if (selectedFilter !== "" || selectedSubFilter !== "") {
      setFilterData({
        filter: selectedFilter,
        subFilter: selectedSubFilter,
        value: value,
      });
    }
  }, [selectedFilter, selectedSubFilter, value]);

  const getChannelList = async () => {
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetChannelList`);
      if (response.data && response.data.channelList) {
        setChannelList(response.data.channelList);
        console.log("Channel List:", response.data.channelList);
      } else {
        console.log("No channel list available in response.");
      }
    } catch (error) {
      console.error("Error fetching channel list:", error);
    }
  };

  useEffect(() => {
    if (selectedFilter === "none") {
      setSelectedSubFilter(""); // Update state when selectedFilter is 'none'
    }
  }, [selectedFilter]);

  const handleSelectChange = (value: string) => {
    setSelectedFilter(value);
  };

  const handleSelectSubChange = (value: string) => {
    setSelectedSubFilter(value);
  };

  const handleValueChange = (value: any) => {
    console.log("value :" + value);
    setValue(value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-19 mb-6 ml-4 mt-[-6]">
          <FiFilter className="mr-1" /> Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 transform -translate-x-32 mt-[-60px] ml-5px">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Label className="mr-6">Criteria</Label>
            <Select onValueChange={(value) => handleSelectChange(value)}>
              <SelectTrigger className="text-gray-500 w-32 h-8 w-2/3">
                <SelectValue className="text-gray-500" placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="channel">Type</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                {/* <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="sent">Sent</SelectItem> */}
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {selectedFilter !== "none" && (
          <DropdownMenuGroup>
            <DropdownMenuItem className="items-start">
              <Label className="mr-6 pt-2">Subfilter</Label>
              {selectedFilter === "channel" && (
                <Select onValueChange={(value) => handleSelectSubChange(value)}>
                  <SelectTrigger className="text-gray-500 w-2/3 h-8">
                    <SelectValue
                      className="text-gray-500"
                      placeholder="Select channel"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {channelList.map((channel) => (
                      <SelectItem
                        key={channel.channel_name}
                        value={channel.channel_name}
                      >
                        {channel.channel_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {selectedFilter === "status" && (
                <Select onValueChange={(value) => handleSelectSubChange(value)}>
                  <SelectTrigger className="text-gray-500 w-2/3 h-8">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inreview">In review</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* {selectedFilter === 'amount' && (
                <>
                  <div className="flex flex-col flex-wrap gap-3">
                    <Select
                      onOpenChange={(isOpen) => setDropdownOpen(isOpen)} // Manage dropdown open state
                      onValueChange={(value) => {
                        console.log('Selected Amount:', value);
                        setDropdownOpen(true); // Keep dropdown open after selection
                      }}
                    >
                      <SelectTrigger className="text-gray-500 w-fit h-8">
                        <SelectValue placeholder="Select amount" />
                      </SelectTrigger>
                      {isDropdownOpen && (
                        <><SelectContent>
                          <SelectItem value="greater">Greater than</SelectItem>
                          <SelectItem value="lower">Lower than</SelectItem>
                        </SelectContent><Input
                            onInput={() => console.log("231")}
                            type="number"
                            className="text-gray-500" /></>
                      )
                      }
                    </Select>


                  </div>
                </>
              )}

              {selectedFilter === 'sent' && (
                <>
                  <div className='flex flex-col flex-wrap gap-3'>
                    <Select onValueChange={(value) => console.log('Selected Sent Status:', value)}>
                      <SelectTrigger className="text-gray-500 w-fit h-8">
                        <SelectValue placeholder="Select sent status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greater">Greater than</SelectItem>
                        <SelectItem value="lower">Lower than</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      className="text-gray-500"
                      // onChange={(e) => handleValueChange(e.target.value)}
                    />
                  </div>
                </>
              )} */}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TemplateDropdownMenuDemo;
