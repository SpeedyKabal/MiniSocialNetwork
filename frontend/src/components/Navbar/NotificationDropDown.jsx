import { useState } from 'react'
import { Bell } from 'lucide-react'

function NotificationDropDown() {
    const notificationData = [
        {
            id: 1,
            content: "John Doe commented on your post",
            type: "comment",
            timestamp: "2 hours ago"
        },
        {
            id: 2,
            content: "Jane Smith liked your post",
            type: "like",
            timestamp: "3 hours ago"
        },
        {
            id: 3,
            content: "Mike Johnson disliked your post",
            type: "dislike",
            timestamp: "5 hours ago"
        },
        {
            id: 4,
            content: "Sarah Williams commented on your post",
            type: "comment",
            timestamp: "1 day ago"
        },
        {
            id: 5,
            content: "Alex Brown liked your post",
            type: "like",
            timestamp: "2 days ago"
        }
    ];

    return (

        <ul className='absolute top-[110%] -translate-x-[50%] left-0 w-64 h-48 overflow-scroll flex flex-col gap-2 bg-teal-100 rounded-lg shadow-lg py-1 z-20'>
            {notificationData.map((notification) => (
                <li key={notification.id} className="cursor-pointer hover:bg-blue-200 rounded-lg px-2 py-1 h-18 flex flex-col justify-between"
                    onClick={() => {
                        console.log(notification.id)
                    }}
                >
                    <p className='text-red-800 text-md'>{notification.content}</p>
                    <p className='text-sm ml-auto'>{notification.timestamp}</p>
                </li>
            ))}

        </ul>
    )
}

export default NotificationDropDown
