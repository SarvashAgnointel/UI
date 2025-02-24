import { useState } from "react";
import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import { Card } from "../../../Components/ui/card"; // Assuming you're using Shadcn's Card component
import { useNavigate } from "react-router-dom";

const AdminChannelList = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const channels = ["SMS", "WhatsApp", "Push Notifications","WeChat","Indosat(Whatsapp)","TravelAd(Whatsapp)"];
  const navigate = useNavigate();
  return (
    <div className="flex flex-wrap gap-4 p-2 w-full">
      {channels.map((ch, idx) => (
        <Card
          key={idx}
          className={`w-[250px] p-[30px] relative cursor-pointer border ${
            selectedChannel === ch ? "border-gray-300" : "border-gray-300"
          }`}
          onClick={() => {
            setSelectedChannel(ch)
            navigate('/adminNavbar/'+ch?.toLowerCase())
          }}
        >
          {/* Icon on the top right */}

          {/* Content aligned to the left */}
          <div className="flex w-full">
            <div>
              <h3 className="font-semibold font-[14px] text-[#020617] text-left flex w-full mb-2">{ch}</h3>
            </div>
            <div className="flex w-full justify-end absolute right-7 mt-1">
              {selectedChannel === ch ? (
                <CheckIcon className="text-[#3A85F7] w-4 h-4 rounded-full border border-blue-500" />
              ) : (
                <Cross1Icon className="text-[#E2E8F0] w-4 h-4 rounded-full border border-gray-200" />
              )}
            </div>
          </div>

          <p className="mt-2 text-[#64748B] font-normal text-[12px] h-[68px] text-left w-full">
            {ch === "SMS" &&
              "Direct offers and immediate delivery driving high conversions"}
            {ch === "WhatsApp" &&
              "Reach 2 billion users worldwide with high read and engagement rates"}
            {ch === "Push Notifications" &&
              "Instantly engage your mobile app users with timely and relevant notifications"}
            {ch === "TravelAd(Whatsapp)" &&
              "Send WhatsApp messages using TravelAd’s WhatsApp Business Account"}
            {ch === "Indosat(Whatsapp)" &&
              "Send WhatsApp messages using Indosat WhatsApp Business Account"}
            {ch === "WeChat" &&
              "Send WhatsApp messages using Indosat WhatsApp Business Account"}
          </p>
        </Card>
      ))}
    </div>
  );
};

export default AdminChannelList;
