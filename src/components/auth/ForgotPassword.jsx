import { useState } from "react";
import { Input, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import forgotImage from "../../assets/login_image.png";
import logo from "../../assets/CGL.png";
import { forgotPassword } from "../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) return toast.error("Please enter your email");

    try {
      setLoading(true);
      const { data } = await forgotPassword({ email });

      toast.success(data.message || "OTP sent to your email");

      navigate("/confirm-otp", { state: { email } });

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6 w-full h-screen">
      <div className="bg-white shadow-lg rounded-md flex w-full h-full overflow-hidden">

        <div className="w-1/2 h-full hidden md:block">
          <img src={forgotImage} alt="Forgot Password Illustration" className="w-full h-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 h-full p-8 flex flex-col justify-center items-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="CGL Logo" className="h-24 w-24 rounded-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center">Forgot Password?</h2>
          <p className="text-center text-gray-600 mb-6">
            Enter your email and we'll send you a password reset OTP.
          </p>

          <form onSubmit={handleSubmit} className="w-3/4 max-w-sm">
            <Input
              type="email"
              placeholder="Enter your email"
              size="large"
              className="mb-4 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Send OTP
            </Button>
          </form>

          <p className="text-center mt-4">
            Remembered your password? <Link to="/login" className="text-blue-600 font-semibold">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
