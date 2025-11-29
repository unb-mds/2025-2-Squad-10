import React, { useState } from 'react';
import '../../style/PDFBotao.css';

interface PdfButtonProps {
  url: string;
  label: string;
  filename?: string;
}

const PdfButton: React.FC<PdfButtonProps> = ({ url, label, filename = 'relatorio_oncomap.pdf' }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;

    setLoading(true);

    // 1. Abre a aba de carregamento (Feedback Visual)
    const newWindow = window.open('', '_blank');

    if (!newWindow) {
      alert("Por favor, permita popups para baixar o relatório.");
      setLoading(false);
      return;
    }

    // 2. Preenche com o visual de "Aguarde"
    newWindow.document.write(`
      <html>
        <head>
          <title>Processando...</title>
          <style>
            body { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f5f5f5; font-family: sans-serif; color: #134611; }
            .spinner { border: 5px solid #e0e0e0; border-top: 5px solid #3DA35D; border-radius: 50%; width: 60px; height: 60px; animation: spin 1s linear infinite; margin-bottom: 25px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            p { color: #666; font-size: 16px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="spinner"></div>
          <h2>Gerando Relatório com IA...</h2>
          <p>Assim que o download iniciar, esta janela fechará.</p>
        </body>
      </html>
    `);

    try {
      // 3. Busca o PDF (Aguardando o Backend...)
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Erro na geração do PDF');

      // 4. Prepara o arquivo na memória
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // 5. DISPARA O DOWNLOAD (Na mesma aba de carregamento)
      const link = newWindow.document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      newWindow.document.body.appendChild(link);
      link.click(); // O navegador inicia o download aqui
      link.remove();

      // 6. FECHA A ABA DE CARREGAMENTO
      // Damos um pequeno delay (1.5s) apenas para garantir que o navegador registrou o download
      // antes de destruir a janela.
      setTimeout(() => {
        newWindow.close();
      }, 1500);

    } catch (error) {
      console.error("Erro PDF:", error);
      // Se der erro, mantemos a aba aberta para mostrar o problema
      if (!newWindow.closed) {
        newWindow.document.body.innerHTML = `
            <div style="text-align: center; color: red; font-family: sans-serif; padding: 40px;">
                <h2>❌ Erro ao gerar relatório</h2>
                <p>Tente novamente.</p>
                <button onclick="window.close()" style="cursor: pointer; padding: 10px; margin-top: 20px;">Fechar</button>
            </div>
        `;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      className="pdf-btn" 
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="pdf-btn-spinner"></span>
          Gerando...
        </>
      ) : (
        label
      )}
    </button>
  );
};

export default PdfButton;