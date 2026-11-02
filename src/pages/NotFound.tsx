import { Link } from 'react-router-dom'
import { useT } from '../i18n'

export function NotFound({ message }: { message?: string }) {
  const { t } = useT()
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h1 className="text-2xl font-bold">{t('notFound.title')}</h1>
      {message && <p className="mt-2 text-slate-500">{message}</p>}
      <Link to="/" className="btn-primary mt-6">
        {t('notFound.back')}
      </Link>
    </div>
  )
}
