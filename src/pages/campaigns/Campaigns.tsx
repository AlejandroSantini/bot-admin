import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
} from "@mui/material";
import { Add as AddIcon, PlayArrow as PlayIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { Table } from "../../components/common/Table";
import { ContainedButton } from "../../components/common/ContainedButton";

import { getCampaigns, deleteCampaign } from "../../services/campaignService";
import type { Campaign } from "../../services/campaignService";
import { OutlinedButton } from "../../components/common/OutlinedButton";
import { IconButton, Snackbar } from "@mui/material";
import BroadcastModal from "./BroadcastModal";

export default function Campaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const loadCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCampaigns();
      const list = Array.isArray(res) ? res : res.data || [];
      setCampaigns(list);
    } catch (err: any) {
      console.error(err);
      setError("Error cargando campañas");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleOpenBroadcast = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta campaña?"))
      return;
    try {
      await deleteCampaign(id);
      setSnackbar({ open: true, message: "Campaña eliminada correctamente" });
      loadCampaigns();
    } catch (err) {
      setSnackbar({ open: true, message: "Error al eliminar la campaña" });
    }
  };

  const columns = [
    { label: "Nombre", render: (c: Campaign) => c.nombre || "-" },
    { label: "Mensaje", render: (c: Campaign) => c.mensaje || "-" },
    { label: "Estado", render: (c: Campaign) => c.estado || "-" },
    {
      label: "Acciones",
      render: (c: Campaign) => (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <OutlinedButton
            size="small"
            startIcon={<PlayIcon />}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleOpenBroadcast(c);
            }}
          >
            Difundir
          </OutlinedButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleDelete(c.id!);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ mx: "auto", p: { xs: 1, sm: 2 }, width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, gap: 2, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Campañas
        </Typography>

        <ContainedButton
          startIcon={<AddIcon />}
          onClick={() => navigate("/campanas/nueva")}
        >
          Nueva Campaña
        </ContainedButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table
          columns={columns}
          data={campaigns}
          getRowKey={(c: Campaign) => c.id!}
          onRowClick={(c: Campaign) => navigate(`/campanas/${c.id}`, { state: { campaign: c } })}
          emptyMessage="No hay campañas registradas."
        />
      )}

      <BroadcastModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        campaign={selectedCampaign}
        onSuccess={() => {
          setSnackbar({ open: true, message: "Envío iniciado correctamente" });
          loadCampaigns();
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
