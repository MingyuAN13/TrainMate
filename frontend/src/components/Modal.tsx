import React from "react";
import { Button } from "@nextui-org/react";
import { RxCross2 } from "react-icons/rx";

{
    /* Modal properties */
}
interface Props {
    title: string;
    body: React.ReactNode;
    action: string;
    onClose: () => void;
    isVisible: boolean;
    onClick: () => void;
    dataCy: string;
    color: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined;
}

// This is a confirmation Modal
export default function Modal({ title, body, action, onClose, isVisible, onClick, dataCy, color }: Props) {
    // Determines if the modal shows
    if (!isVisible) return null;

    // Return the component contents
    return (
        //Blur behind the modal
        <div
            className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center"
            style={{ zIndex: 1000 }}
        >
            {/* Full modal */}
            <div className="w-[600px]" data-cy={dataCy}>
                {/* White background for modal area */}
                <div className="bg-white p-6 rounded-lg">
                    {/* Header of modal */}
                    <div className="flex flex-row justify-between">
                        {/* Title for modal */}
                        <div className="flex items-center">
                            <h1 className="font-bold text-xl tracking-wide ml-3">{title}</h1>
                        </div>
                        {/* Exit button for modal */}
                        <Button isIconOnly variant="light" onClick={onClose} data-cy={`${dataCy}-exit`}>
                            <RxCross2 />
                        </Button>
                    </div>
                    {/* Body of modal */}
                    <pre className="ml-3 py-6 font-sans">{body}</pre>
                    {/* Footer of modal */}
                    <div className="flex justify-end space-x-2">
                        {/* Button to close modal */}
                        <Button
                            radius="full"
                            color="primary"
                            variant="ghost"
                            onClick={onClose}
                            data-cy={`${dataCy}-cancel`}
                        >
                            {" "}
                            Cancel{" "}
                        </Button>
                        {/* Button that can confirm/redirect user after action accepted */}
                        <Button
                            radius="full"
                            color={color}
                            variant="ghost"
                            onClick={onClick}
                            className={""}
                            data-cy={`${dataCy}-action`}
                        >
                            {" "}
                            {action}{" "}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
