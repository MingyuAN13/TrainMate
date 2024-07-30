import React, { useState } from "react";
import { Input, Chip, Button } from "@nextui-org/react";

// Property types
interface Props {
    title: string;
    className: string;
    onChipsChange: (chips: string[]) => void;
}

export default function MultipleInput({ title, className, onChipsChange }: Props) {
    const [chips, setChips] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState<string>("");

    // Adds a new chip when the button is clicked
    const handleAddChip = () => {
        if (inputValue.trim() && !chips.includes(inputValue.trim())) {
            const updatedChips = [...chips, inputValue.trim()];
            setChips(updatedChips);
            // Notifies parent components
            onChipsChange(updatedChips);
            // Resets input value
            setInputValue("");
        }
    };

    // Removes chip if pressed on exit button
    const removeChip = (chipIndex: number) => {
        const updatedChips = chips.filter((chip, index) => index !== chipIndex);
        setChips(updatedChips);
        // Notifies parent component
        onChipsChange(updatedChips);
    };
    // Checks what is enters in input field and sets to inputvalue
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };
    return (
        // Allows styling do be defined in parent file
        <div className={className}>
            {/* Header above the component */}
            <h1 className="font-semibold mb-1">{title}</h1>
            <div className="flex flex-col gap-2">
                {/* Input to enter parameter */}
                <Input
                    variant="bordered"
                    label="Enter parameter"
                    value={inputValue}
                    onChange={handleInputChange}
                    data-cy="parameter-input"
                />
                {/* Confirm addition of parameter, adds as chip */}
                <Button
                    onClick={handleAddChip}
                    color="primary"
                    size="md"
                    className="justify-self-center"
                    data-cy="parameter-button"
                >
                    Add new parameter
                </Button>
            </div>
            {/* Loads in chips of all created parameters */}
            <div className="flex flex-wrap gap-1 mt-2" data-cy="parameter-chips">
                {chips.map((chip, index) => (
                    <Chip
                        key={index}
                        size="sm"
                        color="primary"
                        className="mr-1"
                        variant="flat"
                        onClose={() => removeChip(index)}
                    >
                        {chip}
                    </Chip>
                ))}
            </div>
        </div>
    );
}
