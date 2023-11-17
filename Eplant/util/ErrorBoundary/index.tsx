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
    // console.log(error, info)
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
