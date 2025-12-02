import { Drawer, Avatar } from "antd";
import { MailOutlined, PhoneOutlined, FlagOutlined, CalendarOutlined } from "@ant-design/icons";

const DrawerComponent = ({ open, onClose, user }) => {
    return (
        <Drawer 
            title={
                <div className="flex items-center space-x-3">
                    <Avatar size={64} className="bg-blue-500 text-white text-xl">
                        {user.firstName[0]}
                    </Avatar>
                    <div>
                        <h2 className="text-lg font-semibold">{user.firstName} {user.lastName}</h2>
                        <p className="text-gray-500">{user.userType}</p>
                    </div>
                </div>
            }
            placement="right"
            onClose={onClose}
            open={open}
            width={380}
            className="custom-drawer"
        >
            <div className="p-4 space-y-4 text-gray-700">
                <p className="flex items-center space-x-2">
                    <MailOutlined className="text-blue-500 text-lg" />
                    <span className="font-medium">{user.email}</span>
                </p>
                <p className="flex items-center space-x-2">
                    <PhoneOutlined className="text-green-500 text-lg" />
                    <span>{user.phone}</span>
                </p>
                <p className="flex items-center space-x-2">
                    <FlagOutlined className="text-red-500 text-lg" />
                    <span>{user.country}</span>
                </p>
                <p className="flex items-center space-x-2">
                    <CalendarOutlined className="text-gray-500 text-lg" />
                    <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                </p>
            </div>
        </Drawer>
    );
};

export default DrawerComponent;
