import Image from "next/image";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="Tunghai University seal"
            width={71}
            height={74}
            className="mx-auto mb-4 h-14 w-auto"
          />
          <h1 className="text-2xl font-bold tracking-tight">Create a student account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep your chat history and get a faster contact experience.
          </p>
        </div>

        <RegisterForm />

        <Alert>
          <AlertDescription className="text-xs">
            By signing up you agree that your questions to the AI assistant may
            be reviewed by OIR staff to improve answer quality.
          </AlertDescription>
        </Alert>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-2 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
