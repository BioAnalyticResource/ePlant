import { Component, ErrorInfo, PropsWithChildren } from 'react'
export default class ErrorBoundary extends Component<
  PropsWithChildren,
  { hasError: boolean }
> {
  constructor(props: PropsWithChildren) {
    super(props)
    this.state = { hasError: false }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ hasError: true })
  }
  render() {
    if (this.state.hasError) {
      setTimeout(() => {
        this.setState({ hasError: false })
      }, 5000)
      return <h1>Something went wrong.</h1>
    }
    return this.props.children
  }
}
