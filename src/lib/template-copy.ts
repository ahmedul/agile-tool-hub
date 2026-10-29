export interface TemplateSection {
  title: string;
  markdown: string;
}

export function extractTemplateSections(content: string): TemplateSection[] {
  const sections: TemplateSection[] = [];
  let heading = "Template";
  let fence = "";
  let lines: string[] = [];
  for (const line of content.split("\n")) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (!fence && marker) {
      fence = marker[1];
      lines = [];
    } else if (fence && marker && marker[1][0] === fence[0] && marker[1].length >= fence.length) {
      const markdown = lines.join("\n").trim();
      if (markdown) sections.push({ title: heading, markdown });
      fence = "";
    } else if (fence) {
      lines.push(line);
    } else {
      const match = line.match(/^#{2,3}\s+(.+)/);
      if (match) heading = match[1].trim();
    }
  }
  return sections;
}
