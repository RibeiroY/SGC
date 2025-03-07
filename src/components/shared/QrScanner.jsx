import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Box } from '@mui/material';

const QrScanner = ({ onScan, onError, onClose }) => {
  useEffect(() => {
    const config = { fps: 10, qrbox: 250 };
    const scanner = new Html5QrcodeScanner("qr-reader", config, false);

    // Renderiza o scanner e chama o callback onScan quando o QR é lido
    scanner.render(
      (decodedText, decodedResult) => {
        onScan(decodedText);
        // Para o scanner assim que encontrar um QR
        scanner.clear();
      },
      (errorMessage) => {
        onError(errorMessage);
      }
    );

    // Limpa o scanner ao desmontar o componente
    return () => {
      scanner.clear().catch((err) =>
        console.error("Falha ao limpar o scanner", err)
      );
    };
  }, [onScan, onError]);

  return (
    <Box>
      <div id="qr-reader" style={{ width: "100%", height: "300px" }} />
    </Box>
  );
};

export default QrScanner;