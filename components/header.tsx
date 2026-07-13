'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MobileSidebarDrawer } from '@/components/mobile-sidebar-drawer'
import { useSidebar } from '@/context/sidebar-context'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/api/auth'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { collapsed } = useSidebar()
  const router = useRouter()

  const handleLogout = async () => {
    await authAPI.logout()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <MobileSidebarDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`
          fixed top-0 right-0 h-16 z-30
          bg-background/90 backdrop-blur-md
          border-b border-border
          px-5 lg:px-6
          flex items-center justify-between
          transition-[left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          left-0
          ${collapsed ? 'lg:left-20' : 'lg:left-64'}
        `}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg h-9 w-9"
          >
            <span className="material-symbols-outlined text-[18px]">menu</span>
          </Button>

          <h1 className="hidden md:block font-serif text-lg font-bold text-primary">
            SMK PLUS PNB
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground hover:bg-accent rounded-full h-10 w-10"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full" />
          </Button>

          <div className="w-px h-6 bg-border mx-2" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="
                  flex items-center gap-3 px-2 py-1.5 h-10 rounded-full
                  text-foreground hover:bg-accent
                  transition-all duration-200 cursor-pointer
                "
              >
                <div className="text-right hidden sm:block">
                  <div className="font-label-caps text-label-caps text-foreground uppercase">Admin Utama</div>
                  <div className="text-[12px] text-muted-foreground">Administrator</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-accent border border-border flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
                  <span className="material-symbols-outlined text-muted-foreground text-[20px]">account_circle</span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="bg-card border border-border rounded-lg text-foreground w-48 p-1 shadow-lg"
            >
              <DropdownMenuItem
                onClick={() => router.push('/admin/pengaturan')}
                className="rounded-lg hover:bg-accent cursor-pointer text-sm"
              >
                Pengaturan Token
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-lg hover:bg-destructive/10 text-destructive focus:text-destructive cursor-pointer text-sm font-medium"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>
    </>
  )
}