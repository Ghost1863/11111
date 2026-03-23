import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';

const FAQTIPS_PATH = path.join(process.cwd(), 'content', 'faqtips');

export type FaqTip = {
  title: string;
  description?: string;
  date?: string;
  slug: string;
  content: string;
};

export async function getFaqTips(): Promise<FaqTip[]> {
  const files = await glob('*.mdx', { cwd: FAQTIPS_PATH });
  return files.map((file) => {
    const filePath = path.join(FAQTIPS_PATH, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    return {
      ...(data as Omit<FaqTip, 'slug' | 'content'>),
      slug: file.replace(/\.mdx?$/, ''),
      content,
    };
  });
}

export async function getFaqTipBySlug(slug: string): Promise<FaqTip | null> {
  const filePath = path.join(FAQTIPS_PATH, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  return {
    ...(data as Omit<FaqTip, 'slug' | 'content'>),
    slug,
    content,
  };
} 