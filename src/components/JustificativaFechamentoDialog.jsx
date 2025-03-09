import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
} from '@mui/material';

const JustificativaFechamentoDialog = ({ open, onClose, onConfirm }) => {
  const [justificativa, setJustificativa] = useState('');
  const [opcaoSelecionada, setOpcaoSelecionada] = useState('');

  const opcoesJustificativa = [
    'Problema resolvido',
    'Equipamento substituído',
    'Chamado duplicado',
    'Solicitação inválida',
    'Outro',
  ];

  const handleConfirmar = () => {
    onConfirm(opcaoSelecionada === 'Outro' ? justificativa : opcaoSelecionada);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Justificativa de Fechamento</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset">
          <RadioGroup
            value={opcaoSelecionada}
            onChange={(e) => setOpcaoSelecionada(e.target.value)}
          >
            {opcoesJustificativa.map((opcao, index) => (
              <FormControlLabel
                key={index}
                value={opcao}
                control={<Radio />}
                label={opcao}
              />
            ))}
          </RadioGroup>
        </FormControl>
        {opcaoSelecionada === 'Outro' && (
          <TextField
            fullWidth
            label="Digite a justificativa"
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            sx={{ mt: 2 }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleConfirmar} color="primary" disabled={!opcaoSelecionada || (opcaoSelecionada === 'Outro' && !justificativa)}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JustificativaFechamentoDialog;