/**
 * SPDX-License-Identifier: Apache-2.0
 * Copyright 2024 - 2025 Waldiez & contributors
 */
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { FaTrashCan } from "react-icons/fa6";

import {
    HandoffAvailability,
    HandoffCondition,
    MessageInput,
    Modal,
    TabItem,
    TabItems,
} from "@waldiez/components";
import { useWaldiezEdgeModal } from "@waldiez/containers/edges/modal/hooks";
import { WaldiezEdgeBasicTab } from "@waldiez/containers/edges/modal/tabs/basic";
import { WaldiezEdgeMessageTab } from "@waldiez/containers/edges/modal/tabs/message";
import {
    DEFAULT_NESTED_CHAT_MESSAGE_METHOD_CONTENT,
    WaldiezEdgeNestedTab,
} from "@waldiez/containers/edges/modal/tabs/nested";
import type { WaldiezEdgeModalProps } from "@waldiez/containers/edges/modal/types";
import type {
    WaldiezGroupChatType,
    WaldiezHandoffAvailability,
    WaldiezHandoffCondition,
    WaldiezMessage,
    WaldiezMessageType,
} from "@waldiez/types";

/**
 * Modal component for editing edge properties
 */
export const WaldiezEdgeModal = memo((props: WaldiezEdgeModalProps) => {
    const { edgeId, isOpen, onClose } = props;

    // Get edge data and handlers from custom hook
    const {
        flowId,
        edge,
        edgeData,
        edgeType,
        isDark,
        isDirty,
        isRagUserProxy,
        sourceAgent,
        targetAgent,
        onDataChange,
        onTypeChange,
        onCancel,
        onDelete,
        onSubmit,
    } = useWaldiezEdgeModal(props);

    // Tab state
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    // Reset to first tab when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTabIndex(0);
        }
    }, [isOpen]);

    // If missing required data, return empty fragment
    /* eslint-disable react-hooks/rules-of-hooks */
    if (!edgeData || !edge || edgeType === "hidden" || !sourceAgent || !targetAgent) {
        return null;
    }

    /**
     * Save changes and close modal
     */
    const onSaveAndClose = useCallback(() => {
        onSubmit();
        onClose();
    }, [onSubmit, onClose]);

    /**
     * Update handoff condition
     */
    const onConditionChange = useCallback(
        (condition: WaldiezHandoffCondition) => {
            onDataChange({ condition });
        },
        [onDataChange],
    );

    /**
     * Update handoff availability
     */
    const onAvailabilityChange = useCallback(
        (available: WaldiezHandoffAvailability) => {
            onDataChange({ available });
        },
        [onDataChange],
    );

    // Create delete button for modal header
    const beforeTitle = useMemo(
        () => (
            <FaTrashCan
                className="clickable"
                onClick={onDelete}
                title="Delete edge"
                aria-label="Delete edge"
            />
        ),
        [onDelete],
    );

    // Determine group chat type based on edge properties
    const groupChatType = useMemo<WaldiezGroupChatType>(() => {
        if (edgeType !== "group") {
            return "none";
        }

        if (edgeData.targetType === "group_manager") {
            return "toManager";
        }
        if (edgeData.sourceType === "group_manager") {
            return "fromManager";
        }
        if (!targetAgent.parentId) {
            return "nested";
        }

        return "handoff";
    }, [edgeType, edgeData?.targetType, edgeData?.sourceType, targetAgent?.parentId]);

    // Generate IDs for tabs
    const tabIds = useMemo(
        () => ({
            properties: `wc-${flowId}-edge-properties-${edgeId}`,
            message: `wc-${flowId}-edge-message-${edgeId}`,
            nested: `wc-${flowId}-edge-nested-${edgeId}`,
            condition: `wc-${flowId}-edge-condition-${edgeId}`,
            availability: `wc-${flowId}-edge-availability-${edgeId}`,
        }),
        [flowId, edgeId],
    );

    // Set button test IDs
    const testIds = useMemo(
        () => ({
            modal: `edge-modal-${edgeId}`,
            cancel: `modal-cancel-btn-${edgeId}`,
            saveAndClose: `modal-submit-and-close-btn-${edgeId}`,
            save: `modal-submit-btn-${edgeId}`,
        }),
        [edgeId],
    );

    // Set current nested message input based on group chat type
    const currentNestedMessageInput = useMemo(() => {
        return (
            edgeData.nestedChat.message || {
                type: "string" as WaldiezMessageType,
                content: "",
                context: {},
            }
        );
    }, [edgeData.nestedChat.message]);

    const noOp = useCallback(() => {}, []);

    // Handle nested message type change
    const onNestedMessageTypeChange = useCallback(
        (type: WaldiezMessageType) => {
            const updatedMessage = {
                ...edgeData.nestedChat.message,
                content: edgeData.nestedChat.message?.content || "",
                context: edgeData.nestedChat.message?.context || {},
                type,
            };
            onDataChange({
                nestedChat: {
                    ...edgeData.nestedChat,
                    message: updatedMessage,
                },
            });
        },
        [onDataChange, edgeData.nestedChat],
    );

    // Handle nested message change
    const onNestedMessageChange = useCallback(
        (message: WaldiezMessage) => {
            onDataChange({
                nestedChat: {
                    ...edgeData.nestedChat,
                    message,
                },
            });
        },
        [onDataChange, edgeData.nestedChat],
    );

    return (
        <Modal
            flowId={flowId}
            isOpen={isOpen}
            onClose={onClose}
            onSaveAndClose={onSaveAndClose}
            beforeTitle={beforeTitle}
            title={edgeData.label}
            dataTestId={testIds.modal}
            hasUnsavedChanges={isDirty}
            preventCloseIfUnsavedChanges
        >
            <div className="modal-body edge-modal">
                {edgeType === "group" ? (
                    <TabItems activeTabIndex={activeTabIndex}>
                        <TabItem label="Properties" id={tabIds.properties}>
                            <WaldiezEdgeBasicTab
                                edgeId={edgeId}
                                data={edgeData}
                                edgeType={edgeType}
                                onTypeChange={onTypeChange}
                                onDataChange={onDataChange}
                                skipDescription={true}
                            />
                        </TabItem>
                        {groupChatType === "toManager" && (
                            <TabItem label="Message" id={tabIds.message}>
                                <WaldiezEdgeMessageTab
                                    edgeId={edgeId}
                                    data={edgeData}
                                    darkMode={isDark}
                                    skipRagOption={!isRagUserProxy}
                                    skipCarryoverOption={!isRagUserProxy}
                                    skipContextVarsOption={false}
                                    onDataChange={onDataChange}
                                />
                            </TabItem>
                        )}
                        {groupChatType === "nested" && (
                            <TabItem label="Message" id={`wc-${flowId}-edge-nested-chat-${edgeId}-message`}>
                                <div className="flex flex-col">
                                    <MessageInput
                                        darkMode={isDark}
                                        current={currentNestedMessageInput}
                                        selectLabel="Message Type:"
                                        selectTestId={`select-nested-message-type-${edgeId}`}
                                        defaultContent={DEFAULT_NESTED_CHAT_MESSAGE_METHOD_CONTENT}
                                        notNoneLabel="Message:"
                                        notNoneLabelInfo="The message to be sent from the source."
                                        includeContext={false}
                                        skipCarryoverOption={true}
                                        skipRagOption={true}
                                        skipNone={true}
                                        onTypeChange={onNestedMessageTypeChange}
                                        onMessageChange={onNestedMessageChange}
                                        onAddContextEntry={noOp}
                                        onRemoveContextEntry={noOp}
                                        onUpdateContextEntries={noOp}
                                    />
                                </div>
                            </TabItem>
                        )}

                        {groupChatType === "handoff" && (
                            <TabItem label="Condition" id={tabIds.condition}>
                                <HandoffCondition
                                    condition={edgeData.condition}
                                    onDataChange={onConditionChange}
                                />
                            </TabItem>
                        )}
                        {groupChatType === "handoff" && (
                            <TabItem label="Availability" id={tabIds.availability}>
                                <HandoffAvailability
                                    available={edgeData.available}
                                    onDataChange={onAvailabilityChange}
                                />
                            </TabItem>
                        )}
                    </TabItems>
                ) : (
                    <TabItems activeTabIndex={activeTabIndex}>
                        <TabItem label="Properties" id={tabIds.properties}>
                            <WaldiezEdgeBasicTab
                                edgeId={edgeId}
                                data={edgeData}
                                edgeType={edgeType}
                                onTypeChange={onTypeChange}
                                onDataChange={onDataChange}
                            />
                        </TabItem>

                        {edgeType === "chat" && (
                            <TabItem label="Message" id={tabIds.message}>
                                <WaldiezEdgeMessageTab
                                    edgeId={edgeId}
                                    data={edgeData}
                                    darkMode={isDark}
                                    skipRagOption={!isRagUserProxy}
                                    onDataChange={onDataChange}
                                />
                            </TabItem>
                        )}

                        {edgeType === "nested" && (
                            <TabItem label="Nested Chat" id={tabIds.nested}>
                                <WaldiezEdgeNestedTab
                                    flowId={flowId}
                                    edgeId={edgeId}
                                    darkMode={isDark}
                                    data={edgeData}
                                    onDataChange={onDataChange}
                                />
                            </TabItem>
                        )}
                    </TabItems>
                )}

                <div className="modal-actions">
                    <button
                        type="button"
                        title="Cancel"
                        className="secondary"
                        onClick={onCancel}
                        id={testIds.cancel}
                        data-testid={testIds.cancel}
                    >
                        Cancel
                    </button>

                    <div className="flex-row">
                        <button
                            title="Save & Close"
                            type="button"
                            className="save margin-right-10 "
                            onClick={onSaveAndClose}
                            id={testIds.saveAndClose}
                            data-testid={testIds.saveAndClose}
                            disabled={!isDirty}
                            aria-disabled={!isDirty}
                        >
                            Save & Close
                        </button>

                        <button
                            type="button"
                            title={isDirty ? "Save changes" : "No changes to save"}
                            className="primary"
                            onClick={onSubmit}
                            id={testIds.save}
                            data-testid={testIds.save}
                            disabled={!isDirty}
                            aria-disabled={!isDirty}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
});

WaldiezEdgeModal.displayName = "WaldiezEdgeModal";
