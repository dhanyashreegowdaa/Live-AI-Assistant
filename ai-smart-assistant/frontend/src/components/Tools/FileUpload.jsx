import React, { useRef } from "react";

export default function FileUpload({ onFilesSelected, disabled }) {
  const inputRef = useRef(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,video/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length && onFilesSelected) onFilesSelected(files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        className="tool-btn"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        title="Upload PDF or video"
        aria-label="Upload PDF or video"
      >
        +
      </button>
    </>
  );
}
