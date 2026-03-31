'use client';


import clsx from 'clsx';
import { Home, Package, Package2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/dashboard', icon: Home },
  {
    name: 'Manage Category',
    href: '/dashboard/manage-category',
    icon: Package2,
  },
  { name: 'Manage Products', href: '/dashboard/manage-products', icon: Package },
];
 
export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-11 w-full items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              {
                'bg-muted text-foreground': pathname === link.href,
              }
            )}
          >
            <LinkIcon className="h-4 w-4" />
            <p>{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
