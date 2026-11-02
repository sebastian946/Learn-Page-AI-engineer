import { Component, type ReactNode } from 'react'

/** Keeps a broken lesson from taking down the whole app. Reset it by changing `key`. */
export class ErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" data-testid="lesson-error" className="not-prose rounded-lg border border-rose-500/50 bg-rose-50 p-4 text-sm dark:bg-rose-950/30">
        {this.props.fallback}
        <pre className="mt-2 whitespace-pre-wrap text-xs text-rose-700 dark:text-rose-300">{this.state.error.message}</pre>
      </div>
    )
  }
}
