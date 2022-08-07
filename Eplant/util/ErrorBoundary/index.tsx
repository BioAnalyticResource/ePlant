import React, { ErrorInfo } from 'react'
export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { hasError: boolean }
> {
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = { hasError: false }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ hasError: true })
  }
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>
    }
    return this.props.children
  }
}
