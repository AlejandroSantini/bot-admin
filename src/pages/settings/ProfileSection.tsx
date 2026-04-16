import {
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import type { TenantInfo } from "../../services/settingsService";
import { CustomPaper } from "../../components/common/CustomPaper";

interface ProfileSectionProps {
  tenant: TenantInfo;
}

export default function ProfileSection({ tenant }: ProfileSectionProps) {
  return (
    <CustomPaper>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        <Avatar 
          sx={{ 
            width: 70, 
            height: 70, 
            bgcolor: 'primary.main',
            fontSize: '1.8rem',
            fontWeight: 700
          }}
        >
          {tenant.name.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight="700">
            {tenant.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
            Usuario: <span style={{ color: 'var(--mui-palette-primary-main)' }}>{tenant.code}</span>
          </Typography>
        </Box>
      </Box>
    </CustomPaper>
  );
}
