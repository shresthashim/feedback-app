"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import * as z from "zod";
import { ApiResponse } from "@/types/ApiResponse";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { messageSchema } from "@/schemas/message.schema";

const SendMessagePage = () => {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const { setValue, watch } = form;
  const messageContent = watch("content");

  const [isSending, setIsSending] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsSending(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });

      toast({
        title: response.data.message,
        variant: "default",
      });
      form.reset({ ...form.getValues(), content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message ?? "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get<ApiResponse>("/api/suggest-messages");

      toast({
        title: response.data.message,
        variant: "default",
      });
      const suggestedMessage = response.data.result ?? "";
      setValue("content", suggestedMessage);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message ?? "Failed to fetch suggested messages",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className='container mx-auto my-8 p-6 bg-white rounded max-w-4xl'>
      <h1 className='text-4xl font-bold mb-6 text-center'>Public Profile Link</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='content'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                <FormControl>
                  <Textarea placeholder='Write your anonymous message here' className='resize-none' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex justify-center'>
            {isSending ? (
              <Button disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Sending...
              </Button>
            ) : (
              <Button type='submit' disabled={isSending || !messageContent}>
                Send Message
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div>
        <Button type='button' onClick={fetchSuggestedMessages} disabled={isFetching}>
          {isFetching ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Suggesting...
            </>
          ) : (
            "Suggest Message"
          )}
        </Button>

        <Separator className='my-6' />
        <div className='text-center'>
          <div className='mb-4'>Get Your Message Board</div>
          <Link href={"/sign-up"}>
            <Button>Create Your Account</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SendMessagePage;
