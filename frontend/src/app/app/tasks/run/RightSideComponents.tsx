"use client";

import React from "react";
import { Input } from "@nextui-org/react";

/*
 * This component can start the task with its parameters.
 */
interface RunButtonProps {
    handleRun: () => Promise<void>; // Change the signature to indicate the function returns a Promise
}

function RunButton({ handleRun }: RunButtonProps): JSX.Element {
    // Wrap the handleRun function in a synchronous wrapper
    const wrappedHandleRun = () => {
        void (async () => {
            await handleRun();
        })();
    };

    return (
        <div className="w-[95%] h-[10%]">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded submitButton"
                data-cy="submitButton"
                onClick={wrappedHandleRun}
            >
                Run
            </button>
        </div>
    );
}

// Creates the interface for the outputLabel component
interface OutputLabelProps {
    output: string;
    setOutput: (output: string) => void;
}

/*
 * This component allows you to set the name of the created container
 */
function NameTask({ output, setOutput }: OutputLabelProps): JSX.Element {
    return (
        <div className="w-full h-1/10">
            <label>Task Name</label>
            <Input
                type="text"
                value={output}
                className="output"
                data-cy="output"
                onChange={(e) => setOutput(e.target.value)}
                label="name model"
                aria-label="Output Name"
            />
        </div>
    );
}

// Export the components
export { RunButton, NameTask };
