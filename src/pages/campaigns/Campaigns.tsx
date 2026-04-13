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

import { getCampaigns, runCampaign, deleteCampaign } from "../../services/campaignService";
import type { Campaign } from "../../services/campaignService";
import { OutlinedButton } from "../../components/common/OutlinedButton";
import { IconButton } from "@mui/material";

export default function Campaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleRun = async (id: string | number) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas ejecutar esta campaña ahora?",
      )
    )
      return;
    try {
      await runCampaign(id);
      alert("Campaña ejecutada correctamente");
      loadCampaigns();
    } catch (err) {
      alert("Error al ejecutar la campaña");
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta campaña?"))
      return;
    try {
      await deleteCampaign(id);
      alert("Campaña eliminada correctamente");
      loadCampaigns();
    } catch (err) {
      alert("Error al eliminar la campaña");
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
              handleRun(c.id!);
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
    <Box sx={{ mx: "auto", p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Campañas
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <ContainedButton
            startIcon={<AddIcon />}
            onClick={() => navigate("/campanas/nueva")}
          >
            Nueva Campaña
          </ContainedButton>
        </Box>
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
    </Box>
  );
}
