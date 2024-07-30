"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RunButton, NameTask } from "./RightSideComponents";
import { TagSelector } from "@components/TagSelector";
import { Tag, File } from "@lib/types";
import FileExplorer, { useFileExplorerState } from "@app/app/files/FileExplorer";
import ParametersComponent from "./parameters";
import { useRouter } from "next/navigation";
import SingleSelectDropdown from "@components/SingleSelectDropdown";

// Defines the model properties
interface ModelProp {
    id: number; // Model ID
    name: string; // Model name
    sylabs_path: string; // Path to Sylabs container
    parameters: { name: string }[]; // Array of parameter names
}

/*
 * Main application component that combines all the subcomponents.
 * Manages state and handles interactions between different parts of the UI.
 */
export default function TaskRun(): JSX.Element {
    const [selectedModel, setSelectedModel] = useState<string>(""); // State for the selected model
    const [error, setError] = useState<string | null>(null); // State for error messages

    const [output, setOutput] = useState<string>(""); // State for output label
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]); // State for selected tags
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // State for selected files
    const [parameterValues, setParameterValues] = useState<Record<string, string>>({}); // State for parameter values
    const [modelParameters, setModelParameters] = useState<{ value: string; label: string }[]>([]); // State for model parameters
    const [models, setModels] = useState<{ value: string; label: string }[]>([]); // State for available models
    const [modelData, setModelData] = useState<Record<string, { value: string; label: string }[]>>({}); // State for model data

    const fileExplorerState = useFileExplorerState();

    const router = useRouter();

    // Handles the run action and sends the data to the backend
    const handleRun = async () => {
        try {
            // Format parameters for the payload
            const parameters = Object.keys(parameterValues).map((key) => ({
                name: key,
                value: parameterValues[key],
            }));

            const selectedModelName = models.find((model) => model.label === selectedModel)?.label ?? "";

            const filesArray = selectedFiles.map((file) => file.index); // Get file indice

            const selectedTagsIds = selectedTags.map((tag) => tag.name.toString());

            const payload = {
                name: output,
                image: selectedModelName,
                input: filesArray,
                parameters: parameters,
                tags: selectedTagsIds,
            };

            console.log(payload);

            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            interface ResponseData {
                message: string;
            }

            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                // Use optional chaining
                const data: ResponseData = (await response.json()) as ResponseData; // Ensure proper type
                if (!response.ok) {
                    setError(data.message); // TypeScript knows data has a message
                } else {
                    setError(null);
                    router.push("/app/tasks");
                }
            } else {
                const errorText = await response.text();
                setError(`Error creating task: ${errorText}`);
                console.error("Error creating task:", errorText);
                console.error("Error creating task:", error);
            }
        } catch (error: unknown) {
            // Use unknown instead of any
            setError("Error creating task: " + (error instanceof Error ? error.message : "unknown error")); // Type-safe error handling
            console.error("Error creating task:", error);
        }
    };

    // Function to fetch parameters for the selected model
    const fetchParameters = useCallback(
        (model: string) => {
            try {
                const modelLabels: string[] = models.map((model) => model.label);
                const selectedModelData = modelLabels.find((m) => m === model);

                console.log(modelData);

                if (selectedModelData) {
                    const parameters = modelData[model] ?? [];
                    setModelParameters(parameters);
                }
            } catch (error) {
                setError("Error fetching parameters: " + (error instanceof Error ? error.message : "unknown error"));
            }
        },
        [modelData, models],
    );

    // Function to fetch all models when the page loads
    const fetchModels = async () => {
        try {
            const response = await fetch("/api/images", { credentials: "include" });
            const data: ModelProp[] = (await response.json()) as ModelProp[];

            // Format models for the dropdown
            const formattedModels = data.map((model) => ({
                value: model.id.toString(),
                label: model.name,
            }));

            // Create a mapping of model parameters

            const modelParameterData = data.reduce<Record<string, { value: string; label: string }[]>>((acc, model) => {
                acc[model.name.toString()] = model.parameters.map((param) => {
                    const jsonParam = JSON.stringify(param);
                    const match = jsonParam.match(/"(.*?)"/);
                    const value = match ? match[1] : jsonParam; // Extracts the string between quotes or uses the full string if no match

                    return {
                        value: value,
                        label: value,
                    };
                });

                return acc;
            }, {});

            setModels(formattedModels);
            setModelData(modelParameterData);
            setError(null);
        } catch (error) {
            setError("Error fetching models: " + (error instanceof Error ? error.message : "unknown error"));
        }
    };

    // Fetch parameters whenever selectedModel changes
    useEffect(() => {
        if (selectedModel) {
            fetchParameters(selectedModel);
        }
    }, [selectedModel, fetchParameters]);

    // Fetch all models when the component mounts
    useEffect(() => {
        void fetchModels();
    }, []);

    return (
        <div className="grow p-6 rounded-2xl shadow m-3 flex flex-col bg-white">
            {error && (
                <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                    data-cy="error-message"
                >
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div className="flex flex-grow">
                <div className="w-1/2 mr-2.5 space-y-4">
                    <div>
                        <SingleSelectDropdown
                            type=""
                            placeholder="Select Image"
                            data={models.map((model) => model.label)}
                            selected={selectedModel}
                            setSelected={setSelectedModel}
                            dataCy="image"
                        />
                    </div>
                    {selectedModel && (
                        <div>
                            <ParametersComponent
                                parameterValues={parameterValues}
                                setParameterValues={setParameterValues}
                                parameters={modelParameters}
                                items={models}
                            />
                        </div>
                    )}
                </div>
                <div className="w-1/2 ml-2.5 space-y-4">
                    <div className="w-full overflow-visible">
                        <div className="w-full">
                            <FileExplorer
                                fileExporerState={fileExplorerState}
                                onSelectedFiles={setSelectedFiles}
                                singleSelect={false}
                                showUploadButton={false}
                            />
                        </div>
                    </div>
                    <div>
                        <NameTask output={output} setOutput={setOutput} />
                    </div>
                    <div>
                        <TagSelector type="both" setSelectedTags={setSelectedTags} />
                    </div>
                    <div>
                        <RunButton handleRun={handleRun} />
                    </div>
                </div>
            </div>
        </div>
    );
}
