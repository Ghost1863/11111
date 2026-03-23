import type { MDXComponents } from 'mdx/types';
import { CodeMdx } from './components/mdx/CodeMdx';
import { Table } from '@medusajs/ui';

const components = {
  h1: ({ children }) => <h1 className="text-2xl md:text-4xl text-ui-fg-base">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl md:text-2xl text-ui-fg-base">{children}</h2>,
  p: ({ children }) => <p className="text-ui-fg-subtle">{children}</p>,
  li: ({ children }) => <li className="text-ui-fg-subtle">{children}</li>,
  table: ({ children }) => (
    <div className="overflow-x-scroll border-x rounded-md">
      <Table className="table-auto">{children}</Table>
    </div>
  ),
  tr: ({ children }) => <Table.Row>{children}</Table.Row>,
  td: ({ children }) => <Table.Cell>{children}</Table.Cell>,
  th: ({ children }) => <Table.HeaderCell>{children}</Table.HeaderCell>,
  tbody: ({ children }) => <Table.Body>{children}</Table.Body>,
  thead: ({ children }) => <Table.Header>{children}</Table.Header>,
  img: () => null,
  code: CodeMdx,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
