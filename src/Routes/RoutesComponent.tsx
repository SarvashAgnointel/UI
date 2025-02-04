import React, { FC, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import PersonalInfo from "../Pages/PersonalInfo";
import SignInPage from "../Pages/SignInPage";
import SignupPage from "../Pages/SignupPage";
import EmailVerificationPage from "../Pages/EmailVerificationPage";
import Navbar from "../Components/Navbar/Navbar";
import OperatorNavbar from "../Components/Navbar/OperatorNavbar";
import Dashboard from "../Pages/Dashboard";

import OperatorDashboard from "../Operator/OperatorDashboard";

import CampaignList from "../Pages/Campaign/CampaignList";
import CreateCampaign from "../Pages/Campaign/CreateCampaign";

import OperatorCampaignList from "../Operator/OperatorCampaignList";
import OperatorDataList from "../Operator/OperatorDataList";
import OperatorMembers from "../Operator/OperatorMembers";

import CreateTemplate from "../Pages/Templates/CreateTemplate";
import TemplateList from "../Pages/Templates/TemplateList";

import ChannelList from "../Pages/Channel/ChannelList";
import Audience from "../../src/Pages/Audiences/Audience";
import Whatsapp from "../../src/Pages/Channel/Whatsapp";

import Layout from "../Components/Navbar/Layout";
import Billing from "../Pages/Settings/Billing";
import Members from "../Pages/Settings/Members";
import Notification from "../Pages/Settings/Notification";
import Profile from "../Pages/Settings/Profile";
import Workspace_settings from "../Pages/Settings/Workspace_settings";
import { useDispatch } from "react-redux";
import { setmail } from "../State/slices/AuthenticationSlice";

//Admin
import AdminHome from "../Admin/AdminPages/AdminHome";
import AdminNavbar from "../Admin/AdminNavbar/AdminNavbar";
import Accounts from "../Admin/AdminPages/Accounts/AdminAccounts";
import AdminCampaignList from "../Admin/AdminPages/AdminCampaignList";
import Audiences from "../Admin/AdminPages/Audiences";
import AdminTeam from "../Admin/AdminPages/AdminTeam";
import Advertiser from "../Admin/AdminPages/advertiser";
import AdminPlans from "../Admin/AdminPages/Plans/AdminPlans";
import AdminCampaignReview from "../Admin/AdminPages/AdminCampaignReview";
import AdminChannelList from "../Admin/AdminPages/Channels/AdminChannelList";
import CreatePlans from "../Admin/AdminPages/Plans/CreatePlans";
import AdminSMS from "../Admin/AdminPages/Channels/AdminSMS";
import OperatorCampaignReview from "../Operator/OperatorCampaignReview";


const ProtectedRoute: FC<{ authenticated: boolean }> = ({
  authenticated,
}) => {
  return authenticated ? <Outlet /> : <Navigate to="/" />;
};


const RoutesComponent: FC = () => {
  const [userEmailId, setUserEmailId] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const dispatch = useDispatch();
  useEffect(()=>{
    console.log("user mail id: "+userEmailId);
    dispatch(setmail(userEmailId));
  },[userEmailId])
  return (
    <Router>
      <Routes>
        <Route path="*" element={<Navigate to="/" />} />

        {/* Public Routes */}
        <Route path="/" element={
            <SignInPage setAuthenticated={setAuthenticated} setUserEmailId={setUserEmailId}/>
          }
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/otpverify" element={<EmailVerificationPage />} />
        <Route path="/personalinfo" element={<PersonalInfo setAuthenticated={setAuthenticated} />}
        />

        {/* Protected Routes */}
        {/* {authenticated ? (
          <> */}
           <Route element={<ProtectedRoute authenticated={authenticated} />}>
            <Route
              path="/navbar"
              element={<Navbar setAuthenticated={setAuthenticated} />}
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="campaignlist" element={<CampaignList />} />
              <Route path="createcampaign" element={<CreateCampaign />} />
              <Route path="templatelist" element={<TemplateList />} />
              <Route path="createtemplate" element={<CreateTemplate />} />
              <Route path="channels" element={<ChannelList />} />
              <Route path="audiences" element={<Audience />} />
              <Route path="whatsapp" element={<Whatsapp />} />
            </Route>

            {/*Admin  */}
            <Route
              path="/adminNavbar"
              element={<AdminNavbar setAuthenticated={setAuthenticated} />}
            >
              <Route path="home" element={<AdminHome />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="campaigns" element={<AdminCampaignList />} />
              <Route path="campaignreview" element={<AdminCampaignReview />} />
              <Route path="channels" element={<AdminChannelList />} />
              <Route path="audiences" element={<Audiences />} />
              <Route path="team" element={<AdminTeam />} />
              <Route path="plans" element={<AdminPlans />} />
              <Route path="advertiser" element={<Advertiser />} />
              <Route path="createplans" element={<CreatePlans />} />
              <Route path="sms" element={<AdminSMS />} />
            </Route>

            <Route
              path="/operatorNavbar"
              element={<OperatorNavbar setAuthenticated={setAuthenticated} />}
            >
              <Route path="dashboard" element={<OperatorDashboard />} />
              <Route path="campaignlist" element={<OperatorCampaignList />} />
              <Route path="campaignreview" element={<OperatorCampaignReview />} />
              <Route path="datalist" element={<OperatorDataList />} />
              <Route path="members" element={<OperatorMembers />} />
            </Route>

            {/* Settings */}
            <Route path="/settings" element={<Layout />}>
              <Route path="billing" element={<Billing />} />
              <Route path="members" element={<Members />} />
              <Route
                path="notification"
                element={<Notification email={userEmailId} />}
              />
              <Route path="profile" element={<Profile />} />
              <Route
                path="workspace"
                element={<Workspace_settings />}
              />
            </Route>
            </Route>
          {/* </>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )} */}
      </Routes>
    </Router>
  );
};

export default RoutesComponent;