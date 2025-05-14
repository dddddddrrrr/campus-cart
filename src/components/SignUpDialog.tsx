"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Loader2 } from "lucide-react";

const signUpSchema = z
  .object({
    name: z.string().min(2, "姓名至少需要2个字符"),
    email: z.string().email("请输入有效的邮箱地址"),
    password: z.string().min(6, "密码至少需要6个字符"),
    confirmPassword: z.string().min(6, "请确认您的密码"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpDialog({
  open,
  setOpen,
  onLoginClick,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onLoginClick?: () => void;
}) {
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const { mutateAsync: createUser, isPending } =
    api.user.createUser.useMutation({
      onSuccess: () => {
        toast.success("注册成功，请登录");
        setOpen(false);
        // Optionally auto-redirect to login form
        if (onLoginClick) {
          onLoginClick();
        }
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "注册失败");
      },
    });

  const handleSignUp = async (values: SignUpFormValues) => {
    await createUser({
      email: values.email,
      name: values.name,
      password: values.password,
    });
  };

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden border-none p-0 shadow-2xl sm:max-w-[425px]">
        <div className="bg-gradient-to-br from-primary to-primary/50 p-6 text-white">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              创建账号
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              填写信息，加入我们的社区
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSignUp)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">姓名</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入姓名"
                        {...field}
                        className="rounded-md border-input/50 bg-background/50 px-4 py-5 shadow-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">邮箱</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="请输入邮箱"
                        {...field}
                        className="rounded-md border-input/50 bg-background/50 px-4 py-5 shadow-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="请输入密码"
                        {...field}
                        className="rounded-md border-input/50 bg-background/50 px-4 py-5 shadow-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      确认密码
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="请再次输入密码"
                        {...field}
                        className="rounded-md border-input/50 bg-background/50 px-4 py-5 shadow-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isPending}
                className="mt-2 w-full py-6 text-base font-semibold transition-all hover:scale-[1.02]"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    注册中...
                  </div>
                ) : (
                  "注 册"
                )}
              </Button>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                已有账号?{" "}
                <Button
                  variant="link"
                  className="h-auto p-0 text-primary"
                  type="button"
                  onClick={handleLoginClick}
                >
                  返回登录
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
