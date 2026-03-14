"use client";

import type { JSX } from "react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthApiError } from "@supabase/supabase-js";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const signupSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Add at least one uppercase letter.")
    .regex(/[0-9]/, "Add at least one number."),
});

type SignupFormValues = z.infer<typeof signupSchema>;

function isEmailRateLimitError(error: AuthApiError): boolean {
  return error.code === "over_email_send_rate_limit" || error.status === 429;
}

export function SignupForm(): JSX.Element {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    setIsPending(true);

    startTransition(async () => {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error instanceof AuthApiError && isEmailRateLimitError(error)) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          });

          if (!signInError) {
            router.push("/dashboard");
            router.refresh();
            return;
          }

          setFormError(
            "Signup is temporarily rate-limited by Supabase email sending. If the account already exists, log in instead. Otherwise wait a bit and try again."
          );
          setIsPending(false);
          return;
        }

        setFormError(error.message);
        setIsPending(false);
        return;
      }

      if (!data.session) {
        router.push(
          "/login?message=Account%20created.%20If%20email%20confirmation%20is%20enabled,%20confirm%20your%20email%20before%20logging%20in."
        );
        router.refresh();
        return;
      }

      router.push("/onboarding");
      router.refresh();
    });
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
        {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a strong password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        ) : null}
      </div>
      {formError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </div>
      ) : null}
      <Button
        className="w-full bg-orange-500 text-white hover:bg-orange-600"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Creating account..." : "Start free trial"}
      </Button>
    </form>
  );
}
