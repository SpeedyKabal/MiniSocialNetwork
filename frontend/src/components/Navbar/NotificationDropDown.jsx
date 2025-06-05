import { useState, useEffect } from 'react'
import api from "../../api";
import { Link } from "react-router-dom";
import { formatTime } from '../../services/Utilities';


function NotificationDropDown() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        await api.get("api/notifications/").then((res) => {
            const sorted = res.data.sort((a, b) => b.post.id - a.post.id);
            setNotifications(sorted);
        }).catch((err) => alert(err));
    }

    return (

        <ul className='absolute top-[110%] -translate-x-[50%] left-0 w-64 h-48 overflow-y-auto flex flex-col gap-2 bg-teal-100 rounded-lg shadow-lg py-1 z-20'>
            {notifications.map((notification) => (

                <li key={notification.id} className="cursor-pointer hover:bg-blue-200 rounded-lg px-2 py-1 flex flex-col justify-between">
                    <Link to={`/post/${notification.post.id}`}>
                        <p className='text-red-800 text-md'>{notification.message}</p>
                        <p className='text-sm ml-auto'>{formatTime(notification.timeCreated)}</p>
                    </Link>
                </li>
            ))}

        </ul>
    )
}

export default NotificationDropDown;
