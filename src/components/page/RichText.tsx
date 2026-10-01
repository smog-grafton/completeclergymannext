import type { RichTextBlock } from "@/types";

interface RichTextProps {
  blocks: RichTextBlock[];
  className?: string;
}

export function RichText({ blocks, className = "prose" }: RichTextProps) {
  return (
    <div className={className}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "heading") {
          return block.level === 2 ? <h2 key={key}>{block.text}</h2> : <h3 key={key}>{block.text}</h3>;
        }

        if (block.type === "quote") {
          return (
            <blockquote key={key}>
              {block.text}
              {block.attribution ? <footer>— {block.attribution}</footer> : null}
            </blockquote>
          );
        }

        if (block.type === "scripture") {
          return (
            <blockquote key={key}>
              {block.text}
              <footer>— {block.reference}</footer>
            </blockquote>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={key}>
              {block.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          );
        }

        return <p key={key}>{block.text}</p>;
      })}
    </div>
  );
}
