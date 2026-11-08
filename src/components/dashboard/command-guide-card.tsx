import { BookOpen, Dumbbell, Flame, Send } from "lucide-react";

import { Card, CardHeading } from "@/components/ui/card";
import { Code } from "@/components/ui/typography";

const commands = [
  {
    icon: Dumbbell,
    command: "/gym push 45 | bench 4x8",
    tone: "text-accent-emerald-ink",
    background: "bg-accent-emerald/10",
  },
  {
    icon: BookOpen,
    command: "/read Dune 32 45",
    tone: "text-accent-violet-ink",
    background: "bg-accent-violet/10",
  },
  {
    icon: Flame,
    command: "/eat 620 45 60 20 chicken bowl",
    tone: "text-coral-ink",
    background: "bg-coral/10",
  },
];

export function CommandGuideCard() {
  return (
    <Card
      variant="solid"
      className="md:col-span-2 xl:col-span-6"
    >
      <CardHeading
        icon={<Send className="size-5 text-accent-emerald-ink" />}
        iconClassName="shadow-[inset_0_0_20px_rgba(245,158,11,0.12)]"
        title="Telegram dispatch"
      />

      <div className="grid gap-2 sm:grid-cols-3">
        {commands.map((item) => (
          <div
            key={item.command}
            className="flex items-start gap-2.5 rounded-control border border-white/[0.08] bg-black/[0.08] p-2.5"
          >
            <div
              className={`flex size-7 shrink-0 items-center justify-center rounded-control ${item.background} ${item.tone}`}
            >
              <item.icon className="size-3.5" aria-hidden="true" />
            </div>
            <Code className="break-words text-[0.65rem] leading-relaxed text-text-secondary">
              {item.command}
            </Code>
          </div>
        ))}
      </div>

      <p className="mt-auto pt-5 text-xs leading-relaxed text-text-secondary">
        Every mutation is authenticated with the Telegram webhook secret and a
        chat allowlist. The dashboard itself stays read-only.
      </p>
    </Card>
  );
}
