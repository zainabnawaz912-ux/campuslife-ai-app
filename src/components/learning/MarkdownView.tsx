import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export function MarkdownView({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "space-y-3 text-sm leading-relaxed text-foreground",
        "[&_h1]:mt-4 [&_h1]:text-lg [&_h1]:font-bold",
        "[&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold",
        "[&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold",
        "[&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
        "[&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs",
        "[&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:text-xs",
        "[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:p-2 [&_th]:text-left",
        "[&_td]:border [&_td]:border-border [&_td]:p-2 [&_td]:align-top",
        "[&_p]:text-muted-foreground [&_li]:text-muted-foreground",
        className,
      )}
    >
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
