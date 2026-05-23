export interface MarkdownToken {
  type: 'text' | 'bold' | 'italic';
  value: string;
}

export function markdownParser(text: string): MarkdownToken[] {
  if (!text) return [];

  // Split by bold (**text**) or italic (*text*) markers, keeping the matched delimiters in the output
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

  return parts
    .map((part): MarkdownToken | null => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return { type: 'bold', value: part.slice(2, -2) };
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return { type: 'italic', value: part.slice(1, -1) };
      }
      if (part) {
        return { type: 'text', value: part };
      }
      return null;
    })
    .filter((token): token is MarkdownToken => token !== null);
}
