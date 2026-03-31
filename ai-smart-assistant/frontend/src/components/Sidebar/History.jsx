// Chat History Component
import React, { useState } from "react";

export default function History() {
  const [history] = useState([
    "How to prepare for placements?",
    "Latest AI news",
    "Explain machine learning",
  ]);

  return (
    <div className="history-container">
      <h3 className="history-title">History</h3>

      <div className="history-list">
        {history.map((item, index) => (
          <div key={index} className="history-item">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}