import { ROLE_PERMISSIONS, STAFF_ROLES } from "@/constant";
import { userRoleMeta } from "@/lib/mock/labels";

/**
 * What each role may do, shown beside the role picker on both the create and
 * edit forms so an admin chooses deliberately rather than from the label alone.
 */
export function RoleLegend() {
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        What each role can do
      </p>
      <ul className="space-y-1.5 text-xs text-muted-foreground">
        {STAFF_ROLES.map((role) => (
          <li key={role}>
            <span className="font-medium text-foreground">
              {userRoleMeta[role].label}
            </span>{" "}
            — {ROLE_PERMISSIONS[role]}
          </li>
        ))}
      </ul>
    </div>
  );
}
