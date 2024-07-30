"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@nextui-org/react";
import { ParameterTable, GeneralInformation } from "../[id]/parametersTable";
import { useParams } from "next/navigation";
import TagViewer from "@components/TagViewer";
import Modal from "@components/Modal";
import { Tag } from "@lib/types";

/**
 * Define the type for the task prop
 */
interface Task {
    id: string;
    token_id: string;
    name: string;
    tags: Tag[];
    status: string;
    status_code: string;
    image: string;
    start_time: string;
    time_taken: string;
    parameters: { name: string; value: string }[];
}

/**
 * The layout of the page
 */
export default function App(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const [task, setTask] = useState<Task | null>(null);
    const [selectedUserTags, setSelectedUserTags] = useState<Tag[]>([]);
    const [selectedCustomTags, setSelectedCustomTags] = useState<Tag[]>([]);
    const [showModal, setShowModal] = useState(false);

    // Combined function to fetch task and tags
    const fetchData = useCallback(async () => {
        try {
            // Fetch specific task from database
            const taskResponse = await fetch(`/api/tasks/${id}`, { credentials: "include" });
            const taskData: Task = (await taskResponse.json()) as Task;
            // Set task data from response
            setTask(taskData);

            // Define user tags and custom tags from returned task data
            const taskUserTags = taskData.tags.filter((tag) => tag.type === "user");
            const taskCustomTags = taskData.tags.filter((tag) => tag.type === "custom");
            //Set selected user tags and custom tags from taskdata
            setSelectedUserTags(taskUserTags);
            setSelectedCustomTags(taskCustomTags);
        } catch (error: unknown) {
            // Return error if fetching does not work
            console.error("Error fetching data:", error);
        }
    }, [id]);

    // Load fetchData upon loading page
    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    // Ensures removing/assigning of tags
    const addTag = async (newTags: Tag[]) => {
        const tagNames = newTags.map((tag) => tag.name);
        try {
            // Fetch from database
            await fetch(`/api/tasks/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ tags: tagNames }),
            });
        } catch (error: unknown) {
            //Return error if fetching does not work
            console.error("Error adding task:", error);
        }
        // Setch modal visibiltiy to false and refetches data
        setShowModal(false);
        void fetchData();
    };

    return (
        <div className="flex flex-col grow p-6 mx-3 overflow-auto hide-scrollbar gap-6">
            {task && (
                <>
                    {/**Printing the general information first */}
                    {/* Displays starttime, runtime, name, status, statuscode and image name */}
                    <GeneralInformation
                        starttime={task.start_time}
                        runtime={task.time_taken}
                        name={task.name}
                        status={task.status}
                        statusCode={task.status_code}
                        imageName={task.image}
                    />
                    <div className="flex flex-row w-full">
                        <div className="flex-1 my-2">
                            {/**Printing the task parameters */}
                            <div className="hide-scrollbar overflow-auto bg-white shadow rounded-2xl p-6 flex flex-row w-full gap-4">
                                {/* Only loads if task is found */}
                                <div className="flex flex-1 flex-col gap-5 ">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-2">User tags</h3>
                                        {/* Tag viewer to assign/remove user tags */}
                                        <TagViewer
                                            type="user"
                                            selected={selectedUserTags}
                                            onAddTag={(tag) => setSelectedUserTags([...selectedUserTags, tag])}
                                            onTagRemove={(id) =>
                                                setSelectedUserTags(
                                                    selectedUserTags.filter((tag: Tag) => tag.id !== id),
                                                )
                                            }
                                            dataCy="user"
                                        ></TagViewer>
                                    </div>
                                    {/* Tagviewer component that allows to see assigned tags and assign/remove tags from task */}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-2">Custom tags</h3>
                                        {/* Tag viewer to assign/remove custom tags */}
                                        <TagViewer
                                            selected={selectedCustomTags}
                                            onAddTag={(tag) => setSelectedCustomTags([...selectedCustomTags, tag])}
                                            onTagRemove={(id) =>
                                                setSelectedCustomTags(
                                                    selectedCustomTags.filter((tag: Tag) => tag.id !== id),
                                                )
                                            }
                                            dataCy="custom"
                                        ></TagViewer>
                                    </div>
                                    <div className="flex justify-center">
                                        {/* Submits tag changes */}
                                        <Button
                                            color="primary"
                                            onClick={() => setShowModal(true)}
                                            data-cy="submit-button"
                                        >
                                            {" "}
                                            Submit Tags
                                        </Button>
                                    </div>
                                </div>
                                {/* Displays table with parameters of task */}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-2">Parameters</h3>
                                    <div className="justify-center flex-1">
                                        <div>
                                            <div className="overflow-hidden whitespace-nowrap text-ellipsis  font-normal text-s mr-5">
                                                {/* Imports actual parameter table */}
                                                <ParameterTable parameters={task.parameters} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Modal that asks for confirmation of submitting */}
                    <Modal
                        title={"Submit assigned tags"}
                        body={
                            selectedUserTags.length === 0 ? (
                                <p>Cannot submit zero user tags.</p>
                            ) : (
                                `Are you sure you would like to assign the following tags:
${[...selectedUserTags, ...selectedCustomTags].map((tag) => tag.name).join(", ")}
to ${task.name}?`
                            )
                        }
                        action={"Submit"}
                        isVisible={showModal}
                        onClose={() => {
                            setShowModal(false);
                            void fetchData();
                        }}
                        onClick={() => {
                            if (selectedUserTags.length > 0) {
                                void addTag([...selectedUserTags, ...selectedCustomTags]);
                            }
                        }}
                        dataCy="submit-modal"
                        color="success"
                    />
                </>
            )}
        </div>
    );
}
