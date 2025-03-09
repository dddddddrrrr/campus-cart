import { QuoteIcon } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    id: "1",
    text: "I sold my old laptop within hours of listing it. The process was super easy and the buyer was right on campus!",
    author: "Jessica Chen",
    role: "Junior, Computer Science",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop",
  },
  {
    id: "2",
    text: "Found all my textbooks at half the bookstore price. This marketplace saved me hundreds of dollars this semester alone.",
    author: "Marcus Johnson",
    role: "Sophomore, Business",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2787&auto=format&fit=crop",
  },
  {
    id: "3",
    text: "As a grad student on a budget, this platform has been a lifesaver for finding affordable furniture and household items.",
    author: "Sophia Rodriguez",
    role: "Graduate Student, Psychology",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop",
  },
];

export function Testimonials() {
  return (
    <section className="bg-primary/5 px-4 py-20">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-2xl font-bold">What Students Say</h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Join thousands of students who are already using our platform to buy
            and sell
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
