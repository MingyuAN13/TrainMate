// Required to render the page and components on the client side
"use client";

// Import general React
import React, { ChangeEvent } from "react";

// Required for the dropdown for Pickle conversion
import { Radio, RadioGroup, Tooltip } from "@nextui-org/react";

interface Props {
    setSelectedConversion: (input: string) => void;
    selectedOption: string;
}

// Pickle conversion dropdown menu
export default function ConversionSelection({ setSelectedConversion, selectedOption }: Props) {
    // Create a constant for the pickle convesion selection menu
    // Either No conversion, Pickle conversion, H5 conversion or JPEG conversion

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSelectedConversion(e.target.value);
    };

    // tooltip for pickle conversion
    const pickleTip = (
        <div>
            <h1 className="text-lg font-bold">Store mp4 frames in pickle files.</h1>
            <div>Very fast to load.</div>
            <div>Requires large storage space.</div>
        </div>
    );

    // tooltip for h5 conversion
    const h5Tip = (
        <div>
            <h1 className="text-lg font-bold">Store mp4 frames in H5 files.</h1>
            <div>Fast to load.</div>
            <div>Supports compression.</div>
        </div>
    );

    // how long to delay tooltip
    const hoverDelay = 1000;

    return (
        <div data-cy="radio" className="flex flex-col items-start ">
            {/* The selection menu */}
            <RadioGroup onChange={handleChange} value={selectedOption}>
                {/* option for no conversiona */}
                <Tooltip placement="right" delay={hoverDelay} content="Apply no conversion.">
                    <Radio key="none" value="none">
                        No Conversion
                    </Radio>
                </Tooltip>
                {/* option for pickle conversion */}
                <Tooltip placement="right" delay={hoverDelay} content={pickleTip}>
                    <Radio key="pickle" value="pickle">
                        Pickle
                    </Radio>
                </Tooltip>
                {/* option for h5 conversion */}
                <Tooltip placement="right" delay={hoverDelay} content={h5Tip}>
                    <Radio key="h5" value="h5">
                        H5
                    </Radio>
                </Tooltip>
                {/* option for jpeg conversion */}
                <Tooltip
                    placement="right"
                    delay={hoverDelay}
                    content="Convert each frame in the mp4 file into a jpeg, store as a directory."
                >
                    <Radio key="jpeg" value="jpeg">
                        JPEG
                    </Radio>
                </Tooltip>
            </RadioGroup>
        </div>
    );
}
