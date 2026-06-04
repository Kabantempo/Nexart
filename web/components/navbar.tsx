'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface MenuItem {
  title: string
  url: string
  description?: string
  items?: MenuItem[]
}

const menuItems: MenuItem[] = [
  { title: 'Accueil', url: '/' },
  {
    title: 'Découvrir',
    url: '#',
    items: [
      {
        title: 'Événements',
        description: 'Marchés, salons et pop-ups artisanaux',
        url: '/events',
      },
      {
        title: 'Créateurs',
        description: 'Trouvez artisans et créateurs',
        url: '/creators',
      },
    ],
  },
  {
    title: 'Ressources',
    url: '#',
    items: [
      {
        title: 'À propos',
        description: 'En savoir plus sur Nexart',
        url: '/about',
      },
      {
        title: 'Contact',
        description: 'Nous contacter',
        url: '/contact',
      },
    ],
  },
]

const mobileExtraLinks = [
  { name: 'FAQ', url: '/faq' },
  { name: 'Blog', url: '/blog' },
]

export function Navbar() {
  return (
    <section className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto">
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-[#6366F1]">
              Nexart
            </Link>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menuItems.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">S'inscrire</Link>
            </Button>
          </div>
        </nav>
        <div className="block lg:hidden">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="text-2xl font-bold text-[#6366F1]">
              Nexart
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <Link href="/" className="text-2xl font-bold text-[#6366F1]">
                      Nexart
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="my-6 flex flex-col gap-6">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {menuItems.map((item) => renderMobileMenuItem(item))}
                  </Accordion>
                  <div className="border-t py-4">
                    <div className="grid grid-cols-2 justify-start gap-2">
                      {mobileExtraLinks.map((link, idx) => (
                        <Link
                          key={idx}
                          className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-[#888888] transition-colors hover:text-[#6366F1]"
                          href={link.url}
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login">Connexion</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/register">S'inscrire</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  )
}

function renderMenuItem(item: MenuItem) {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title} className="text-[#888888]">
        <NavigationMenuTrigger className="text-[#888888] hover:text-[#6366F1]">
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="w-80 p-3">
            <NavigationMenuLink>
              {item.items.map((subItem) => (
                <li key={subItem.title}>
                  <Link
                    className="flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#F5F5F7] hover:text-[#6366F1]"
                    href={subItem.url}
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#1A1A1A]">
                        {subItem.title}
                      </div>
                      {subItem.description && (
                        <p className="text-sm leading-snug text-[#888888]">
                          {subItem.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </NavigationMenuLink>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }

  return (
    <Link
      key={item.title}
      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-[#888888] transition-colors hover:text-[#6366F1]"
      href={item.url}
    >
      {item.title}
    </Link>
  )
}

function renderMobileMenuItem(item: MenuItem) {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <Link
              key={subItem.title}
              className="flex select-none gap-4 rounded-md p-3 leading-none outline-none transition-colors hover:text-[#6366F1]"
              href={subItem.url}
            >
              <div>
                <div className="text-sm font-semibold text-[#1A1A1A]">
                  {subItem.title}
                </div>
                {subItem.description && (
                  <p className="text-sm leading-snug text-[#888888]">
                    {subItem.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </AccordionContent>
      </AccordionItem>
    )
  }

  return (
    <Link
      key={item.title}
      href={item.url}
      className="font-semibold text-[#1A1A1A] hover:text-[#6366F1]"
    >
      {item.title}
    </Link>
  )
}
