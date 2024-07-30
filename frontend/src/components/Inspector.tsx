"use client";

import React from "react";

import { Button } from "@nextui-org/button";
import { RxCross2 } from "react-icons/rx";

// Props for the menu
interface Props {
    // Callback for closing the menu
    onClose: () => void;
    // Contents of the menu
    children: React.ReactNode;
    dataCy: string;
}

// An inspector that can be used on the side of the table component
export default function Inspector({ onClose, children, dataCy }: Props) {
    return (
        <div className={`h-full relative p-3 overflow-hidden w-[330px]`} data-cy={`${dataCy}-sidemenu`}>
            <div className="w-full h-full p-6 flex flex-col bg-white rounded-2xl shadow">
                {/* Close button */}
                <div className="flex justify-end">
                    <Button isIconOnly variant="light" onClick={() => onClose()}>
                        <RxCross2 size={20} />
                    </Button>
                </div>
                {/* Menu contents */}
                {children}
            </div>
        </div>
    );
}
