import type { ComponentProps } from "react";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

function mergeClassName(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const mdxComponents: MDXRemoteProps["components"] = {
  table: ({ className, ...props }: ComponentProps<"table">) => (
    <div className="my-6 max-w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className={mergeClassName("m-0 w-full min-w-[42rem] border-collapse text-sm", className)} {...props} />
    </div>
  ),
  thead: ({ className, ...props }: ComponentProps<"thead">) => (
    <thead className={mergeClassName("bg-gray-50", className)} {...props} />
  ),
  th: ({ className, ...props }: ComponentProps<"th">) => (
    <th className={mergeClassName("px-4 py-3 text-left font-semibold text-gray-900", className)} {...props} />
  ),
  td: ({ className, ...props }: ComponentProps<"td">) => (
    <td className={mergeClassName("border-t border-gray-200 px-4 py-3 align-top text-gray-700", className)} {...props} />
  ),
};
