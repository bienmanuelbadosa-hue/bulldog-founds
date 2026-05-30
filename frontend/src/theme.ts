// National University Brand Colors
export const theme = {
  primary: '#003478', // NU Blue
  secondary: '#FFD700', // NU Gold
  accent: '#002244', // Dark Blue
  light: '#F5F5F5',
  white: '#FFFFFF',
  border: '#CCCCCC',
  error: '#DC3545',
  success: '#28A745',
  textDark: '#333333',
  textLight: '#666666',
};

export const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${theme.light};
    color: ${theme.textDark};
  }

  /* Headers */
  h1, h2, h3, h4, h5, h6 {
    color: ${theme.primary};
  }

  /* Links */
  a {
    color: ${theme.primary};
    text-decoration: none;
    cursor: pointer;
  }

  a:hover {
    color: ${theme.accent};
    text-decoration: underline;
  }

  /* Buttons */
  button {
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .btn-primary {
    background-color: ${theme.primary};
    color: ${theme.white};
    padding: 10px 20px;
  }

  .btn-primary:hover {
    background-color: ${theme.accent};
  }

  .btn-secondary {
    background-color: ${theme.secondary};
    color: ${theme.primary};
    padding: 10px 20px;
  }

  .btn-secondary:hover {
    background-color: #FFC700;
  }

  /* Form Elements */
  input, textarea, select {
    width: 100%;
    padding: 10px;
    margin: 8px 0;
    border: 1px solid ${theme.border};
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px rgba(0, 52, 120, 0.1);
  }

  /* Containers */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .card {
    background-color: ${theme.white};
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin: 10px 0;
  }

  /* Error/Success Messages */
  .error {
    color: ${theme.error};
    background-color: #f8d7da;
    padding: 12px;
    border-radius: 4px;
    margin: 10px 0;
    border-left: 4px solid ${theme.error};
  }

  .success {
    color: ${theme.success};
    background-color: #d4edda;
    padding: 12px;
    border-radius: 4px;
    margin: 10px 0;
    border-left: 4px solid ${theme.success};
  }

  /* Pagination */
  .pagination {
    display: flex;
    gap: 5px;
    justify-content: center;
    margin: 20px 0;
  }

  .pagination button {
    padding: 8px 12px;
    background-color: ${theme.white};
    border: 1px solid ${theme.border};
  }

  .pagination button.active {
    background-color: ${theme.primary};
    color: ${theme.white};
    border-color: ${theme.primary};
  }
`;
