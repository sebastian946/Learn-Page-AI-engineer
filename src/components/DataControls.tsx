import { useRef } from 'react'
import { Download, RotateCcw, Upload } from 'lucide-react'
import { useT } from '../i18n'
import { useProgress } from '../store/progress'

export function DataControls() {
  const { t } = useT()
  const exportData = useProgress((s) => s.exportData)
  const importData = useProgress((s) => s.importData)
  const reset = useProgress((s) => s.reset)
  const fileInput = useRef<HTMLInputElement>(null)

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-engineer-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const upload = async (file: File) => {
    try {
      importData(await file.text())
      alert(t('data.imported'))
    } catch (e) {
      alert(t('data.importError') + (e as Error).message)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn-secondary" onClick={download}>
        <Download className="h-4 w-4" aria-hidden />
        {t('data.export')}
      </button>
      <button type="button" className="btn-secondary" onClick={() => fileInput.current?.click()}>
        <Upload className="h-4 w-4" aria-hidden />
        {t('data.import')}
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) upload(file)
          e.target.value = ''
        }}
      />
      <button
        type="button"
        className="btn-ghost text-rose-600 dark:text-rose-400"
        onClick={() => confirm(t('data.resetConfirm')) && reset()}
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        {t('data.reset')}
      </button>
    </div>
  )
}
