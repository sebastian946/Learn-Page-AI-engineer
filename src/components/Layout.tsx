import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Languages, Menu, Moon, Sun, X } from 'lucide-react'
import { useT } from '../i18n'
import { useProgress } from '../store/progress'
import { Sidebar } from './Sidebar'

export function Layout() {
  const { t, locale } = useT()
  const theme = useProgress((s) => s.theme)
  const toggleTheme = useProgress((s) => s.toggleTheme)
  const setLocale = useProgress((s) => s.setLocale)
  const [drawer, setDrawer] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    window.scrollTo(0, 0)
    setDrawer(false)
  }, [pathname])

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-1.5 text-sm font-medium ${
      isActive ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
    }`

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex h-14 items-center gap-3 px-4">
          <button type="button" className="btn-ghost lg:hidden" aria-label={t('nav.menu')} onClick={() => setDrawer(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 font-mono text-xs text-white">AI</span>
            <span className="hidden sm:inline">{t('appName')}</span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={navClass}>
              {t('nav.dashboard')}
            </NavLink>
            <NavLink to="/interview" className={navClass}>
              {t('nav.interview')}
            </NavLink>
            <NavLink to="/glossary" className={navClass}>
              {t('nav.glossary')}
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              className="btn-ghost font-mono text-xs"
              aria-label={t('lang.toggle')}
              title={t('lang.toggle')}
              onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
              data-testid="locale-toggle"
            >
              <Languages className="h-4 w-4" aria-hidden />
              {locale.toUpperCase()}
            </button>
            <button type="button" className="btn-ghost" aria-label={t('theme.toggle')} title={t('theme.toggle')} onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-80 shrink-0 overflow-y-auto border-r border-slate-200 dark:border-slate-800 lg:block">
          <Sidebar />
        </aside>

        {drawer && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
            <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-white dark:bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-200 p-3 dark:border-slate-800">
                <div className="flex gap-1">
                  <NavLink to="/" end className={navClass}>
                    {t('nav.dashboard')}
                  </NavLink>
                  <NavLink to="/interview" className={navClass}>
                    {t('nav.interview')}
                  </NavLink>
                  <NavLink to="/glossary" className={navClass}>
                    {t('nav.glossary')}
                  </NavLink>
                </div>
                <button type="button" className="btn-ghost" aria-label="Close" onClick={() => setDrawer(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Sidebar onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
