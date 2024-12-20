import React, { useState } from 'react';
import { Sector, SECTORS } from '../../types/personnel';
import './TransferModal.css';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (newSector: Sector) => void;
  currentSector: Sector;
}

export default function TransferModal({ isOpen, onClose, onTransfer, currentSector }: TransferModalProps) {
  const [selectedSector, setSelectedSector] = useState<Sector>(currentSector);

  if (!isOpen) return null;

  const handleTransfer = () => {
    if (selectedSector !== currentSector) {
      onTransfer(selectedSector);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Transferir Policial</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="current-sector">Setor Atual</label>
            <input
              id="current-sector"
              type="text"
              value={currentSector}
              disabled
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-sector">Novo Setor</label>
            <select
              id="new-sector"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value as Sector)}
              className="form-control"
            >
              {SECTORS.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancelar
          </button>
          <button
            onClick={handleTransfer}
            disabled={selectedSector === currentSector}
            className="btn btn-primary"
          >
            Transferir
          </button>
        </div>
      </div>
    </div>
  );
}
