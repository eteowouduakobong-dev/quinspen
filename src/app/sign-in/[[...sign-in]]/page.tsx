import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { LocalAuthForm } from "@/components/LocalAuthForm";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense>
        {clerkEnabled ? <SignIn /> : <LocalAuthForm mode="signin" />}
      </Suspense>
    </div>
  );
}
