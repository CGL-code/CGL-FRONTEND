import { useState } from "react";
import { Input, Button } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { resetPassword } from "../../services/api";
import otpImage from "../../assets/login_image.png";
import logo from "../../assets/CGL.png";

const ResetPassword = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword)
      return toast.error("Please enter both password fields");

    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");

    try {
      setLoading(true);
      const { data } = await resetPassword({ email, newPassword });
      toast.success(data.message || "Password reset successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6 w-full h-screen">
      <div className="bg-white shadow-lg rounded-md flex w-full h-full overflow-hidden">
        <div className="w-1/2 h-full hidden md:block">
          <img src={otpImage} alt="Reset Password" className="w-full h-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 h-full p-8 flex flex-col justify-center items-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="CGL Logo" className="h-24 w-24 rounded-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center">Reset Password</h2>
          <p className="text-center text-gray-600 mb-6">
            Enter a new password for <span className="font-semibold">{email}</span>
          </p>

          <form onSubmit={handleResetPassword} className="w-3/4 max-w-sm">
            <Input.Password
              placeholder="New Password"
              size="large"
              className="mb-4 w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input.Password
              placeholder="Confirm Password"
              size="large"
              className="mb-4 w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;