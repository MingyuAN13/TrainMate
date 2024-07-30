import React, { useCallback, useEffect, useState } from "react";
import { Input } from "@nextui-org/react";
import SingleSelectDropdown from "@components/SingleSelectDropdown";

// Defines the props for the ParametersComponent
interface ParametersComponentProps {
    parameterValues: Record<string, string>; // Object storing parameter values
    setParameterValues: (values: Record<string, string>) => void; // Function to update parameter values
    parameters: { value: string; label: string }[]; // Array of parameter objects
    items: { value: string; label: string }[]; // Array of item objects
}

/*
 * This component allows users to input parameter values for the selected container.
 * It dynamically generates input fields based on the provided parameters.
 */

export default function ParametersComponent({
    parameterValues,
    setParameterValues,
    parameters,
    items,
}: ParametersComponentProps): JSX.Element {
    const [selectedItem] = useState<{ value: string; label: string } | undefined>(items[0]);
    const [previousValues, setPreviousValues] = useState<{ value: string; label: string }[]>([]);

    // Handles changes to parameter input fields
    const handleParameterChange = (value: string, label: string) => {
        setParameterValues({
            ...parameterValues,
            [label]: value,
        });
    };

    // Handles changes to the selected item
    const handleSelectChange = (selectedValue: string) => {
        const selectedItem = previousValues.find((item) => item.value === selectedValue);
        if (selectedItem) {
            const updatedValues = parameters.reduce<Record<string, string>>((values, parameter) => {
                values[parameter.label] = (selectedItem[parameter.label] as string) || "";
                return values;
            }, {});
            setParameterValues(updatedValues);
        }
    };

    // Fetches stored parameters for the selected model
    // This function is called when the selected item changes
    const fetchStoredParameters = useCallback(
        async (modelName: string) => {
            try {
                const response = await fetch("/api/images/stored_parameters", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name: modelName }),
                });

                if (response.ok) {
                    const data = (await response.json()) as Record<string, Record<string, string>>[];
                    const formattedPreviousValues: { value: string; label: string }[] = data.map(
                        (params: Record<string, Record<string, string>>, index: number) => {
                            const taskName = Object.keys(params)[0];
                            const taskParams = params[taskName];
                            return {
                                value: index.toString(), // Use a unique ID instead of the index
                                label: taskName, // Label with the task name
                                ...taskParams, // Spread the parameters directly
                            };
                        },
                    );
                    console.log(formattedPreviousValues);
                    setPreviousValues(formattedPreviousValues);
                } else {
                    console.error("Failed to fetch parameters:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching parameters:", error);
            }
        },
        [setPreviousValues],
    );

    useEffect(() => {
        if (selectedItem) {
            void fetchStoredParameters(selectedItem.label);
        }
    }, [selectedItem, fetchStoredParameters]);

    return (
        // Left side component for parameter and image selection
        <div className="overflow-y-auto overflow-x-hidden w-full h-[70vh] space-y-4">
            {/* Dropdown for selecting images */}
            <SingleSelectDropdown
                type=""
                placeholder="Select Previous Run"
                data={previousValues.map((item) => item.label)}
                selected={""}
                setSelected={(value) => {
                    const selectedItem = previousValues.find((item) => item.label === value);
                    if (selectedItem) {
                        handleSelectChange(selectedItem.value);
                    }
                }}
                dataCy="previous"
            />
            {/* Loads in input fields for assigning parameter value */}
            {parameters.map((parameter) => (
                <div key={parameter.value}>
                    <label>{parameter.label.toUpperCase()}</label>
                    <Input
                        type="text"
                        label={parameter.label.toUpperCase()}
                        className={parameter.value + " parameterInput"}
                        data-cy="parameter-input"
                        value={parameterValues[parameter.label] || ""}
                        onChange={(e) => handleParameterChange(e.target.value, parameter.label)}
                        aria-label={`Parameter ${parameter.label}`}
                    />
                </div>
            ))}
        </div>
    );
}
