import { Button } from "../../Button";
import { FadeModal } from "../../FadeModal";
import type { AdminInviteRow } from "../types";

export function DeleteInviteModal({
    row,
    deleting,
    onCancel,
    onDelete,
}: {
    row: AdminInviteRow | null;
    deleting: boolean;
    onCancel: () => void;
    onDelete: () => void;
}) {
    return (
        <FadeModal
            open={Boolean(row)}
            title="Delete Invite"
            onClose={onCancel}
            closeDisabled={deleting}
        >
            {row ? (
                <>
                    <p className="text-base text-ink">
                        Delete invite group "{row.groupName}"? This cannot be undone.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-end gap-2">
                        <Button
                            variant="secondary"
                            onClick={onCancel}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <button
                            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md bg-rose px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose/85 disabled:cursor-not-allowed disabled:opacity-50"
                            type="button"
                            onClick={onDelete}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </>
            ) : null}
        </FadeModal>
    );
}
