/**
 * SPDX-License-Identifier: Apache-2.0
 * Copyright 2024 - 2025 Waldiez & contributors
 */
import React, { memo, useMemo } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { Collapsible, InfoLabel, Select } from "@waldiez/components";
import { useModelModalBasicTab } from "@waldiez/containers/nodes/model/modal/tabs/basic/hooks";
import { ModelSelector } from "@waldiez/containers/nodes/model/modal/tabs/basic/selectModel";
import { WaldiezNodeModelModalBasicTabProps } from "@waldiez/containers/nodes/model/modal/tabs/basic/types";
import { modelLinks } from "@waldiez/containers/nodes/model/utils";
import { LOGOS } from "@waldiez/theme/icons";
import { WaldiezModelAPIType } from "@waldiez/types";
import { capitalize } from "@waldiez/utils";

/**
 * Basic tab component for model properties in model modal
 */
export const WaldiezNodeModelModalBasicTab: React.FC<WaldiezNodeModelModalBasicTabProps> = memo(
    (props: WaldiezNodeModelModalBasicTabProps) => {
        const { id, data } = props;
        const { label, apiType, apiKey, baseUrl } = data;

        // Get handlers and derived state from hook
        const {
            apiTypeLabel,
            apiKeyInfo,
            apiKeyEnv,
            urlIsEditable,
            apiKeyVisible,
            apiTypeOptions,
            readOnlyBaseUrl,
            predefinedModelsSelectRef,
            onDataChange,
            onApiKeyVisibleChange,
            onLabelChange,
            onApiTypeChange,
            onApiKeyChange,
            onBaseUrlChange,
        } = useModelModalBasicTab(props);

        /**
         * Handle selection of predefined model
         */
        const onPredefineSelected = useMemo(
            () => (selected?: { label: string; apiType: WaldiezModelAPIType }) => {
                if (!selected) {
                    return;
                }

                const { label, apiType } = selected;
                onDataChange({ label, apiType });
            },
            [onDataChange],
        );

        // Generate useful links section
        const usefulLinks = useMemo(
            () => (
                <div className="flex-column">
                    {Object.entries(modelLinks)
                        .filter(([_, link]) => link.length > 0)
                        .map(([key, link]) => (
                            <div key={key} className="flex-row margin-bottom-5">
                                <span className="flex-shrink-0">{capitalize(key)} models:&nbsp;&nbsp;</span>
                                <a href={link} target="_blank" rel="noreferrer" className="text-truncate">
                                    {link}
                                </a>
                            </div>
                        ))}
                </div>
            ),
            [],
        );

        const OptionWithIcon = memo(
            (props: { innerProps: any; data: { label: string; value: WaldiezModelAPIType } }) => {
                const { innerProps, data } = props;
                return (
                    <div {...innerProps} className="flex margin-10">
                        <div className={`margin-right-10 margin-left-5 model-logo ${data.value}`}>
                            <img src={LOGOS[data.value]} alt={data.label} style={{ width: 20, height: 20 }} />
                        </div>
                        <span className="label">{data.label}</span>
                    </div>
                );
            },
        );

        // Generate input IDs for accessibility
        const nameInputId = `model-name-input-${id}`;
        const apiTypeSelectId = `model-api-type-select-${id}`;
        const apiKeyInputId = `model-api-key-input-${id}`;
        const baseUrlInputId = `model-base-url-input-${id}`;

        return (
            <div className="flex-column">
                <div className="info margin-bottom-10">
                    You can select one of the predefined models from the list below or manually enter the
                    model name and type. In the latter case, make sure that the model's name is a valid name
                    (based on the provider). You can use the <strong>Test</strong> button to check if the
                    model parameters are correct, but model credits might be used for this test (depending on
                    the provider). <br />
                    <strong>Note</strong> that if testing the model fails with a "Failed to load" message (for
                    example a NIM model), it doesn't mean that the configuration is not correct (it could be a
                    browser/CORS issue).
                    <Collapsible
                        title="Useful Links"
                        expanded={false}
                        fullWidth
                        className="transparent color-info no-padding margin-top-5 margin-bottom-5"
                        contentClassName="background-info"
                    >
                        {usefulLinks}
                    </Collapsible>
                </div>

                <ModelSelector ref={predefinedModelsSelectRef} onChange={onPredefineSelected} />

                <div className="margin-top-10">
                    <label htmlFor={nameInputId}>Name:</label>
                    <div className="margin-top-10" />
                    <input
                        id={nameInputId}
                        type="text"
                        value={label || ""}
                        onChange={onLabelChange}
                        title="Model name"
                        data-testid="model-name-input"
                        className="full-width"
                        aria-label="Model name"
                    />
                </div>
                <div className="margin-top-0">
                    <InfoLabel
                        htmlFor={`model-type-${id}`}
                        label="Model Type:"
                        info="API type to use for the model. Use 'other' for custom openai compatible models"
                    />
                    <label htmlFor={apiTypeSelectId} className="hidden">
                        Model Type:
                    </label>
                    <Select
                        options={apiTypeOptions}
                        value={{
                            label: apiTypeLabel,
                            value: apiType,
                        }}
                        components={{ Option: OptionWithIcon }}
                        onChange={onApiTypeChange}
                        inputId={apiTypeSelectId}
                        aria-label="Model API type"
                        className="full-width"
                    />
                </div>
                {apiType !== "bedrock" && (
                    <div className="margin-top-0">
                        <InfoLabel label="API Key:" info={apiKeyInfo} htmlFor={apiKeyInputId} />
                        <div className="flex full-width">
                            <input
                                id={apiKeyInputId}
                                className="flex-1 margin-right-10"
                                type={apiKeyVisible ? "text" : "password"}
                                value={apiKey || ""}
                                placeholder={apiKeyEnv}
                                onChange={onApiKeyChange}
                                data-testid="model-api-key-input"
                                aria-label="API key"
                            />
                            <button
                                type="button"
                                className="toggle-visibility-btn"
                                onClick={onApiKeyVisibleChange}
                                title={apiKeyVisible ? "Hide API key" : "Show API key"}
                                aria-label={apiKeyVisible ? "Hide API key" : "Show API key"}
                                data-testid={`visibility-apiKey-model-${id}`}
                            >
                                {apiKeyVisible ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                )}

                <div className="margin-top-0">
                    <InfoLabel
                        label="Base URL:"
                        info="Model's base URL (including version)"
                        htmlFor={baseUrlInputId}
                    />
                    {urlIsEditable ? (
                        <input
                            id={baseUrlInputId}
                            title="Model base URL"
                            type="text"
                            value={baseUrl || ""}
                            onChange={onBaseUrlChange}
                            data-testid="model-base-url-input"
                            className="full-width"
                            aria-label="Base URL"
                        />
                    ) : (
                        <input
                            id={baseUrlInputId}
                            type="text"
                            title="Model base URL"
                            readOnly
                            disabled
                            value={readOnlyBaseUrl}
                            data-testid="model-base-url-input-read-only"
                            className="full-width"
                            aria-label="Base URL (read-only)"
                        />
                    )}
                </div>
            </div>
        );
    },
);

WaldiezNodeModelModalBasicTab.displayName = "WaldiezNodeModelModalBasicTab";
