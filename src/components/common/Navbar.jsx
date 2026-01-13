import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Avatar, Dropdown, Menu } from "antd";

import {
    LogoutOutlined,
    UserOutlined,
    ReadOutlined,
    EditOutlined,
    DatabaseOutlined,
    ProfileOutlined,
    CustomerServiceOutlined,
} from "@ant-design/icons";
import DrawerComponent from "../../utils/DrawerComponent";
import { Button } from "antd/es/radio";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [openDrawer, setOpenDrawer] = useState(false);
    const items = [
        {
            key: "1",
            label: <Link to="chapter">Chpater</Link>
        },
         {
            key: "2",
            label: <Link to="write">Book</Link>
        },
        {
            key: "3",
            label: <Link to="dscode-test">DS Code</Link>
        }
    ]

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const menu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => setOpenDrawer(true)}>
                Profile
            </Menu.Item>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <>
            <nav className="sticky top-0 z-50 bg-gray-900 text-gray-300 h-[10vh] px-10 flex justify-between items-center shadow-md">
                <div className="text-2xl font-bold tracking-wide">
                    <Link to="#" className="hover:text-gray-100 transition">CGL</Link>
                </div>

                <div className="hidden md:flex items-center gap-12 text-base font-bold">
                    <Link to="/read" className="flex items-center gap-2 hover:text-gray-100 transition">
                        <ReadOutlined /> <span>Read</span>
                    </Link>
                    {user.userType === "ADMIN" && (
                        <Link to="/write" className="flex items-center gap-2 hover:text-gray-100 transition">
                            <EditOutlined /> <span>Write</span>
                        </Link>
                    )}
                    <Link to="/database" className="flex items-center gap-2 hover:text-gray-100 transition">
                        <DatabaseOutlined /> <span>Database</span>
                    </Link>
                    <Link to="/about" className="flex items-center gap-2 hover:text-gray-100 transition">
                        <ProfileOutlined /> <span>About</span>
                    </Link>
                    <Link to="/contact" className="flex items-center gap-2 hover:text-gray-100 transition">
                        <CustomerServiceOutlined /> <span>Contact</span>
                    </Link>
                </div>

                      <Dropdown menu={{items}}>
                        <Button>Menu</Button>
                      </Dropdown>

                <Dropdown overlay={menu} placement="bottomRight">
                    <Avatar className="cursor-pointer bg-white border-1 text-black font-bold shadow-md" size={35}>
                        {user.firstName[0]}
                    </Avatar>
                </Dropdown>
            </nav>


            <DrawerComponent open={openDrawer} onClose={() => setOpenDrawer(false)} user={user} />
        </>
    );
};

export default Navbar;
