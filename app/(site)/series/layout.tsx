import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Series',
  description: 'Deep dives and workshops on specific topics.',
};

export default function SeriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
