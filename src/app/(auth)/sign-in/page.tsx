"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { signInSchema } from "@/schemas/sign-in.schema";
import { signIn } from "next-auth/react";

const SignUpPage = () => {
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsFormSubmitting(true);
    const res = await signIn("credentials", {
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "You have successfully signed in",
      });
      router.replace("/dashboard");
    }
    setIsFormSubmitting(false);
  };
  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-800'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
        <div className='text-center'>
          <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-6'>Welcome Back to True Feedback</h1>
          <p className='mb-4'>Sign in to continue your secret conversations</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              name='identifier'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/Username</FormLabel>
                  <Input placeholder='Email/Username' {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='password'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input placeholder='Password' type='password' {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='w-full' type='submit' disabled={isFormSubmitting}>
              {isFormSubmitting ? <Loader2 className='w-6 mr-2 h-6 animate-spin' /> : "Sign In"}
            </Button>
          </form>
        </Form>
        <div className='text-center mt-4'>
          <p>
            Not a member yet?{" "}
            <Link href='/sign-up' className='text-blue-600 hover:text-blue-800'>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
