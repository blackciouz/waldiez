/**
 * SPDX-License-Identifier: Apache-2.0
 * Copyright 2024 - 2025 Waldiez & contributors
 */
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import selectEvent from "react-select-event";

import { renderAgent, submitAgentChanges } from "../../common";
import { agentId, flowId } from "../../data";

const goToVectorDbTab = async (isQdrant: boolean = false) => {
    renderAgent("rag_user_proxy", {
        openModal: true,
    });
    const ragUserTab = screen.getByTestId(`tab-id-wf-${flowId}-wa-${agentId}-rag`);
    fireEvent.click(ragUserTab);
    const vectorDbTab = screen.getByTestId(`tab-id-wf-${flowId}-wa-${agentId}-rag-vectorDb`);
    fireEvent.click(vectorDbTab);
    await waitFor(() => {
        const vectorDbSelect = screen.getByLabelText("Vector DB:");
        expect(vectorDbSelect).toBeInTheDocument();
    });
    if (isQdrant) {
        const vectorDbSelect = screen.getByLabelText("Vector DB:");
        selectEvent.openMenu(vectorDbSelect);
        await selectEvent.select(vectorDbSelect, "Qdrant");
        fireEvent.change(vectorDbSelect, {
            target: {
                label: "Qdrant",
                value: "qdrant",
            },
        });
    }
};

describe("Rag User tab Vector DB", () => {
    it("should render the Rag User tab Vector DB", async () => {
        await goToVectorDbTab();
        const vectorDbTab = screen.getByTestId(`tab-id-wf-${flowId}-wa-${agentId}-rag-vectorDb`);
        expect(vectorDbTab).toBeInTheDocument();
    });
    it("should change the vector DB", async () => {
        await goToVectorDbTab();
        const vectorDbSelect = screen.getByLabelText("Vector DB:");
        expect(vectorDbSelect).toBeInTheDocument();
        selectEvent.openMenu(vectorDbSelect);
        await selectEvent.select(vectorDbSelect, "Qdrant");
        fireEvent.change(vectorDbSelect, {
            target: {
                label: "Qdrant",
                value: "qdrant",
            },
        });
        await waitFor(() => {
            const qdrantInput = screen.getByTestId(
                `rag-vector-db-connection-url-${agentId}`,
            ) as HTMLInputElement;
            expect(qdrantInput).toBeInTheDocument();
        });
        submitAgentChanges();
    });
    it("should change the model", async () => {
        await goToVectorDbTab();
        await waitFor(() => {
            expect(screen.queryByTestId(`rag-vector-db-model-${agentId}`)).toBeInTheDocument();
        });
        const modelInput = screen.getByTestId(`rag-vector-db-model-${agentId}`) as HTMLInputElement;
        fireEvent.change(modelInput, { target: { value: "model" } });
        submitAgentChanges();
    });
    it("should change the Qdrant use memory", async () => {
        await goToVectorDbTab(true);
        await waitFor(() => {
            expect(screen.queryByTestId(`rag-vector-db-use-memory-${agentId}`)).toBeInTheDocument();
        });
        const useMemoryCheckbox = screen.getByTestId(
            `rag-vector-db-use-memory-${agentId}`,
        ) as HTMLInputElement;
        fireEvent.click(useMemoryCheckbox);
        submitAgentChanges();
    });
    it("should change the Qdrant use local storage", async () => {
        await goToVectorDbTab(true);
        await waitFor(() => {
            expect(screen.queryByTestId(`rag-vector-db-use-local-storage-${agentId}`)).toBeInTheDocument();
        });
        const useLocalStorageCheckbox = screen.getByTestId(
            `rag-vector-db-use-local-storage-${agentId}`,
        ) as HTMLInputElement;
        fireEvent.click(useLocalStorageCheckbox);
        submitAgentChanges();
    });
    it("should change the Qdrant local storage path", async () => {
        await goToVectorDbTab(true);
        await waitFor(() => {
            expect(screen.queryByTestId(`rag-vector-db-use-local-storage-${agentId}`)).toBeInTheDocument();
        });
        const useLocalStorageCheckbox = screen.getByTestId(
            `rag-vector-db-use-local-storage-${agentId}`,
        ) as HTMLInputElement;
        fireEvent.click(useLocalStorageCheckbox);
        await waitFor(() => {
            expect(screen.queryByTestId(`rag-vector-db-local-storage-path-${agentId}`)).toBeInTheDocument();
        });
        const localStoragePathInput = screen.getByTestId(
            `rag-vector-db-local-storage-path-${agentId}`,
        ) as HTMLInputElement;
        fireEvent.change(localStoragePathInput, { target: { value: "path" } });
        submitAgentChanges();
    });
    it("should change the Qdrant connection URL", async () => {
        await goToVectorDbTab(true);
        await waitFor(() => {
            expect(screen.queryByTestId(`rag-vector-db-connection-url-${agentId}`)).toBeInTheDocument();
        });
        const connectionUrlInput = screen.getByTestId(
            `rag-vector-db-connection-url-${agentId}`,
        ) as HTMLInputElement;
        fireEvent.change(connectionUrlInput, { target: { value: "url" } });
        submitAgentChanges();
    });
    it("should change the Chroma use local storage", async () => {
        await goToVectorDbTab();
        await waitFor(() => {
            expect(screen.queryByTestId(`rag-vector-db-use-local-storage-${agentId}`)).toBeInTheDocument();
        });
        const useLocalStorageCheckbox = screen.getByTestId(
            `rag-vector-db-use-local-storage-${agentId}`,
        ) as HTMLInputElement;
        fireEvent.click(useLocalStorageCheckbox);
        submitAgentChanges();
    });
    it("should change the Chroma local storage path", async () => {
        await goToVectorDbTab();
        await waitFor(() => {
            expect(screen.queryByTestId(`rag-vector-db-use-local-storage-${agentId}`)).toBeInTheDocument();
        });
        const useLocalStorageCheckbox = screen.getByTestId(
            `rag-vector-db-use-local-storage-${agentId}`,
        ) as HTMLInputElement;
        fireEvent.click(useLocalStorageCheckbox);
        await waitFor(() => {
            expect(screen.queryByTestId(`rag-vector-db-local-storage-path-${agentId}`)).toBeInTheDocument();
        });
        const localStoragePathInput = screen.getByTestId(
            `rag-vector-db-local-storage-path-${agentId}`,
        ) as HTMLInputElement;
        fireEvent.change(localStoragePathInput, { target: { value: "path" } });
        submitAgentChanges();
    });
    it("should change the connection URL", async () => {
        await goToVectorDbTab();
        await waitFor(() => {
            expect(screen.queryByTestId(`rag-vector-db-connection-url-${agentId}`)).toBeInTheDocument();
        });
        const connectionUrlInput = screen.getByTestId(
            `rag-vector-db-connection-url-${agentId}`,
        ) as HTMLInputElement;
        fireEvent.change(connectionUrlInput, { target: { value: "url" } });
        submitAgentChanges();
    });
});
