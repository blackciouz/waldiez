/**
 * SPDX-License-Identifier: Apache-2.0
 * Copyright 2024 - 2025 Waldiez & contributors
 */
import type { WaldiezEdge } from "@waldiez/models/types";

/**
 * EdgeLabel component to display the label of a given edge
 * @param edge - The edge object containing the label
 * @param transform - The transformation string for positioning
 * @returns The rendered label or null if no label is present
 */
export const EdgeLabel = ({ edge, transform }: { edge: WaldiezEdge | undefined; transform: string }) => {
    if (!edge) {
        return null;
    }
    const label = edge.data?.label ?? "";
    if (label === "") {
        return null;
    }
    const trimmedTo20Chars = label.length > 20 ? `${label.slice(0, 20)}...` : label;
    return (
        <div
            style={{
                position: "absolute",
                width: "max-content",
                // padding: 10,
                color: "currentcolor",
                fontSize: 12,
                fontWeight: 600,
                left: "50%",
                top: "50%",
                zIndex: 10001,
                transform,
            }}
            className="nodrag nopan"
        >
            {trimmedTo20Chars}
        </div>
    );
};
