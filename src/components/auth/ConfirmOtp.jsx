import { useState, useRef } from "react";
import { Input, Button } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { confirmOtp } from "../../services/api";
import otpImage from "../../assets/login_image.png";
import logo from "../../assets/CGL.png";

const ConfirmOtp = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email || "";
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp.length < 6)
      return toast.error("Please enter the complete OTP");

    try {
      setLoading(true);
      const { data } = await confirmOtp({ email, otp: enteredOtp });

      toast.success(data.message || "OTP verified successfully");

      navigate("/reset-password", { state: { email, otp: enteredOtp } });

    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6 w-full h-screen">
      <div className="bg-white shadow-lg rounded-md flex w-full h-full overflow-hidden">
        <div className="w-1/2 h-full hidden md:block">
          <img src={otpImage} alt="OTP Verification" className="w-full h-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 h-full p-8 flex flex-col justify-center items-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="CGL Logo" className="h-24 w-24 rounded-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center">Enter OTP</h2>
          <p className="text-center text-gray-600 mb-6">
            We have sent an OTP to <span className="font-semibold">{email}</span>
          </p>

          <form onSubmit={handleVerifyOtp} className="w-3/4 max-w-sm flex flex-col items-center">
            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  size="large"
                  className="w-12 text-center text-xl"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  required
                />
              ))}
            </div>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Verify OTP
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOtp;
