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

interface BlockedDate {
  start: string;
  end: string;
  reason?: string;
}

interface ReservationsCalendarProps {
  reservas: Reservation[];
  blockedDates?: BlockedDate[];
  onSelectEvent?: (event: any) => void;
}

export default function ReservationsCalendar({
  reservas,
  blockedDates = [],
  onSelectEvent,
}: ReservationsCalendarProps) {
  // Transform reservations to calendar events
  const events = useMemo(() => {
    const resEvents = reservas
      .map((res) => {
        const dateStr = res.fecha;
        const timeStr = res.horario;

        if (!dateStr || !timeStr) return null;

        const start = moment(`${dateStr} ${timeStr}`, [
          "YYYY-MM-DD HH:mm",
          "DD/MM/YYYY HH:mm",
          "YYYY-MM-DD HH:mm:ss",
        ]).toDate();
        const end = moment(start).add(1, "hour").toDate();

        return {
          id: res.id || res._id,
          title: `${res.nombre || "Cliente"} - ${res.rubro || "Turno"}`,
          start,
          end,
          resource: res,
          type: 'reservation'
        };
      })
      .filter(Boolean);

    const blockEvents = (blockedDates || []).map((block, idx) => ({
      id: `block-${idx}`,
      title: `BLOQUEADO: ${block.reason || 'Sin motivo'}`,
      start: new Date(block.start),
      end: new Date(block.end),
      resource: { ...block, type: 'block' },
      type: 'block'
    }));

    return [...resEvents, ...blockEvents];
  }, [reservas, blockedDates]);

  return (
    <Box
      sx={{
        height: 700,
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.4)',
        p: 2,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(10px)',
        overflow: "hidden",
        "& .rbc-calendar": {
          fontFamily: "inherit",
          color: 'text.primary',
        },
        "& .rbc-toolbar": {
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: 'wrap',
          gap: 2,
          '& button': {
            borderRadius: 1.5,
            height: 36,
            px: 2,
            fontSize: '0.85rem',
            fontWeight: 500,
            textTransform: 'none',
            transition: 'all 0.2s ease',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'transparent',
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'primary.main',
              color: 'primary.main',
            },
            '&.rbc-active': {
              bgcolor: 'primary.main',
              color: 'white',
              borderColor: 'primary.main',
              boxShadow: (theme: any) => `0 4px 12px ${theme.palette.primary.main}44`,
            }
          },
          "& .rbc-toolbar-label": {
            fontSize: "1.25rem",
            fontWeight: 600,
            textTransform: "capitalize",
            color: 'text.primary',
          },
        },
        "& .rbc-month-view": {
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'transparent',
        },
        "& .rbc-month-header": {
          bgcolor: 'action.hover',
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
        "& .rbc-header": {
          py: 1.5,
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: 1,
          borderBottom: 'none',
        },
        "& .rbc-day-bg": {
          borderLeft: '1px solid',
          borderColor: 'divider',
          transition: 'background-color 0.2s',
          '&:hover': {
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          }
        },
        "& .rbc-off-range-bg": {
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
        },
        "& .rbc-today": {
          bgcolor: (theme: any) => `${theme.palette.primary.main}08`,
        },
        "& .rbc-event": {
          borderRadius: '6px',
          padding: '4px 8px',
          fontSize: '0.75rem',
          fontWeight: 600,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: 'none',
          '&:focus': { outline: 'none' },
        },
        "& .rbc-show-more": {
          fontSize: '0.65rem',
          fontWeight: 700,
          color: 'primary.main',
          bgcolor: (theme: any) => theme.palette.mode === 'dark' ? 'rgba(11, 129, 133, 0.15)' : 'rgba(11, 129, 133, 0.08)',
          borderRadius: '4px',
          px: 1,
          py: 0.3,
          mt: 0.5,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'inline-block',
          transition: 'all 0.2s ease',
          '&:hover': {
            textDecoration: 'none',
            bgcolor: 'primary.main',
            color: 'white',
            transform: 'translateY(-1px)',
          }
        },
        "& .rbc-overlay": {
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(20, 20, 20, 0.9) !important' : 'rgba(255, 255, 255, 0.9) !important',
          backdropFilter: 'blur(20px) saturate(180%) !important',
          borderRadius: '12px !important',
          border: '1px solid !important',
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1) !important' : 'rgba(0, 0, 0, 0.1) !important',
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 8px 32px rgba(0,0,0,0.5)' 
            : '0 8px 32px rgba(0,0,0,0.15)',
          p: '12px !important',
          zIndex: 1000,
          minWidth: 280,
          "& .rbc-overlay-header": {
            borderBottom: '1px solid',
            borderColor: 'divider',
            pb: 1,
            mb: 1.5,
            fontWeight: 700,
            fontSize: '0.8rem',
            color: 'primary.main',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          },
          "& .rbc-event": {
            mb: 0.75,
            width: '100%',
            borderRadius: '6px',
            '&:last-child': { mb: 0 },
          }
        },
        "& .rbc-time-view": {
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1.5,
          overflow: "hidden",
          bgcolor: 'transparent',
        },
        "& .rbc-timeslot-group": {
          borderColor: "divider",
          minHeight: '60px',
        },
        "& .rbc-time-header": {
          "& .rbc-header": {
            borderBottom: '1px solid',
            borderColor: 'divider',
          }
        },
        "& .rbc-agenda-view": {
          borderRadius: 1.5,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          "& .rbc-agenda-table": {
            border: 'none',
            "& thead > tr > th": {
              bgcolor: 'action.hover',
              py: 2,
              px: 3,
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: 1,
            },
            "& tbody > tr": {
              '&:hover': {
                bgcolor: 'action.hover',
              },
              "& td": {
                py: 2,
                px: 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }
            }
          }
        },
        "& .rbc-time-content": {
          borderTop: "1px solid",
          borderColor: "divider",
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
        popup={true}
        onSelectEvent={(e: any) => onSelectEvent && onSelectEvent(e.resource)}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        // Custom event styling if we wanted colors based on status/type
        eventPropGetter={(event: any) => {
          const isBlock = event.type === 'block';
          const bgColor = isBlock ? "#ef4444" : "#0f766e";
          return {
            style: {
              backgroundColor: bgColor,
              backgroundImage: isBlock 
                ? 'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.05) 75%, transparent 75%, transparent)' 
                : 'none',
              backgroundSize: isBlock ? '20px 20px' : 'none',
              color: "white",
              opacity: 0.95,
              border: `1px solid ${isBlock ? '#dc2626' : '#0d9488'}`,
            },
          };
        }}
      />
    </Box>
  );
}
