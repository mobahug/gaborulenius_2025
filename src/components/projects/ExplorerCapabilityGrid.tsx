import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";
import { colors as lightColors } from "../../colors";
import { colors as darkColors } from "../../colorsDark";
import { explorerCapabilities } from "./explorerProjectData";

const ExplorerCapabilityGrid = ({ dense = false }: { dense?: boolean }) => {
  const theme = useTheme();
  const accent =
    theme.palette.mode === "dark" ? darkColors.accent : lightColors.accent;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
        gap: 3,
      }}
    >
      {explorerCapabilities.map(({ icon, titleId, bodyId }) => (
        <Box
          key={titleId}
          sx={{
            p: dense ? 3 : 4,
            borderRadius: "8px",
            border: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: "rgba(255,255,255,.045)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              color: accent,
              "& .MuiSvgIcon-root": { color: accent },
            }}
          >
            {icon}
            <Typography variant="subtitle2" component="h4">
              <FormattedMessage id={titleId} />
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            <FormattedMessage id={bodyId} />
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ExplorerCapabilityGrid;
