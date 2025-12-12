import React, { useRef, useState } from "react";

interface UploadInputProps {
  label?: string;
  onFileSelected: (file: File) => Promise<any[] | void> | any[] | void;
  accept?: string; // ex: ".csv, application/vnd.ms-excel"
}

const UploadInput: React.FC<UploadInputProps> = ({
  label = "Upload student data (CSV or XLSX)",
  onFileSelected,
  accept = ".csv, .xlsx"
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("No selected file");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    setFileName(file.name);
    setSuccessMessage(""); // Limpar mensagem anterior
    
    try {
      const result = await onFileSelected(file);
      // Exibir mensagem de sucesso
      if (result && Array.isArray(result)) {
        setSuccessMessage(`✅ Importação concluída com sucesso! ${result.length} aluno(s) importado(s).`);
        // Limpar mensagem após 5 segundos
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (error) {
      setSuccessMessage("❌ Erro ao importar arquivo. Verifique o formato e tente novamente.");
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  };

  return (
    <div className="student-form">
      <h2 style={styles.label}>{label}</h2>

      <div className="form-buttons">
        <button name="Select file" type="submit" disabled={false} onClick={handleClick}>
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
      
      {successMessage && (
        <div style={successMessage.includes('✅') ? styles.successMessage : styles.errorMessage}>
          {successMessage}
        </div>
      )}
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
  },
  successMessage: {
    padding: "12px",
    borderRadius: "6px",
    backgroundColor: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
    fontSize: "14px",
    marginTop: "10px",
    fontWeight: 500
  },
  errorMessage: {
    padding: "12px",
    borderRadius: "6px",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
    fontSize: "14px",
    marginTop: "10px",
    fontWeight: 500
  }
};
