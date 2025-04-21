import { useState, useEffect } from 'react'
import api from "../../api";
import { Bell } from 'lucide-react'

function NotificationDropDown() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        await api.get("api/notifications/").then((res) => {
            setNotifications(res.data);
        }).catch((err) => alert(err));
    }

    return (

        <ul className='absolute top-[110%] -translate-x-[50%] left-0 w-64 h-48 overflow-scroll flex flex-col gap-2 bg-teal-100 rounded-lg shadow-lg py-1 z-20'>
            {notifications.map((notification) => (
                <li key={notification.id} className="cursor-pointer hover:bg-blue-200 rounded-lg px-2 py-1 h-18 flex flex-col justify-between"
                    onClick={() => {
                        console.log(notification.id)
                    }}
                >
                    <p className='text-red-800 text-md'>{notification.message}</p>
                    <p className='text-sm ml-auto'>{notification.timestamp}</p>
                </li>
            ))}

        </ul>
    )
}

export default NotificationDropDown;
