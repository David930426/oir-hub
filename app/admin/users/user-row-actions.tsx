"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  Loader2,
  MoreHorizontal,
  Pencil,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PASSWORD_MIN_LENGTH, SECRET_TOAST_DURATION_MS } from "@/constant";
import {
  resetUserPasswordAction,
  setUserActiveAction,
} from "@/lib/actions/user.action";
import { generatePassword } from "@/lib/utils";
import { resetPasswordSchema } from "@/lib/validator/user.validator";
import type { StaffUserRow } from "./columns";

/**
 * Per-row account actions. Both confirm first: a reset invalidates the
 * colleague's password, and deactivating signs them out.
 *
 * The dialogs are controlled from here rather than wrapped around the menu items
 * so closing the menu does not unmount an open dialog.
 */
export function UserRowActions({
  user,
  isSelf,
}: {
  user: StaffUserRow;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [resetOpen, setResetOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions for {user.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/users/${user.id}/edit`}>
              <Pencil className="size-4" />
              Edit account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setResetOpen(true)}>
            <KeyRound className="size-4" />
            Reset password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant={user.active ? "destructive" : "default"}
            // An admin cannot lock themselves out from inside the console.
            disabled={isSelf && user.active}
            onSelect={() => setStatusOpen(true)}
          >
            {user.active ? (
              <UserX className="size-4" />
            ) : (
              <UserCheck className="size-4" />
            )}
            {user.active ? "Deactivate" : "Reactivate"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ResetPasswordDialog
        user={user}
        isSelf={isSelf}
        open={resetOpen}
        onOpenChange={setResetOpen}
        onDone={() => router.refresh()}
      />
      <ToggleActiveDialog
        user={user}
        open={statusOpen}
        onOpenChange={setStatusOpen}
        onDone={() => router.refresh()}
      />
    </>
  );
}

// ---------- Reset password ----------

function ResetPasswordDialog({
  user,
  isSelf,
  open,
  onOpenChange,
  onDone,
}: {
  user: StaffUserRow;
  isSelf: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    setPassword("");
    setError(null);
    onOpenChange(false);
  }

  function submit() {
    const parsed = resetPasswordSchema.safeParse({ userId: user.id, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input.");
      return;
    }

    startTransition(async () => {
      const result = await resetUserPasswordAction(parsed.data);

      if (!result.success) {
        setError(result.message);
        return;
      }

      // Shown long enough to copy: nothing is emailed, so this password only
      // reaches the colleague if the admin passes it on.
      toast.success(`Password reset for ${user.name}`, {
        description: `New password: ${password} — ${result.message}`,
        duration: SECRET_TOAST_DURATION_MS,
      });
      close();
      onDone();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Sets a new password for {user.name} ({user.email}) and signs them out
            of every device. Pass the password on yourself — no email is sent.
            {isSelf && " This is your own account: you will have to log in again."}
          </DialogDescription>
        </DialogHeader>

        <Field data-invalid={!!error}>
          <FieldLabel htmlFor={`reset-password-${user.id}`}>New password</FieldLabel>
          <div className="flex gap-2">
            <Input
              id={`reset-password-${user.id}`}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              aria-invalid={!!error}
              autoComplete="off"
              placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPassword(generatePassword());
                setError(null);
              }}
            >
              Generate
            </Button>
          </div>
          {error ? (
            <FieldError>{error}</FieldError>
          ) : (
            <FieldDescription>
              The colleague should change it after signing in.
            </FieldDescription>
          )}
        </Field>

        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Reset password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Deactivate / reactivate ----------

function ToggleActiveDialog({
  user,
  open,
  onOpenChange,
  onDone,
}: {
  user: StaffUserRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const deactivating = user.active;

  function submit() {
    startTransition(async () => {
      const result = await setUserActiveAction(user.id, !user.active);

      if (!result.success) {
        toast.error(
          deactivating
            ? "Could not deactivate account"
            : "Could not reactivate account",
          { description: result.message },
        );
        return;
      }

      toast.success(deactivating ? "Account deactivated" : "Account reactivated", {
        description: result.message,
      });
      onOpenChange(false);
      onDone();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {deactivating ? "Deactivate account" : "Reactivate account"}
          </DialogTitle>
          <DialogDescription>
            {deactivating
              ? `${user.name} will be signed out immediately and can no longer log in. Their content and history stay in place.`
              : `${user.name} will be able to log in again with their existing password.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            variant={deactivating ? "destructive" : "default"}
            onClick={submit}
            disabled={pending}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {deactivating ? "Deactivate" : "Reactivate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
