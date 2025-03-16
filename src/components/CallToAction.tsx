import Link from "next/link";
import { Button } from "~/components/ui/button";
import { TrendingUpIcon, ArrowRightIcon } from "lucide-react";

export function CallToAction() {
  return (
    <section className="bg-gradient-to-br from-primary to-primary/80 px-4 py-20 text-white">
      <div className="container mx-auto">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            <TrendingUpIcon className="h-3.5 w-3.5" />
            <span>加入 10,000+ 名学生</span>
          </div>

          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            任何商品，校园买卖
          </h2>

          <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">
            加入我们的 vibrant marketplace 社区，发现校园买卖的最简单方式。
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full bg-white px-6 text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/sell">开始卖货</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/30 bg-white/10 px-6 text-white backdrop-blur-sm hover:bg-white/20"
              asChild
            >
              <Link href="/signup">
                创建账号
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
