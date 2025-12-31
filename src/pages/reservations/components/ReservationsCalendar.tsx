import { useMemo } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Box, Typography } from "@mui/material";

// Setup the localizer for moment
moment.locale("es");
const localizer = momentLocalizer(moment);

interface Reservation {
  id: string | number;
  fecha: string; // YYYY-MM-DD
  horario: string; // HH:MM or HH:MM:SS
  nombre?: string;
  phone?: string;
  rubro?: string;
  [key: string]: any;
}

interface ReservationsCalendarProps {
  reservas: Reservation[];
  onSelectEvent?: (event: any) => void;
}

export default function ReservationsCalendar({
  reservas,
  onSelectEvent,
}: ReservationsCalendarProps) {
  // Transform reservations to calendar events
  const events = useMemo(() => {
    return reservas
      .map((res) => {
        // Create Start Date
        const dateStr = res.fecha; // e.g., "2025-12-31" or "31/12/2025" logic needed if format varies
        const timeStr = res.horario;

        // Robust parsing (assuming ISO YYYY-MM-DD or similar standard)
        // If fecha is missing, skip or handle
        if (!dateStr || !timeStr) return null;

        const start = moment(`${dateStr} ${timeStr}`, [
          "YYYY-MM-DD HH:mm",
          "DD/MM/YYYY HH:mm",
          "YYYY-MM-DD HH:mm:ss",
        ]).toDate();
        const end = moment(start).add(1, "hour").toDate(); // Default 1 hour duration if not specified

        return {
          id: res.id || res._id,
          title: `${res.nombre || "Cliente"} - ${res.rubro || "Turno"}`,
          start,
          end,
          resource: res,
        };
      })
      .filter(Boolean);
  }, [reservas]);

  return (
    <Box
      sx={{
        height: 650,
        backgroundColor: "white",
        p: 0,
        borderRadius: 3,
        overflow: "hidden",
        "& .rbc-calendar": {
          fontFamily: "inherit",
        },
        "& .rbc-toolbar": {
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          "& button": {
            border: "none",
            borderRadius: 1,
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: 500,
            color: "text.primary",
            cursor: "pointer",
            backgroundColor: "transparent",
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.08)",
            },
            "&:active": {
              transform: "scale(0.98)",
            },
            "&.rbc-active": {
              backgroundColor: "#1976d2",
              color: "white",
              boxShadow: "0 2px 4px rgba(25, 118, 210, 0.3)",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            },
            "&:focus": {
              outline: "none",
            },
          },
          "& .rbc-toolbar-label": {
            fontSize: "1.25rem",
            fontWeight: 600,
            textTransform: "capitalize",
          },
        },
        "& .rbc-header": {
          padding: "12px 0",
          fontWeight: 600,
          color: "text.secondary",
          borderBottom: "1px solid #e0e0e0",
          fontSize: "0.875rem",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        },
        "& .rbc-month-view": {
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          overflow: "hidden",
        },
        "& .rbc-day-bg": {
          borderColor: "#f0f0f0",
        },
        "& .rbc-off-range-bg": {
          backgroundColor: "#fafafa",
        },
        "& .rbc-today": {
          backgroundColor: "rgba(25, 118, 210, 0.04)",
        },
        "& .rbc-event": {
          borderRadius: 1,
          backgroundColor: "#1976d2",
          border: "none",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          padding: "2px 5px",
          fontSize: "0.85rem",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "#1565c0",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            transform: "translateY(-1px)",
            zIndex: 10,
          },
          "&:focus": {
            outline: "none",
          },
        },
        "& .rbc-day-slot .rbc-time-column": {
          borderRight: "1px solid #f0f0f0",
        },
        "& .rbc-time-view": {
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          overflow: "hidden",
        },
        "& .rbc-time-header-content": {
          borderLeft: "1px solid #f0f0f0",
        },
        "& .rbc-time-content": {
          borderTop: "1px solid #f0f0f0",
        },
      }}
    >
      <Calendar
        localizer={localizer}
        events={events as any}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          date: "Fecha",
          time: "Hora",
          event: "Evento",
          noEventsInRange: "No hay reservas en este rango.",
        }}
        defaultView={Views.MONTH}
        onSelectEvent={(e: any) => onSelectEvent && onSelectEvent(e.resource)}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        // Custom event styling if we wanted colors based on status/type
        eventPropGetter={(event: any) => ({
          style: {
            backgroundColor: "#1976d2", // Primary blue
            color: "white",
          },
        })}
      />
    </Box>
  );
}
