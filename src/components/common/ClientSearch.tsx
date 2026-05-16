import { useState, useEffect } from "react";
import { Autocomplete, Box, Typography, CircularProgress, TextField } from "@mui/material";
import { getClientes } from "../../services/clienteService";

interface ClientSearchProps {
  value: string;
  onChange: (client: any) => void;
  onTextChange: (text: string) => void;
  required?: boolean;
}

export function ClientSearch({ value, onChange, onTextChange, required }: ClientSearchProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const loadClients = async (searchStr?: string) => {
    setLoading(true);
    try {
      const data = await getClientes({
        search: searchStr,
        limit: 10,
      });
      const list = Array.isArray(data) ? data : (data as any).data || [];
      setOptions(list);
    } catch (err) {
      console.error("Error loading clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (value !== inputValue) {
       setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;

    // Si el campo está vacío, cargamos los iniciales de inmediato
    if (!inputValue) {
      loadClients();
      return;
    }

    // Debounce para la búsqueda asíncrona (como en la página de Clientes)
    const timer = setTimeout(() => {
      loadClients(inputValue);
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue, open]);

  return (
    <Autocomplete
      freeSolo
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
        onTextChange(newInputValue);
      }}
      onChange={(_, newValue: any) => {
        if (newValue && typeof newValue !== 'string') {
          onChange(newValue);
        }
      }}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        return option.nombre_completo || "";
      }}
      // Desactivamos el filtro local de MUI porque ya filtramos del lado del servidor
      filterOptions={(x) => x}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id || option._id || Math.random()}>
          <Box>
            <Typography variant="body1">{option.nombre_completo}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.phone_number || option.wa_id} {option.email ? `• ${option.email}` : ""}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Nombre Cliente"
          placeholder="Buscar por nombre o teléfono..."
          required={required}
          size="small"
          fullWidth
          sx={{
            mb: 2,
            '& .MuiInputBase-root': {
              borderRadius: 1.5,
              backgroundColor: (theme: any) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
              border: "1px solid",
              borderColor: (theme: any) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
              '& input': {
                color: 'text.primary',
              },
              '&:hover': {
                borderColor: "primary.main",
              },
              '&.Mui-focused': {
                borderColor: "primary.main",
                boxShadow: (theme: any) => `0 0 0 3px ${theme.palette.primary.main}22`,
              },
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            }
          }}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
