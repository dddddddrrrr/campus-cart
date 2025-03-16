import Link from "next/link";
import { FacebookIcon, InstagramIcon, TwitterIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Column 1 - About */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="mb-4 flex items-center gap-2 text-xl font-semibold tracking-tight text-white"
            >
              <span className="text-primary">校园</span>
              <span>超市</span>
            </Link>
            <p className="mb-6 text-sm text-gray-400">你的校园超市.</p>
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <FacebookIcon className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <InstagramIcon className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <TwitterIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Column 2 - Links */}
          <div>
            <h3 className="mb-4 font-semibold text-white">市场</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/categories"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  分类
                </Link>
              </li>
              <li>
                <Link
                  href="/deals"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  今日特惠
                </Link>
              </li>
              <li>
                <Link
                  href="/new"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  新品
                </Link>
              </li>
              <li>
                <Link
                  href="/sell"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  卖出商品
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Help & Support */}
          <div>
            <h3 className="mb-4 font-semibold text-white">帮助与支持</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  物流信息
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  退货 & 退款
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  联系我们
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Newsletter */}
          <div>
            <h3 className="mb-4 font-semibold text-white">保持更新</h3>
            <p className="mb-4 text-sm text-gray-400">
              订阅我们的邮件以接收更新和特殊优惠。
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="你的邮箱"
                className="border-gray-800 bg-gray-900 text-white"
              />
              <Button className="bg-primary hover:bg-primary/90">订阅</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto flex flex-col items-center justify-between px-4 md:flex-row">
          <div className="mb-4 text-sm text-gray-500 md:mb-0">
            © {currentYear} Campus Market. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-gray-500 transition-colors hover:text-white"
            >
              隐私政策
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-500 transition-colors hover:text-white"
            >
              服务条款
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-gray-500 transition-colors hover:text-white"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
