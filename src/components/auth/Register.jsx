import { useState } from "react";
import { Input, Button, Select } from "antd";
import { Link, useNavigate } from "react-router-dom";
import registerImage from "../../assets/login_image.png";
import logo from "../../assets/CGL.png";
import { registerUser } from "../../services/api";
import { toast } from "react-hot-toast";

const { Option } = Select;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
    phone: "",
    userType: "BASIC",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value) => {
    setFormData({ ...formData, userType: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registerUser(formData);
      toast.success(response.data.message || "Registration Successful");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6 w-full h-screen">
      <div className="bg-white shadow-lg rounded-md flex w-full h-full overflow-hidden">

        <div className="w-1/2 h-full hidden md:block">
          <img src={registerImage} alt="Register Illustration" className="w-full h-full object-cover" />
        </div>


        <div className="w-full md:w-1/2 h-full p-8 flex flex-col items-center overflow-hidden">
          <div className="w-full flex flex-col items-center sticky top-0 bg-white py-4 z-10">
            <img src={logo} alt="Logo" className="w-24 h-24 rounded-full object-cover mb-2" />
            <h2 className="text-2xl font-bold text-center">Welcome to CGL</h2>
            <p className="text-center mb-4">Create an account to access your dashboard</p>
          </div>
          <div className="w-full flex-grow overflow-y-auto no-scrollbar px-4">
            <form onSubmit={handleSubmit} className="w-3/4 max-w-sm mx-auto">
              <Input name="firstName" placeholder="First Name" size="large" className="mb-4 w-full" onChange={handleChange} required />
              <Input name="lastName" placeholder="Last Name" size="large" className="mb-4 w-full" onChange={handleChange} required />
              <Input name="email" placeholder="Email" size="large" className="mb-4 w-full" onChange={handleChange} required />
              <Input.Password name="password" placeholder="Password" size="large" className="mb-4 w-full" onChange={handleChange} required />
              <Input name="country" placeholder="Country" size="large" className="mb-4 w-full" onChange={handleChange} required />
              <Input name="phone" placeholder="Phone Number" size="large" className="mb-4 w-full" onChange={handleChange} required />
              <Select size="large" className="mb-4 w-full" defaultValue="BASIC" onChange={handleSelectChange}>
                <Option value="BOOK_READER">Book Reader</Option>
                <Option value="ADMIN">Admin</Option>
                <Option value="SILVER">Silver</Option>
                <Option value="GOLD">Gold</Option>
                <Option value="BASIC">Basic</Option>
              </Select>
              <Button type="primary" htmlType="submit" block size="large">
                Register
              </Button>
            </form>
          </div>
          <p className="text-center mt-4">
            Already have an account? <Link to="/login" className="text-blue-600 font-semibold">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
