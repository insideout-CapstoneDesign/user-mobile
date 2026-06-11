import { Component } from 'react'
import './ErrorBoundary.css'

export default class ErrorBoundary extends Component {
  state = {
    error: null,
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info)
    }
  }

  render() {
    if (this.state.error) {
      const errorMessage =
        this.state.error instanceof Error
          ? this.state.error.message
          : String(this.state.error || '일시적인 오류가 발생했습니다.')

      return (
        <main className="error-boundary">
          <section className="error-boundary__panel">
            <h1>화면을 불러오지 못했습니다.</h1>
            <p>{errorMessage}</p>
            <div className="error-boundary__actions">
              <button type="button" onClick={() => window.history.back()}>
                뒤로가기
              </button>
              <button type="button" onClick={() => window.location.reload()}>
                새로고침
              </button>
            </div>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
