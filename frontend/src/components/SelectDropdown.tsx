"use client";
import React, { useState, useEffect, createRef } from "react";
import { CheckboxGroup, Checkbox, Input, Chip } from "@nextui-org/react";
import { IoFilter } from "react-icons/io5";

// You can use the component as follows:
//<SelectDropdown
// label=""
// placeholder=" Filter tags"
// data={ data }/>

interface Props {
    type: string;
    placeholder: string;
    data: string[];
    selected: string[];
    hideSelected?: boolean;
    icon?: React.ReactNode;
    setSelected: (input: string[]) => void;
    dataCy: string;
}

export default function SelectDropdown({
    type,
    placeholder,
    data,
    selected,
    setSelected,
    hideSelected,
    icon,
    dataCy,
}: Props) {
    // Checks whether or not filtering checkbox is visible
    const [isOpen, setIsOpen] = useState(false);
    // Input values which are entered from the input field
    const [inputValue, setInputValue] = useState("");

    const self = createRef<HTMLDivElement>();

    // If fitler button is clicked, filtering checkboxes are visible
    const handleInputFocus = () => {
        setIsOpen(!isOpen);
    };

    // If user types in inpput field, filtering checkboxes are visible
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (e.target.value) {
            setIsOpen(true);
        }
    };

    // Filters checkboxes based on what is enter in input field
    const filteredData = data.filter((value: string) => value.toLowerCase().includes(inputValue.toLowerCase()));

    // change the selected items based on user input
    const handleCheckboxChange = (value: string) => {
        if (selected.includes(value)) {
            setSelected(selected.filter((item) => item !== value));
        } else {
            setSelected([...selected, value]);
        }
    };

    // If checkbox is unchecked or tag is manually exited, it removes it from the loaded
    const removeChip = (chipIndex: number) => {
        const updatedSelection = [...selected];
        updatedSelection.splice(chipIndex, 1);
        setSelected(updatedSelection);
    };

    useEffect(() => {
        // If user clicks outside the element hide the menu
        const handleClickOutside = (event: MouseEvent) => {
            if (!self.current) return;
            const target = event.target as Node;
            if (isOpen && !self.current.contains(target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("pointerdown", handleClickOutside);

        // remove the listener to prevent memory leaks
        return () => {
            document.removeEventListener("pointerdown", handleClickOutside);
        };
    }, [isOpen, self]);

    return (
        <div ref={self} className="w-full relative min-w-[250px]">
            <div>
                {/* Input field which can be used for filtering tags or other data */}
                <Input
                    startContent={icon ? icon : <IoFilter />}
                    type={type}
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    data-cy={`filter-${dataCy}`}
                />
            </div>
            {/* Filtering body */}
            <div>
                {/* Filtering body only shows if isOpen property is true*/}
                {isOpen && (
                    <div className="w-full rounded-xl shadow p-2 bg-white absolute z-10" data-cy="filter-dropdown">
                        {/* Loads in chips from selected checkboxes to display the user what chips have been selected*/}
                        {/* These chips can optionally be hidden*/}
                        {!hideSelected && (
                            <div className="custom-scrollbar rounded-md">
                                {selected.map((item, index) => (
                                    <span key={index}>
                                        <Chip
                                            className="mb-1 mx-0.5 p-1"
                                            onClose={() => removeChip(index)}
                                            size="sm"
                                            variant="flat"
                                            radius="sm"
                                        >
                                            {item}
                                        </Chip>
                                    </span>
                                ))}
                            </div>
                        )}
                        {/* Checkboxgroup which contains the preloaded checkboxes from loaded data*/}
                        {filteredData.length > 0 && (
                            <CheckboxGroup
                                value={selected}
                                onChange={setSelected}
                                data-cy="checkbox-group"
                                className="pt-1 max-h-32 overflow-y-auto custom-scrollbar"
                            >
                                {/* Loads each individual checkbox */}
                                {filteredData.map((value: string, index: number) => (
                                    <Checkbox
                                        key={index}
                                        value={value}
                                        isSelected={selected.includes(value)}
                                        onChange={() => handleCheckboxChange(value)}
                                    >
                                        {value}
                                    </Checkbox>
                                ))}
                            </CheckboxGroup>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
