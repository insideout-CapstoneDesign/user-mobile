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
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <main className="error-boundary">
          <section className="error-boundary__panel">
            <h1>화면을 불러오지 못했습니다.</h1>
            <p>{this.state.error.message}</p>
            <button type="button" onClick={() => window.location.reload()}>
              새로고침
            </button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
