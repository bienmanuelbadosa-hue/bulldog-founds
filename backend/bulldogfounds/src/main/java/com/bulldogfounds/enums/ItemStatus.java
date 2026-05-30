package com.bulldogfounds.enums;

/**
 * Enum representing the status of an item post.
 *
 * Statuses:
 * - UNRESOLVED: Item has not been claimed yet
 * - PENDING_CLAIM: Someone has claimed the item, waiting for confirmation
 * - RESOLVED: Item has been claimed and resolved
 */
public enum ItemStatus {
    UNRESOLVED,
    PENDING_CLAIM,
    RESOLVED
}