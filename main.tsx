import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { error: error.stack || error.message };
  }

  render() {
    if (this.state.error) {
      return (
        <pre style={{ color: "red", padding: 20, whiteSpace: "pre-wrap" }}>
          SADRED ERROR:
          {"\n"}
          {this.state.error}
        </pre>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('SadRed: element with id="root" was not found.');
}

createRoot(rootElement).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
