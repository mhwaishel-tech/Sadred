import React from "react";
import ReactDOM from "react-dom/client";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
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

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(<div style={{ padding: 20 }}>جاري تحميل SadRed...</div>);

import("./App")
  .then(({ default: App }) => {
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  })
  .catch((error) => {
    root.render(
      <pre style={{ color: "red", padding: 20, whiteSpace: "pre-wrap" }}>
        {String(error?.stack || error)}
      </pre>
    );
  });
