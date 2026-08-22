import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

const styles = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
const variants = { primary: 'bg-brand text-white hover:bg-indigo-500', secondary: 'bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-950', ghost: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800' };

type Props = { children: ReactNode; variant?: keyof typeof variants; href?: string; className?: string } & ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>;

export function Button({ children, variant = 'primary', href, className = '', ...props }: Props) {
  const classNames = `${styles} ${variants[variant]} ${className}`;
  if (href) return <Link href={href} className={classNames}>{children}</Link>;
  return <button className={classNames} {...props}>{children}</button>;
}
