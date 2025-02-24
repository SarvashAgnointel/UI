import React, { FC, useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { FiFilter } from "react-icons/fi";
import { Label } from "../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

type MainFilterOption = "None" | "Status" | "UpdatedAt";
type SubFilterOption = string;

const DropdownMenuDemo: FC<{
  setFilterData: React.Dispatch<React.SetStateAction<{ filter: string; value: string }>>;
  filterData: { filter: string; value: string };
  dateList: string[];
}> = ({ setFilterData, filterData, dateList }) => {
  const [selectedMainFilter, setSelectedMainFilter] = useState<MainFilterOption>("None");
  const [selectedSubFilter, setSelectedSubFilter] = useState<SubFilterOption>("");
  const [isOpen, setIsOpen] = useState(false); // Manage dropdown open state

  useEffect(() => {
    setSelectedMainFilter(filterData.filter as MainFilterOption);
    setSelectedSubFilter(filterData.value);
  }, [filterData]);

  // Handle Main Filter Selection
  const handleMainFilterChange = (filter: MainFilterOption) => {
    setSelectedMainFilter(filter);
    setSelectedSubFilter(""); // Reset subfilter

    if (filter === "Status") {
      setFilterData({ filter, value: "Updated" });
    } else if (filter === "UpdatedAt") {
      setFilterData({ filter, value: dateList[0] || "" });
    } else {
      setFilterData({ filter: "None", value: "" });
    }

    setIsOpen(true); // Keep dropdown open
  };

  // Handle Subfilter Selection
  const handleSubFilterChange = (value: SubFilterOption) => {
    setSelectedSubFilter(value);
    setFilterData({ filter: selectedMainFilter, value });
    setIsOpen(true); // Keep dropdown open
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full mb-6 ml-4 mt-[-6] text-[#020617] font-medium text-[14px] py-2 px-3">
          <FiFilter style={{ width: "14px", height: "14px" }} className="mr-1 text-[#020617]" /> Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 transform -translate-x-32 mt-[-60px] ml-[-160px]">
        <DropdownMenuGroup>
          {/* Main Filter Dropdown */}
          <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="flex items-center space-x-4">
            <Label className="w-20">Criteria</Label>
            <Select value={selectedMainFilter} onValueChange={(value) => handleMainFilterChange(value as MainFilterOption)}>
              <SelectTrigger className="text-gray-500 w-full h-8">
                <SelectValue className="text-gray-500" placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Status" className="cursor-pointer">Status</SelectItem>
                <SelectItem value="UpdatedAt" className="cursor-pointer">UpdatedAt</SelectItem>
                <SelectItem value="None" className="cursor-pointer">None</SelectItem>
              </SelectContent>
            </Select>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* Subfilter Dropdown */}
        {selectedMainFilter !== "None" && (
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="flex items-center space-x-4">
              <Label className="w-20">Subfilter</Label>
              {selectedMainFilter === "Status" && (
                <Select value={selectedSubFilter} onValueChange={(value) => handleSubFilterChange(value as SubFilterOption)}>
                  <SelectTrigger className="text-gray-500 w-full h-8">
                    <SelectValue className="text-gray-500" placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Updated" className="cursor-pointer">Updated</SelectItem>
                    <SelectItem value="Syncing..." className="cursor-pointer">Syncing</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {selectedMainFilter === "UpdatedAt" && (
                <Select value={selectedSubFilter} onValueChange={(value) => handleSubFilterChange(value as SubFilterOption)}>
                  <SelectTrigger className="text-gray-500 w-full h-8">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateList.map((date) => (
                      <SelectItem className="cursor-pointer" key={date} value={date}>
                        {date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownMenuDemo;
