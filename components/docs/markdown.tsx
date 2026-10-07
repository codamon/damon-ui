import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

const components: Components = {
  h2: ({ className, ...props }) => (
    <h2 className={cn("mt-10 mb-3 scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight", className)} {...props} />
  ),
  h3: ({ className, ...props }) => (
    <h3 className={cn("mt-8 mb-2 text-base font-semibold", className)} {...props} />
  ),
  p: ({ className, ...props }) => <p className={cn("my-3 leading-7", className)} {...props} />,
  ul: ({ className, ...props }) => <ul className={cn("my-3 ml-5 list-disc space-y-1.5", className)} {...props} />,
  ol: ({ className, ...props }) => <ol className={cn("my-3 ml-5 list-decimal space-y-1.5", className)} {...props} />,
  li: ({ className, ...props }) => <li className={cn("leading-7", className)} {...props} />,
  a: ({ className, ...props }) => (
    <a className={cn("font-medium underline underline-offset-4", className)} {...props} />
  ),
  table: ({ className, ...props }) => (
    <div className="my-4 w-full overflow-x-auto rounded-lg border">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th className={cn("border-b bg-muted/50 px-3 py-2 text-left font-medium", className)} {...props} />
  ),
  td: ({ className, ...props }) => <td className={cn("border-b px-3 py-2 align-top", className)} {...props} />,
  pre: ({ className, ...props }) => (
    <pre
      className={cn("my-4 overflow-x-auto rounded-lg border bg-muted/40 p-4 font-mono text-[0.8125rem] leading-6", className)}
      {...props}
    />
  ),
  code: ({ className, ...props }) => {
    const block = /language-/.test(className ?? "")
    return (
      <code
        className={cn(
          block ? "font-mono" : "rounded bg-muted px-1.5 py-0.5 font-mono text-[0.8125rem]",
          className
        )}
        {...props}
      />
    )
  },
  blockquote: ({ className, ...props }) => (
    <blockquote className={cn("my-4 border-l-2 pl-4 text-muted-foreground", className)} {...props} />
  ),
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-[0.9375rem] [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_tr:last-child>td]:border-b-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}

/** One paragraph of inline markdown (code, links, emphasis) without the wrapping <p>. */
export function InlineMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{ ...components, p: ({ children }) => <>{children}</> }}
    >
      {children}
    </ReactMarkdown>
  )
}
