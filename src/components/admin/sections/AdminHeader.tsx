import { LogOut } from "lucide-react";
import { Button } from "../../Button";

export function AdminHeader({ authenticated, onSignOut }: { authenticated: boolean; onSignOut: () => void }) {
    return (
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
                <p className="text-sm uppercase text-rose">Admin</p>
                <h1 className="mt-2 font-display text-5xl">Wedding Dashboard</h1>
                <p className="mt-4 max-w-2xl text-taupe">
                    Manage invite groups, view RSVP status, export responses, and support day-of check-in.
                </p>
            </div>
            {authenticated ? (
                <Button
                    variant="secondary"
                    onClick={onSignOut}
                >
                    <LogOut size={16} />
                    Sign out
                </Button>
            ) : null}
        </div>
    );
}
