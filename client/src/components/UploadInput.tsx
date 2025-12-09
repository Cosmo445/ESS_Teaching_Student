import React, { useRef, useState } from "react";

interface UploadInputProps {
  label?: string;
  onFileSelected: (file: File) => void;
  accept?: string; // ex: ".csv, application/vnd.ms-excel"
}

const UploadInput: React.FC<UploadInputProps> = ({
  label = "Upload student data (CSV or XLSX)",
  onFileSelected,
  accept = ".csv, .xlsx"
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("No selected file");

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    setFileName(file.name);
    onFileSelected(file);
  };

  return (
    <div className="student-form">
      <h2 style={styles.label}>{label}</h2>

      <div className="form-buttons">
        <button type="submit" disabled={false} onClick={handleClick}>
          {'Select file'}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <p style={styles.fileName}>file: {fileName}</p>
    </div>
  );
};

export default UploadInput;

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxWidth: "300px"
  },
  label: {
    fontWeight: 500
  },
  button: {
    padding: "8px 12px",
    borderRadius: "6px",
    backgroundColor: "#3f51b5",
    color: "white",
    cursor: "pointer",
    border: "none",
    fontSize: "24px",
  },
  fileName: {
    fontSize: "14px",
    color: "#555",
    padding: "10px"
  }
};
