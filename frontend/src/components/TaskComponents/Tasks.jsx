import React, { useEffect, useState } from "react";
import api from "../../api";
import TaskItem from "./TaskItem";
import { useTranslation } from "react-i18next";
import { useUser } from "../../Contexts/Usercontext";

export default function Tasks() {
    const currentUser = useUser();
    const [tasks, setTasks] = useState([]);
    const [assignableEmployees, setAssignableEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedToId, setAssignedToId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("MEDIUM");

    const { t } = useTranslation();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/task/");
            setTasks(res.data.tasks ?? []);
            setAssignableEmployees(res.data.assignable_employees ?? []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!title) return;
        try {
            const payload = new FormData();
            payload.append("title", title);
            payload.append("description", description);
            if (assignedToId) payload.append("assigned_to_id", assignedToId);
            if (dueDate) payload.append("due_date", dueDate);
            payload.append("priority", priority);

            const res = await api.post("/api/task/", payload);
            if (res.status === 201) {
                setTitle("");
                setDescription("");
                setAssignedToId("");
                setDueDate("");
                setPriority("MEDIUM");
                fetchTasks();
            }
        } catch (err) {
            console.error(err);
            alert(err?.response?.data || "Failed to create task");
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/task/${id}/`);
            fetchTasks();
        } catch (err) {
            console.error(err);
            alert("Failed to delete");
        }
    };

    const handleUpdate = async (id, data) => {
        try {
            const res = await api.put(`/api/task/${id}/`, data);
            if (res.status === 200) fetchTasks();
        } catch (err) {
            console.error(err);
            alert("Failed to update");
        }
    };

    return (
        <div className="w-full">
            <div className="bg-white rounded-lg drop-shadow-lg p-4 lg:p-6 mt-6 mx-auto lg:w-2/3">
                <h3 className="text-xl font-semibold mb-2">{t("home.creatTask")}</h3>
                <input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mb-2 px-2 py-2 rounded bg-gray-100"
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full mb-2 px-2 py-2 rounded bg-gray-100"
                />
                <div className="flex gap-2 mb-2">
                    <select
                        value={assignedToId}
                        onChange={(e) => setAssignedToId(e.target.value)}
                        className="px-2 py-2 rounded bg-gray-100"
                    >
                        <option value="">{t("home.assignTo")}</option>
                        {assignableEmployees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="px-2 py-2 rounded bg-gray-100"
                    />
                    <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-2 py-2 rounded bg-gray-100">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>
                <div className="flex justify-end">
                    <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
                </div>
            </div>

            <div className="flex flex-col items-center">
                <h2 className="text-black text-[2rem] text-center my-2">To do</h2>
                {loading && <div>Loading...</div>}
                {tasks.map((t) => (
                    <TaskItem key={t.id} task={t} onDelete={() => handleDelete(t.id)} onUpdate={handleUpdate} />
                ))}
            </div>
        </div>
    );
}