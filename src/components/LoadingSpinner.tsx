import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading...", 
  size = "md", 
  fullPage = false 
}) => {
  const spinnerClass = size === "md" ? "spinner" : `spinner spinner-${size}`;
  
  const content = (
    <div className="loading-container">
      <div className={spinnerClass} />
      {message && <p className="loading-text">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{ 
        display: "flex", 
        height: "50vh", 
        width: "100%", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
