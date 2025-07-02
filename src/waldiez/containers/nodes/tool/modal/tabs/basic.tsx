/**
 * SPDX-License-Identifier: Apache-2.0
 * Copyright 2024 - 2025 Waldiez & contributors
 */
import { memo, useCallback, useMemo } from "react";

import { Editor, Select, SingleValue, TextInput, TextareaInput } from "@waldiez/components";
import { useToolNodeModal } from "@waldiez/containers/nodes/tool/modal/hooks";
import { WaldiezNodeToolModalProps } from "@waldiez/containers/nodes/tool/modal/types";
import {
    DEFAULT_DESCRIPTION,
    DEFAULT_NAME,
    PREDEFINED_TOOL_INSTRUCTIONS,
    PREDEFINED_TOOL_REQUIRED_ENVS,
    PREDEFINED_TOOL_REQUIRED_KWARGS,
    PREDEFINED_TOOL_TYPES,
    TOOL_TYPE_OPTIONS,
} from "@waldiez/containers/nodes/tool/utils";
import { WaldiezToolType } from "@waldiez/models";

/**
 * Basic tab component for tool properties in the tool modal
 */
export const WaldiezToolBasicTab = memo((props: WaldiezNodeToolModalProps) => {
    const { toolId, data, darkMode } = props;

    // Get handlers from custom hook
    const {
        onToolContentChange,
        onToolLabelChange,
        onToolDescriptionChange,
        onToolTypeChange,
        onAddSecret,
        onSetToolKwarg,
    } = useToolNodeModal(props);

    // Memoize the selected tool type option
    const selectedToolType = useMemo(
        () =>
            TOOL_TYPE_OPTIONS.find(option => option.value === data.toolType) ||
            TOOL_TYPE_OPTIONS.find(option => option.value === data.label) ||
            TOOL_TYPE_OPTIONS[0],
        [data.toolType, data.label],
    );

    /**
     * Handle tool type selection change
     */
    const onToolTypeSelectChange = useCallback(
        (option: SingleValue<{ value: string; label: string }>) => {
            if (!option) {
                return;
            }
            if (PREDEFINED_TOOL_TYPES.includes(option.value)) {
                // If the selected type is a predefined tool, set the content to an empty string
                onToolTypeChange("predefined");
                onToolLabelChange(option.value);
                onToolDescriptionChange(DEFAULT_DESCRIPTION[option.value] || option.label);
            } else {
                onToolTypeChange(option.value as WaldiezToolType);
                onToolLabelChange(DEFAULT_NAME[option.value]);
                onToolDescriptionChange(DEFAULT_DESCRIPTION[option.value] || "");
            }
            // onToolTypeChange(option.value);
        },
        [onToolTypeChange, onToolLabelChange, onToolDescriptionChange],
    );

    // Generate element IDs for accessibility
    const typeSelectId = `tool-type-select-${toolId}`;
    const labelInputId = `tool-label-input-${toolId}`;
    const descriptionInputId = `tool-description-input-${toolId}`;
    const contentEditorId = `tool-content-editor-${toolId}`;

    const onPredefinedToolEnvChange = useCallback(
        (envVar: string, event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            onAddSecret(envVar, value);
        },
        [onAddSecret],
    );

    const onPredefinedToolArgChange = useCallback(
        (kwarg: string, event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            onSetToolKwarg(kwarg, value);
        },
        [onSetToolKwarg],
    );

    const ToolOptionWithIcon = memo(
        (props: { innerProps: any; data: { icon?: React.JSX.Element; label: string } }) => {
            const { innerProps, data } = props;
            return (
                <div {...innerProps} className="flex margin-5 clickable">
                    {data.icon && <div className="icon margin-right-10 margin-left-5">{data.icon}</div>}
                    <span className="label">{data.label}</span>
                </div>
            );
        },
    );

    return (
        <div className="flex-column">
            <div className="margin-bottom-10">
                <label htmlFor={typeSelectId}>Type:</label>
                <div className="margin-top-10" />
                <Select
                    inputId={typeSelectId}
                    options={TOOL_TYPE_OPTIONS}
                    value={selectedToolType}
                    onChange={onToolTypeSelectChange}
                    data-testid={typeSelectId}
                    aria-label="Tool type"
                    components={{
                        Option: ToolOptionWithIcon,
                    }}
                />
            </div>
            {data.toolType !== "predefined" && (
                <div className="margin-bottom-10">
                    <label htmlFor={labelInputId}>Name:</label>
                    <div className="margin-top-10" />
                    <input
                        title="Name"
                        type="text"
                        value={data.label || ""}
                        data-testid={labelInputId}
                        id={labelInputId}
                        onChange={onToolLabelChange}
                        className="full-width"
                        aria-label="Tool name"
                    />
                </div>
            )}
            {data.toolType !== "predefined" && (
                <div className="margin-bottom-10">
                    <label htmlFor={descriptionInputId}>Description:</label>
                    <div className="margin-top-10" />
                    <TextareaInput
                        title="Description"
                        rows={2}
                        value={data.description || ""}
                        data-testid={descriptionInputId}
                        id={descriptionInputId}
                        onChange={onToolDescriptionChange}
                        className="full-width"
                        aria-label="Tool description"
                    />
                </div>
            )}
            {data.toolType !== "predefined" && (
                <div>
                    <label htmlFor={contentEditorId}>Content:</label>
                    <div className="margin-top-10" />
                    <Editor
                        value={data.content || ""}
                        onChange={onToolContentChange}
                        darkMode={darkMode}
                        aria-label="Tool content"
                        data-testid={contentEditorId}
                    />
                </div>
            )}
            {data.toolType === "predefined" && PREDEFINED_TOOL_INSTRUCTIONS[data.label] && (
                <div className="margin-top-10">{PREDEFINED_TOOL_INSTRUCTIONS[data.label]}</div>
            )}
            {data.toolType === "predefined" && PREDEFINED_TOOL_REQUIRED_KWARGS[data.label].length > 0 && (
                <div className="margin-top-10">
                    {PREDEFINED_TOOL_REQUIRED_KWARGS[data.label].map((kwarg, index) => (
                        <div key={index} className="margin-bottom-5">
                            <TextInput
                                name={kwarg.label}
                                label={`${kwarg.label}:`}
                                dataTestId={`env-var-input-${index}-${kwarg.key}`}
                                value={(data.kwargs ? (data.kwargs[kwarg.key] as string) : "") || ""}
                                onChange={onPredefinedToolArgChange.bind(null, kwarg.key)}
                                className="margin-top-10"
                                isPassword={false}
                                placeholder={`Enter the ${kwarg.label}`}
                            />
                        </div>
                    ))}
                </div>
            )}
            {data.toolType === "predefined" && PREDEFINED_TOOL_REQUIRED_ENVS[data.label].length > 0 && (
                <div className="margin-top-10">
                    {PREDEFINED_TOOL_REQUIRED_ENVS[data.label].map((envVar, index) => (
                        <div key={index} className="margin-bottom-5">
                            <TextInput
                                name={envVar.label}
                                label={`${envVar.label}:`}
                                dataTestId={`env-var-input-${index}-${envVar.key}`}
                                value={(data.secrets[envVar.key] as string) || ""}
                                onChange={onPredefinedToolEnvChange.bind(null, envVar.key)}
                                className="margin-top-10"
                                placeholder={`Enter the ${envVar.label}`}
                                isPassword
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

WaldiezToolBasicTab.displayName = "WaldiezToolBasicTab";
