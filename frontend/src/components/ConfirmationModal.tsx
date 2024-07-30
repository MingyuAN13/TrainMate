import React, { useState } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@nextui-org/react";

/**
 * ConfirmationModal props for the confirmation modal
 */
interface ConfirmationModalProps {
    /**
     * Title of the modal
     */
    title: string;
    /**
     * Body of the modal
     */
    body: string;
    /**
     * The text of the primary button
     */
    confirmText: string;
    /**
     * Color of the action button
     */
    color: "success" | "danger" | "warning" | "default" | "primary" | "secondary";
    /**
     * Whether the modal is open and visible
     */
    isOpen: boolean;
    /**
     * Callback function for when the open state changes
     */
    onOpenChange: () => void;
    /**
     * Callback for clicking the action.
     *
     * Resolving the promise with a value will see it as an error and display it to the user.
     * Resolving the promise without a value will see it as a success and close the modal.
     * Rejecting the promise will show a generic error message.
     */
    onClick: () => Promise<string | null>;
    /**
     * Any other props that you want to pass to the modal.
     */
    [key: string]: unknown;
}

/**
 * A confirmation modal that can be used to confirm an action.
 */
export default function ConfirmationModal({
    title,
    body,
    isOpen,
    onOpenChange,
    onClick,
    confirmText,
    color,
    ...otherProps
}: ConfirmationModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handles the click of the confirm button
    const handleConfirm = async (onClose: () => void) => {
        try {
            setIsLoading(true);
            const result = await onClick();
            setIsLoading(false);
            // Closes the modal if the onClick function resolves without an error
            if (!result) {
                onClose();
                return;
            }
            // Displays the error if the onClick function rejects
            setError(result);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} {...otherProps}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>{title}</ModalHeader>
                        {error && (
                            <ModalBody className="mt-4">
                                <p className="text-sm text-red-500">{error}</p>
                            </ModalBody>
                        )}
                        <ModalBody>{body}</ModalBody>
                        <ModalFooter>
                            <Button
                                data-cy="cancel-button"
                                disabled={isLoading}
                                onClick={() => {
                                    onClose();
                                    setError(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                color={color}
                                disabled={isLoading}
                                onClick={() => void handleConfirm(onClose)}
                                data-cy="action-button"
                            >
                                {isLoading ? <Spinner color="white" size="sm" /> : confirmText}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
