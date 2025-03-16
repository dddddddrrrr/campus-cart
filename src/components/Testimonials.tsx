import { QuoteIcon } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    id: "1",
    text: "我在校内很快就卖掉了我的旧笔记本电脑。这个过程非常简单，买家就在校园里！",
    author: "艾琳",
    role: "计算机科学专业大二",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop",
  },
  {
    id: "2",
    text: "我找到了所有我需要的教科书，价格比书店便宜了一半。这个市场平台让我在本学期省了数百美元。",
    author: "迈克尔·约翰逊",
    role: "商业专业大二",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2787&auto=format&fit=crop",
  },
  {
    id: "3",
    text: "作为一名预算有限的研究生，这个平台让我找到了物廉价美的家具和家居用品。",
    author: "索菲娅·罗德里格斯",
    role: "研究生，心理学",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop",
  },
];

export function Testimonials() {
  return (
    <section className="bg-primary/5 px-4 py-20">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-2xl font-bold">学生之声</h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            加入数千名已经在使用我们平台的学生
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`animate-fade-in rounded-xl border border-gray-100 bg-white p-6 opacity-0 shadow-sm transition-all duration-300 hover:shadow-md delay-${index * 200}`}
            >
              <QuoteIcon className="mb-4 h-8 w-8 text-primary/20" />
              <p className="mb-6 text-gray-700">{testimonial.text}</p>

              <div className="flex items-center">
                <Image
                  src={testimonial.avatarUrl}
                  alt={testimonial.author}
                  className="mr-4 rounded-full object-cover"
                  width={48}
                  height={48}
                 
                />

                <div>
                  <h4 className="font-medium">{testimonial.author}</h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
