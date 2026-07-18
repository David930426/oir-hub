import Image from "next/image";
import Link from "next/link";
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
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log in to keep your chat history and manage your profile.
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary underline-offset-2 hover:underline">
            Sign up as a student
          </Link>
        </p>
      </div>
    </div>
  );
}
