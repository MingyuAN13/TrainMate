"use client";

import { Chip } from "@nextui-org/react";
import React, { useState, createRef, KeyboardEvent, useMemo, FormEvent, MouseEvent, useRef, useEffect } from "react";
import { fetchTags } from "@lib/network";
import { Tag } from "@lib/types";

interface Props {
    selected: Tag[];
    onAddTag: (tag: Tag) => void;
    onTagRemove: (tagId: string) => void;
    dataCy?: string;
    type?: "custom" | "user";
}

// A custom component that views and assigns tags easily
export default function TagViewer({ selected, onAddTag, onTagRemove, dataCy, type = "custom" }: Props) {
    // The input of the search
    const [input, setInput] = useState("");
    // Wheather to show the autocomplete menu
    const [showMenu, setShowMenu] = useState(false);
    // Which item in the autocomplete menu is selected
    const [selectionIndex, setSelecetionIndex] = useState(0);
    const [tags, setTags] = useState<Tag[]>([]);
    // The refrence to the input field
    const inputRef = createRef<HTMLSpanElement>();
    // The refrence to the container of the component
    const containerRef = createRef<HTMLDivElement>();
    // Array of refrences to all autocomplete items
    const listItemRefs = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        fetchTags()
            .then((tags) => setTags(tags.filter((tag) => tag.type === type)))
            .catch((e: unknown) => console.log(e));
    }, [type]);

    // Tags to show in the autocomplete list
    const filteredTags = useMemo(() => {
        // Filter the tags by query input and what has already been selected
        setSelecetionIndex(0);
        const unused = tags.filter((tag) => !selected.some((sTag) => sTag.id === tag.id));
        return unused.filter((tag) => tag.name.toLowerCase().includes(input.toLowerCase()));
    }, [input, selected, tags]);

    const handleInput = (e: KeyboardEvent<HTMLSpanElement>) => {
        // Auto fill the selected autocomplete item when pressing enter
        if (e.key === "Enter" && inputRef.current) {
            e.preventDefault();
            if (filteredTags.length > 0) {
                onAddTag(filteredTags[selectionIndex]);
            }
            inputRef.current.innerText = "";
            setInput("");
        }
        // Move the selection up in the autocomplete menu when up arrow is pressed
        if (e.key === "ArrowUp" && selectionIndex != 0) {
            e.preventDefault();
            setSelecetionIndex(selectionIndex - 1);
        }
        // Move the selection down in the autocomplete menu when down arrow is pressed
        if (e.key === "ArrowDown" && selectionIndex != filteredTags.length - 1) {
            e.preventDefault();
            setSelecetionIndex(selectionIndex + 1);
        }
        // If no text is currently inputed, delete the last tag when pressing backspace
        if (e.key === "Backspace" && input.length === 0 && selected.length > 0) {
            e.preventDefault();
            onTagRemove(selected[selected.length - 1].id);
        }
        // Lose focus on the component when pressing escape
        if (e.key === "Escape") {
            e.preventDefault();
            inputRef.current?.blur();
        }
    };

    /**
     * When moving the selection up and down, keep the selected item in the view
     * if it goes outside the autocomplete list
     */

    useEffect(() => {
        if (listItemRefs.current[selectionIndex]) {
            const selectedItem = listItemRefs.current[selectionIndex];
            selectedItem.scrollIntoView({ block: "nearest" });
        }
    }, [selectionIndex]);

    /**
     * When the user focus on a different element
     * hide the menu
     */
    const handleBlur = () => {
        if (!inputRef.current) return;
        setShowMenu(false);
        setInput("");
        inputRef.current.textContent = "";
    };

    return (
        <div className="w-full">
            {/* Display the assigned tags */}
            <div
                onClick={() => inputRef.current?.focus()}
                className="min-h-[150px] h-full border bg-white w-full shadow-inner rounded-xl box-border p-5"
                data-cy={`${dataCy ? dataCy : ""}-tag-viewer`}
            >
                {selected.map((tag, i) => (
                    <Chip
                        key={i}
                        className="mb-1 mx-0.5 p-1"
                        onClose={() => {
                            onTagRemove(tag.id);
                            inputRef.current?.focus();
                        }}
                        size="sm"
                        variant="flat"
                        radius="sm"
                    >
                        {tag.name}
                    </Chip>
                ))}
                {/* Placeholder if the component is not selected */}
                {!showMenu && <div className="mt-0.5 ml-0.5 text-gray-400">Add tags +</div>}
                {/* Span used as an input element as it can overflow to the next line and expand with text */}
                <span
                    onFocus={() => setShowMenu(true)}
                    onBlur={handleBlur}
                    ref={inputRef}
                    contentEditable={true}
                    className="ml-1 outline-none"
                    onKeyDown={handleInput}
                    style={{ width: input.length > 1 ? input.length.toString() + "ch" : "1ch" }}
                    onInput={(e: FormEvent<HTMLSpanElement>) => {
                        setInput(e.currentTarget.textContent ? e.currentTarget.textContent : "");
                    }}
                />
            </div>
            {/* If there are any tags that can be assigned, and autcomplete should start
            display the menu */}
            {showMenu && filteredTags.length > 0 && (
                <div
                    ref={containerRef}
                    className="max-h-[120px] absolute w-full bg-white border shadow rounded-xl box-border overflow-hidden overflow-y-auto z-50"
                >
                    {filteredTags.map((tag, i) => (
                        <div
                            key={i}
                            ref={(ref) => {
                                if (ref) {
                                    listItemRefs.current[i] = ref;
                                }
                            }}
                            onMouseDown={(e: MouseEvent<HTMLDivElement>) => {
                                e.preventDefault();
                                if (!inputRef.current) return;
                                onAddTag(tag);
                                setInput("");
                                inputRef.current.textContent = "";
                                inputRef.current.focus();
                            }}
                            className={`w-full box-border px-3 py-1 text-sm hover:cursor-pointer hover:bg-gray-200 ${i === selectionIndex ? "bg-gray-200" : ""}`}
                            data-cy={`${dataCy ? dataCy : ""}-tag-selector`}
                        >
                            {tag.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
