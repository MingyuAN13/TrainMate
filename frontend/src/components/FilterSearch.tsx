import { Input } from "@nextui-org/react";
import { FaSearch } from "react-icons/fa";
import React from "react";

interface Props {
    // Props for the filter search component
    filterValue: string;
    setFilterValue: (value: string) => void;
    placeholder: string;
    dataCy: string;
}

export default function FilterSearch({ filterValue, setFilterValue, placeholder, dataCy }: Props) {
    // Handle changes to the search input
    const onSearchChange = (value: string) => {
        // Update the filter value when the input changes
        if (value) {
            // If the value is not empty, set the filter value to the input value
            setFilterValue(value);
        } else {
            // If the value is empty, clear the filter value
            setFilterValue("");
        }
    };

    // Handle clearing of the search input
    const onClear = () => {
        setFilterValue("");
    };

    return (
        <Input
            isClearable
            className="w-full"
            placeholder={placeholder}
            startContent={<FaSearch />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
            data-cy={`${dataCy}-search`}
        />
    );
}
