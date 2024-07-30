"use client";
import React, { useState, useEffect } from "react";
import TaskTable from "./taskTable";

export default function Task() {
    // Set constants
    const [tasks, setTasks] = useState<Task[]>([]);

    // Define the type for the task prop
    interface Task {
        id: string;
        token_id: string;
        name: string;
        image: string;
        tags: { id: string; name: string; type: string }[];
        status: string;
    }

    // Function to fetch all tasks when the page loads in
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                // fetch all tasks from the database
                const response = await fetch("/api/tasks", { credentials: "include" });
                const data: Task[] = (await response.json()) as Task[];
                // Update the UI
                setTasks(data);
            } catch (error) {
                console.error("Error fetching tags:", error);
            }
        };
        void fetchTasks();
    }, []);

    return (
        <div className="grow h-full p-6 mx-3">
            {/* Loads in the task table */}
            <TaskTable tasks={tasks} />
        </div>
    );
}
