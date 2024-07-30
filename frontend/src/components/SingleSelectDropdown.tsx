"use client";
import React, { useState, useEffect, createRef } from "react";
import { CheckboxGroup, Checkbox, Input } from "@nextui-org/react";
import { AiOutlineContainer } from "react-icons/ai";

interface Props {
    type: string;
    placeholder: string;
    data: string[];
    selected: string;
    hideSelected?: boolean;
    icon?: React.ReactNode;
    setSelected: (input: string) => void;
    dataCy: string;
}

export default function SingleSelectDropdown({ type, placeholder, data, selected, setSelected, icon, dataCy }: Props) {
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
        setIsOpen(true);
    };

    const handleCheckboxChange = (value: string) => {
        if (value === selected) {
            setSelected(""); // Deselect if the same value is clicked
            setInputValue("");
        } else {
            setSelected(value);
            setInputValue(value);
        }
        setIsOpen(false); // Close the dropdown after selection
    };

    // Filters checkboxes based on what is enter in input field
    const filteredData = data.filter((value: string) => value.toLowerCase().includes(inputValue.toLowerCase()));
    // Useeffect which disables the dropdown if clicked outside of teh element
    useEffect(() => {
        // If user clicks outside the element hide the menu
        const handleClickOutside = (event: MouseEvent) => {
            if (!self.current) return;
            const target = event.target as Node;
            if (isOpen && !self.current.contains(target)) {
                setIsOpen(false);
            }
        };
        // handles outside click
        document.addEventListener("pointerdown", handleClickOutside);

        // remove the listener to prevent memory leaks
        return () => {
            document.removeEventListener("pointerdown", handleClickOutside);
        };
    }, [isOpen, self]);

    useEffect(() => {
        setInputValue(selected); // Update input value when selected changes
    }, [selected]);

    return (
        <div ref={self} className="w-[250px]">
            <div>
                {/* Input field which can be used for filtering tags or other data */}
                <Input
                    startContent={icon ? icon : <AiOutlineContainer />}
                    type={type}
                    placeholder={selected || placeholder}
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    data-cy={`filter-${dataCy}`}
                />
            </div>
            {/* Filtering body */}
            <div className="pt-1">
                {/* Filtering body only shows if isOpen property is true*/}
                {isOpen && (
                    <div
                        className="w-[250px] rounded-xl shadow p-2 bg-white absolute z-10"
                        data-cy={`filter-dropdown-${dataCy}`}
                    >
                        {/* Checkboxgroup which contains the preloaded checkboxes from loaded data*/}
                        {filteredData.length > 0 && (
                            <CheckboxGroup
                                value={selected ? [selected] : []}
                                onChange={(values) =>
                                    handleCheckboxChange(values.length > 0 ? values[values.length - 1] : "")
                                }
                                data-cy={`checkbox-group-${dataCy}`}
                                className="pt-1 max-h-32 overflow-y-auto custom-scrollbar"
                            >
                                {/* Loads in each individual checkbox */}
                                {filteredData.map((value: string, index: number) => (
                                    <Checkbox key={index} value={value}>
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
