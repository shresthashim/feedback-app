"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { signUpSchema } from "@/schemas/sign-up.schema";
import { ApiResponse } from "@/types/ApiResponse";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const SignInPage = () => {
  const [username, setUsername] = useState("");
  const [usernameMsg, setUsernameMsg] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const debounced = useDebounceCallback(setUsername, 500);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMsg("");
        try {
          const res = await axios.get(`/api/check-unique-username?username=${username}`);
          setUsernameMsg(res.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMsg(axiosError.response?.data.message ?? "Error Checking Username");
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsFormSubmitting(true);
    try {
      const res = await axios.post("/api/sign-up", data);
      toast({
        title: "Account Created",
        description: res.data.message,
        variant: "default",
      });
      router.replace(`/verify/${username}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message ?? "Error Creating Account",
        variant: "destructive",
      });
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-800'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
        <div className='text-center'>
          <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-6'>Join True Feedback</h1>
          <p className='mb-4'>Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Username'
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value);
                      }}
                    />
                  </FormControl>

                  <FormDescription
                    className={`${
                      usernameMsg.includes("Username already taken") ||
                      usernameMsg.includes("Username must be at least 3 characters long")
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {username.length > 0 && (isCheckingUsername ? <Loader2 className='animate-spin mr-2' /> : usernameMsg)}
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type='email' placeholder='Email' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='Password' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' disabled={isFormSubmitting}>
              {isFormSubmitting ? <Loader2 className='w-6 mr-2 h-6 animate-spin' /> : "Sign Up"}
            </Button>
          </form>
        </Form>
        <div className='text-center mt-4'>
          <p>
            Already a member?{" "}
            <Link href='/sign-in' className='text-blue-600 hover:text-blue-800'>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
