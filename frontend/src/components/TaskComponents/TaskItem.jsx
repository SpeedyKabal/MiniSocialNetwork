import React, { useState } from "react";


export default function TaskItem({ task, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [status, setStatus] = useState(task.status);
    const [priority, setPriority] = useState(task.priority);

    const handleSave = () => {
        const payload = {
            title,
            description,
            status,
            priority,
        };
        onUpdate(task.id, payload);
        setIsEditing(false);
    };

    return (
        <div className="lg:w-2/3 mx-auto bg-white rounded-lg drop-shadow-lg p-4 mb-4">
            <div className="flex justify-between items-start">
                <div>
                    {isEditing ? (
                        <input value={title} onChange={(e) => setTitle(e.target.value)} className="text-xl font-semibold mb-1" />
                    ) : (
                        <h3 className="text-xl font-semibold">{task.title}</h3>
                    )}
                    <p className="text-sm text-gray-600">By: {task.assigned_by?.user?.first_name} {task.assigned_by?.user?.last_name}</p>
                    {isEditing ? (
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full my-2 px-2 py-2 rounded bg-gray-100" />
                    ) : (
                        <p className="my-2 whitespace-pre-line">{task.description}</p>
                    )}
                    <div className="text-sm text-gray-500">Due: {task.due_date ? new Date(task.due_date).toLocaleString() : '—'}</div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                    {isEditing ? (
                        <>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-2 py-1 rounded bg-gray-100">
                                <option value="PENDING">PENDING</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-2 py-1 rounded bg-gray-100">
                                <option value="PENDING">PENDING</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-2 py-1 rounded bg-gray-100">
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                            <div className="flex gap-2">
                                <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
                                <button onClick={() => setIsEditing(false)} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-sm">{task.status}</div>
                            <div className="text-sm">{task.priority}</div>
                            <div className="flex gap-2 mt-2">
                                <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-3 py-1 rounded">Edit</button>
                                <button onClick={onDelete} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}