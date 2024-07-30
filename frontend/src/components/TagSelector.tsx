import React, { useMemo, useState } from "react";
import { Chip, ListboxItem, Selection } from "@nextui-org/react";
import { useAsyncList } from "react-stately";
import { FaTag, FaUser } from "react-icons/fa";
import SearchableSelector from "@components/SearchableSelector";
import { Tag } from "@lib/types";

export interface TagChipProps {
    /**
     * The variant of the tag chip.
     */
    variant?: "dot" | "flat" | "solid" | "bordered" | "light" | "faded" | "shadow";
    /**
     * The tag object to display in the tag chip.
     */
    tag: Tag;
}

// A component for the tag chips
export function TagChip({ tag, variant = "flat" }: TagChipProps) {
    const color = tag.type === "user" ? "primary" : "danger";
    return (
        <Chip color={color} size="sm" variant={variant}>
            {tag.name}
        </Chip>
    );
}

// A helper component for the tag selector. It displays the tags in the selector list.
function TagSelectorItem(tag: Tag) {
    if (tag.type === "user") {
        return (
            <ListboxItem
                key={tag.id.toString()}
                color="primary"
                className="text-primary"
                startContent={<FaUser />}
                data-cy="tag-selector-item"
            >
                {tag.name}
            </ListboxItem>
        );
    }

    return (
        <ListboxItem
            key={tag.id.toString()}
            color="danger"
            className="text-danger"
            startContent={<FaTag />}
            data-cy="tag-selector-item"
        >
            {tag.name}
        </ListboxItem>
    );
}
interface TagSelectorProps {
    type: "custom" | "user" | "both";
    setSelectedTags: (tags: Tag[]) => void;
}

/**
 * A component for the tag selector. It allows the user to select tags all of the tags.
 * It will dynamically fetch the tags from the server and display them in the selector list.
 * @param setSelectedTags - A function that will be called when the tag selection changes.
 * @param type - Type of the tag that can be selected.
 */
export function TagSelector({ setSelectedTags, type: tagType }: TagSelectorProps) {
    const [selectedTagsIds, setSelectedTagsIds] = useState<string[]>([]);

    const icon = useMemo(() => {
        if (tagType === "user") {
            return <FaUser />;
        } else if (tagType === "custom") {
            return <FaTag />;
        } else {
            return <FaUser />;
        }
    }, [tagType]);

    // Fetch the tags from the server and store them in the state
    const tags = useAsyncList<Tag>({
        async load({ signal }) {
            const response = await fetch("/api/tags", { signal });
            const json: Tag[] = (await response.json()) as Tag[];
            let tags = json;
            if (tagType !== "both") {
                tags = json.filter((tag) => tag.type === tagType);
            }
            return { items: tags };
        },
    });

    // Update the selected tags and notify the parent component
    const selectTags = (ids: string[]) => {
        setSelectedTagsIds(ids);
        const selectedTags = tags.items.filter((tag) => ids.includes(tag.id.toString()));
        setSelectedTags(selectedTags);
    };

    // Convert the selection object to a string array
    const select = (selection: Selection) => {
        if (selection === "all") {
            setSelectedTagsIds(tags.items.map((tag) => tag.id.toString()));
            return;
        }
        const ids: string[] = [];
        // Convert the selection to a string array.
        // Because the selection doesn't have a well-defined type, will just convert it to a string array.
        selection.forEach((key) => {
            ids.push(key.toString());
        });
        selectTags(ids);
    };

    return (
        <SearchableSelector
            selectionMode="multiple"
            items={tags.items}
            searchFilter={(search, tag) => tag.name.toLowerCase().includes(search.toLowerCase())}
            selectedItemsKeys={selectedTagsIds}
            keyExtractor={(tag) => tag.id.toString()}
            onSelectionChange={select}
            itemContent={TagSelectorItem}
            selectionContent={(tag) => <TagChip variant="solid" tag={tag} />}
            noSelectionContent={<div>{tagType === "user" ? "Filter Users" : "Filter Tags"}</div>}
            data-cy="tag-selector"
            icon={icon}
        />
    );
}
