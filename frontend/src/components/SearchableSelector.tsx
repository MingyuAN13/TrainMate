import React, { useMemo } from "react";
import {
    Button,
    Input,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Listbox,
    ScrollShadow,
    Selection,
} from "@nextui-org/react";
import { FaFilter, FaSearch } from "react-icons/fa";

export interface SearchableSelectorProps<T> {
    /**
     * The mode of selection
     */
    selectionMode: "single" | "multiple";
    /**
     * The items to display
     */
    items: T[];
    /**
     * Filter Items by search
     */
    searchFilter: (search: string, item: T) => boolean;
    /**
     * The selected items keys
     */
    selectedItemsKeys: string[];
    /**
     * Extracts the key of the item. Key must be unique and is used to identify the item.
     */
    keyExtractor: (item: T) => string;
    /**
     * Called when the selection changes
     */
    onSelectionChange: (selection: Selection) => void;
    /**
     * Renders the item in the popup
     */
    itemContent: (item: T, selected: boolean) => React.ReactNode;
    /**
     * Renders the showcase of the selected item in the button
     */
    selectionContent: (item: T) => React.ReactNode;
    /**
     * What renders in the button when there is no selection
     */
    noSelectionContent: React.ReactNode;
    /**
     * What icon to use on the button
     */
    icon?: React.ReactNode;
}

export default function SearchableSelector<T extends object>({
    selectionMode = "multiple",
    items,
    searchFilter,
    selectedItemsKeys,
    keyExtractor,
    onSelectionChange,
    itemContent,
    selectionContent,
    noSelectionContent,
    icon = <FaFilter />,
}: SearchableSelectorProps<T>) {
    const [search, setSearch] = React.useState("");

    const selectedItems = useMemo(
        () => items.filter((item) => selectedItemsKeys.includes(keyExtractor(item))),
        [items, selectedItemsKeys, keyExtractor],
    );

    const filteredItems = useMemo(
        () => items.filter((item) => searchFilter(search, item)),
        [items, search, searchFilter],
    );

    const hasSelection = selectedItems.length > 0;

    return (
        <Popover placement="bottom">
            <PopoverTrigger>
                <Button variant="flat" className="w-2/3" startContent={icon} data-cy="filter-button">
                    {hasSelection ? selectedContent(selectedItems, selectionContent) : noSelectionContent ?? "Select"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-3" data-cy="filter-popover">
                <Input
                    autoFocus
                    placeholder="Search"
                    variant="flat"
                    onChange={(e) => setSearch(e.target.value)}
                    content={search}
                    className="pb-5"
                    startContent={<FaSearch />}
                    data-cy="search-input"
                />
                <Listbox<T>
                    items={filteredItems}
                    selectedKeys={selectedItemsKeys}
                    selectionMode={selectionMode}
                    emptyContent={<div className="text-center">No results</div>}
                    onSelectionChange={onSelectionChange}
                >
                    {/* @ts-expect-error Typescript has difficulty inferring that the item content is a valid ListboxItem */}
                    {(item: T) => itemContent(item, selectedItemsKeys.includes(keyExtractor(item)))}
                </Listbox>
            </PopoverContent>
        </Popover>
    );
}

function selectedContent<T>(selectedItems: T[], selectionContent: (item: T) => React.ReactNode) {
    if (selectedItems.length === 0) {
        return null;
    }
    return (
        <ScrollShadow hideScrollBar className="w-full flex py-0.5 px-2 gap-1" orientation="horizontal">
            {selectedItems.map((item) => selectionContent(item))}
        </ScrollShadow>
    );
}
