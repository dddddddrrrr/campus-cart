"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
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

const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要6个字符"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginDialog({
  open,
  setOpen,
  onRegisterClick,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onRegisterClick?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("登录失败，请检查邮箱和密码");
        return;
      }

      toast.success("登录成功");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("登录时发生错误");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    if (onRegisterClick) {
      onRegisterClick();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden border-none p-0 shadow-2xl sm:max-w-[425px]">
        <div className="bg-gradient-to-br from-primary to-primary/50 p-6 text-white">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              欢迎回来
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              请输入您的账号信息进行登录
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleLogin)}
              className="space-y-5"
            >
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
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium">
                        密码
                      </FormLabel>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs font-medium text-primary"
                      >
                        忘记密码?
                      </Button>
                    </div>
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
              <Button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-6 text-base font-semibold transition-all hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    登录中...
                  </div>
                ) : (
                  "登 录"
                )}
              </Button>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                还没有账号?{" "}
                <Button
                  variant="link"
                  className="h-auto p-0 text-primary"
                  type="button"
                  onClick={handleRegisterClick}
                >
                  立即注册
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
