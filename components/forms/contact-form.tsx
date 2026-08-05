"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

import { Icons } from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useModalStore } from "@/hooks/use-modal-store";

// schema for a single social link entry
const socialLinkSchema = z.object({
  platform: z.string().min(1, { message: "Platform cannot be empty" }),
  value: z.string().refine(
    (val) => {
      if (val === "") return true;
      try {
        new URL(val);
        return true;
      } catch {
        // not a URL
      }
      return /^[@\w.-]+$/.test(val);
    },
    {
      message: "Enter a URL or username/handle or leave blank.",
    }
  ),
});

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Name must contain at least 3 characters.",
  }),
  email: z.string().email("Please enter a valid email."),
  message: z.string().min(10, {
    message: "Please write something more descriptive.",
  }),
  socials: z.array(socialLinkSchema).optional(),
});

export function ContactForm() {
  const storeModal = useModalStore();

  // const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      socials: [],
    },
  });

  // manage dynamic social link entries
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socials",
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        form.reset();
        storeModal.onOpen({
          title: "Thankyou!",
          description:
            "Your message has been received! I appreciate your contact and will get back to you shortly.",
          icon: Icons.successAnimated,
        });
        return;
      }

      // Extract server-provided error message when available.
      let errorMessage = "Something went wrong. Please try again.";
      try {
        const data = (await response.json()) as { error?: string };
        if (data?.error) errorMessage = data.error;
      } catch {
        // response body wasn't JSON; keep default message
      }
      if (response.status === 429) {
        errorMessage =
          errorMessage || "Too many submissions. Please try again later.";
      }
      storeModal.onOpen({
        title: "Couldn't send",
        description: errorMessage,
        icon: Icons.warning,
      });
    } catch (err) {
      console.error("[contact-form] submit error", err);
      storeModal.onOpen({
        title: "Network error",
        description:
          "We couldn't reach the server. Please check your connection and try again.",
        icon: Icons.warning,
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 min-w-full"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              {/* <FormDescription>
                                This is your public display name.
                            </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter your message" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* social links: user can add one or more platform/handle pairs */}
        <div className="space-y-4">
          {fields.map((item, index) => (
            <div key={item.id} className="flex gap-2 items-end">
              <FormField
                control={form.control}
                name={`socials.${index}.platform` as const}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Platform</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Instagram" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`socials.${index}.value` as const}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Username/URL</FormLabel>
                    <FormControl>
                      <Input placeholder="LinkedIn URL or email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <button
                type="button"
                className="text-sm text-red-500"
                onClick={() => remove(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ platform: "", value: "" })}
          >
            + Add social link
          </Button>
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
