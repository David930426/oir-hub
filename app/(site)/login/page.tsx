import Image from "next/image";
import Link from "next/link";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="Tunghai University seal"
            width={71}
            height={74}
            className="mx-auto mb-4 h-14 w-auto"
          />
          <h1 className="text-2xl tracking-tight">Staff login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to the OIR admin console.
          </p>
        </div>

        <LoginForm />

        {/* There is no self-service sign-up: only OIR staff hold accounts. */}
        <Alert>
          <Info className="size-4" />
          <AlertDescription>
            Students don&apos;t need an account — everything on{" "}
            <Link
              href="/"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              the site
            </Link>{" "}
            is open to everyone. Staff accounts are created by an administrator.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
