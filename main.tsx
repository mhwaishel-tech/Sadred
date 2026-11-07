import React from "react";
import ReactDOM from "react-dom/client";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <div style={{ padding: 20, fontSize: 20 }}>
    جاري تحميل SadRed...
  </div>
);

import("./App")
  .then(({ default: App }) => {
    root.render(<App />);
  })
  .catch((error) => {
    root.render(
      <div style={{ padding: 20, color: "red", whiteSpace: "pre-wrap" }}>
        <h2>SadRed – خطأ في التحميل</h2>
        {String(error?.stack || error)}
      </div>
    );
  });
