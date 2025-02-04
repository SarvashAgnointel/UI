// eslint-disable-next-line
import React, { useEffect, useRef, useState } from 'react';
import './CSS/LoginPage.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Button, Typography, Box, CircularProgress } from '@mui/material';
import loginVideo from "../Assets/loginVideo.mp4";
import LoginImage from "../Assets/LoginBackground.png";
import Logo from '../Assets/Logo.svg';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../Components/ui/input-otp";
import crypto from 'crypto-js';
import { TIMER_SETTINGS } from '../Services/ConfigurationService';
import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
import config from '../config.json';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { setmail,setworkspace,setWorkspaceId,setAdvUrl, setAdminUrl,setForgotPassword, setIsAdmin,setSmsUrl, setOperatorUrl } from '../State/slices/AuthenticationSlice';
import { RootState } from '../State/store';
import { useToast } from "../Components/ui/use-toast";
import { Toaster } from "../Components/ui/toaster";

import jwt_decode, { jwtDecode, JwtPayload } from "jwt-decode"; // Replacing jsonwebtoken with jwt-decode



interface DecodedToken {
    Email: string;
    Name: string;
    WorkspaceId: number;
    RoleId: string;
    exp: number;
    iss: string;
    aud: string;
  }


interface OTPProps {
    separator?: React.ReactNode;
    length: number;
    value: string;
    onChange: (value: string) => void;
}

function hashOtp(otp: string): string {
    return crypto.SHA256(otp).toString();
}

function OTP({ }: OTPProps) {
    const [PageLoad, setPageLoad] = useState<boolean>(false);

    return (
        <>
            {PageLoad && (
                <>
                    <p>Loading</p>
                    <div className="page-preloader"></div>
                </>
            )}
            {!PageLoad && (
                <Container maxWidth="xs" sx={{ padding: 2, alignItems: 'center' }}>
                    <Toaster />
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', fontWeight: 600, fontSize: '24px', color: '#09090B'     }}>
                            Verify your email
                        </Typography>
                        <Typography variant="subtitle2" gutterBottom sx={{ textAlign: 'center', fontWeight:400, fontSize: '14px' ,paddingTop: '0.5rem'}} className="text-gray-500">
                            We sent you an email with your one-time password
                        </Typography>
                    </Box>
                </Container>
            )}
        </>
    );
}


export default function EmailVerificationPage() {
    const dispatch = useDispatch();
    const [timer, setTimer] = useState<number>(TIMER_SETTINGS.INITIAL_TIME);
    const [canResend, setCanResend] = useState<boolean>(false);
    const [value, setValue] = React.useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = React.useState("");
    const [Login, setLogin] = React.useState("");

    const location = useLocation();
    const navigate = useNavigate();

    const mail = location.state?.email || location.state?.newEmail ||" ";
    const login = location.state?.isLogin || "";

    const [apiUrl, setApiUrl] = useState('');

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const toast = useToast();

    const workspaceId = useSelector((state:RootState)=>state.authentication.workspace_id);

    const isInvited = useSelector((state: RootState) => state.authentication.isInvited);
    const token = useSelector((state: RootState) => state.authentication.inviteToken.token);

    const forgotPassword = useSelector((state:RootState)=>state.authentication.forgotPassword);
    console.log("FP:" ,forgotPassword);
    
    useEffect(() => {
        if (mail) setEmail(mail);
        if (login) setLogin(login);

        fetch('/config.json')
            .then(response => response.json())
            .then(config => {
                setApiUrl(config.API_URL);
                dispatch(setAdvUrl(config.ApiUrlAdvAcc));
                dispatch(setAdminUrl(config.ApiUrlAdminAcc));
                dispatch(setSmsUrl(config.SmsUrlAdminAcc));
                dispatch(setOperatorUrl(config.OperatorUrl));
            })
            .catch((error) => {
                console.error('Error loading config:', error);
                toast.toast({
                  title: 'Error',
                  description: 'Something went wrong, please try again.',
                });
              });
    }, []);

    useEffect(() => {
        if (timer > 0) {
            intervalRef.current = setInterval(() => {
                setTimer(prevTimer => {
                    if (prevTimer <= 1) {
                        clearInterval(intervalRef.current!);
                        setCanResend(true);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        } else {
            setCanResend(true);
        }

        return () => {
            clearInterval(intervalRef.current!);
        };
    }, [timer]);

    const handleSubmit = async (email: string, otp: string) => {
        if (timer <= 0) {
            // If the timer has expired, show the toast message and prevent submission
            toast.toast({
                title: "Time Expired",
                description: "Time expired. Please click Resend OTP.",
            });
            setValue(""); // Clear the OTP input field
            return; // Do not proceed with OTP verification
        }
    
        setIsLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/VerifyOtp`, {
                Email: email,
                Otp: otp,
            });
    
            console.log("Response:", response);
    
            if (response.status === 200 && response.data.status === "Success") {
                sessionStorage.setItem("otpVerified", "true"); // OTP verified flag
                let path = "";
                let workspace_type="";
    
                const Close = async () => {
                    if (Login === "Login") {
                        const res = await axios.get(`${apiUrl}/GetWorkspaceNameByEmail?EmailId=${email}`);
                        if (res.status === 200 && res.data.status === "Success") {
                            const AdminResp = async () => {
                                try {
                                    const response = await axios.get(`${apiUrl}/CheckIfAdmin?EmailId=` + email);
                                    if (response.data.status === "Success") {
                                        dispatch(setIsAdmin(response.data.isAdmin));
                                    } else {
                                        console.log("Check IF_Admin API error");
                                    }
                                } catch (error) {
                                    console.log(error);
                                }
                            };
                            AdminResp();
                            debugger
                            workspace_type = res.data.workspaceName.workspace_type;
                            dispatch(setmail(email));
                            path = res.data.workspaceName.workspace_name;
                            dispatch(setworkspace(path));
                            const wid = res.data.workspaceName.workspace_id;
                            dispatch(setWorkspaceId(wid));
                            console.log("Wid:", wid);
                            console.log("workspaceId", workspaceId);
    
                            setTimeout(() => {
                        
                              navigate(workspace_type === "Telecom Operator"
                                ? "/operatorNavbar/dashboard"
                                : "/navbar/dashboard", { state: { path, email } });
                            }, 2000); // Delay navigation for 2 seconds to allow toast display
                            
                        } else {
                            path = "";
                        }
                        
                        setTimeout(() => {
                            navigate(
                                Login === "Login"
                                  ? workspace_type === "Telecom Operator"
                                    ? "/operatorNavbar/dashboard"
                                    : "/navbar/dashboard"
                                  : "/personalinfo",
                                { state: { path, email } }
                              );
                            setIsLoading(false);
                        }, 2000); // Delay navigation for 2 seconds to allow toast display
                    } else if (forgotPassword) {
                        navigate("/");
                    } else {
                        if (isInvited) {
                            const decoded = jwtDecode<DecodedToken>(token);
                            console.log(decoded);
                            const wid = decoded.WorkspaceId;
                            console.log("Email Verification WID: ", wid);
                            dispatch(setWorkspaceId(wid));
                            navigate("/personalinfo", { state: { path, email } });
                        }
                        try{
                            const response = await axios.get(`${apiUrl}/CheckIfAdmin?EmailId=` + email);
                            if (response.data.status === "Success") {
                                dispatch(setIsAdmin(response.data.isAdmin));
                            } else {
                                console.log("Check IF_Admin API error");
                                }
                        } catch { 
                            toast.toast({
                                title: "Error",
                                description: "Something went wrong please try again.",
                            });
                        }
                        
                        navigate("/personalinfo", { state: { path, email } });
                    }
                };
                Close();
                toast.toast({
                    title: "Success",
                    description: "OTP verified successfully",
                });
                setTimeout(() => {
                }, 2000); // Delay navigation for 2 seconds to allow toast display
            } else {
                // Keep user on the OTP page and show error message
                console.log("Invalid OTP Response:", response);
                toast.toast({
                    title: "Error",
                    description: "Invalid OTP. Please try again or wait to resend.",
                });
                setTimeout(() => {
                }, 2000); // Delay navigation for 2 seconds to allow toast display
                setValue(""); // Clear the input field for the next attempt
            }
        } catch (error) {
            console.error("Error during API call:", error);
            toast.toast({
                title: "Error",
                description: "An error occurred, please try again.",
            });
            setTimeout(() => {
            }, 2000); // Delay navigation for 2 seconds to allow toast display
            setValue("");
        } finally {
            setIsLoading(false);
        }
    };

    const otpInputRef = useRef<HTMLInputElement>(null); // Specify the input element type

    
    const handleResendOTP = async (email: string) => {
        setIsLoading(true);
        if (otpInputRef.current) {
            otpInputRef.current.focus(); // Set focus to the first OTP input
          }

        try {
            const response = await axios.post(`${apiUrl}/SendOtp/SendOtp`, {
                Email: email,
            });
    
            if (response.status === 200 && response.data.status === "Success") {
                setTimer(TIMER_SETTINGS.INITIAL_TIME); // Reset the timer
                setCanResend(false); // Disable the Resend OTP button again
                toast.toast({
                    title: "Success",
                    description: response.data.message,
                });
            } else {
                toast.toast({
                    title: "Error",
                    description: response.data.message,
                });
            }
        } catch (error) {
            console.error("Error during API call:", error);
            toast.toast({
                title: "Error",
                description: "An error occurred, please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    
 
    

   

    return (
        <div className="email-verification-page" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Toaster/>
            {isLoading && (
                <div className="loading-overlay">
                    <CircularProgress color="primary" />
                </div>
            )}
                  <div
        style={{
          position: 'fixed',
          top: '30px',
          left: '30px',
          zIndex: 20,
          
        }}
      >
        <img src={Logo} alt="Logo" style={{ width: '170px', height: 'auto' }} />
      </div>
      <div
        className="left-pane"
        style={{
          flex: '2.2',
          // backgroundImage: `url(${figmaPageImage})`,
          // backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden'
        }}
      
      >
         <video autoPlay loop muted playsInline className="background-video"
         style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'fill'}}>
          <source src={loginVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
       </div>
            
            {/* Right pane without any structural or alignment changes */}
            <div className="right-pane" style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="LoginMatCard" style={{ width: '90%', maxWidth: '400px', marginTop: '12px' }}>
                    <OTP length={0} value={''} onChange={() => { }} />
                    <InputOTP
                        
                        ref={otpInputRef} // Assign the ref to the first input

                        maxLength={6}
                        value={value}
                        onChange={(value) => {
                            setValue(value);
                            if (value.length === 6) {
                                const hashedOtp = hashOtp(value);
                                handleSubmit(email, hashedOtp);
                            }
                        }}
                        autoFocus
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} className="border border-[#E2E8F0]"/>
                            <InputOTPSlot index={1} className="border border-[#E2E8F0]"/>
                            <InputOTPSlot index={2} className="border border-[#E2E8F0]"/>
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} className="border border-[#E2E8F0]"/>
                            <InputOTPSlot index={4} className="border border-[#E2E8F0]"/>
                            <InputOTPSlot index={5} className="border border-[#E2E8F0]"/>
                        </InputOTPGroup>
                    </InputOTP>

                    <Typography variant="subtitle2" sx={{ textAlign: 'center', marginTop: '10px', fontSize: '14px', color: '#000000', fontWeight: 400 }}>
                        Enter your one-time password
                    </Typography>

                    <Typography variant="body2" gutterBottom sx={{ textAlign: 'center', color: '#AEAEAE', cursor: 'pointer', marginTop: '30px' }}>
                        {canResend ? (
                            <Button
                                style={{ backgroundColor: 'black', color: 'white', textTransform: 'capitalize' }}
                                onClick={() => handleResendOTP(email)}
                            >
                                Resend OTP
                            </Button>
                        ) : (
                            `Resend OTP in ${timer} seconds`
                        )}
                    </Typography>
                </div>
            </div>
        </div>
    );
}
