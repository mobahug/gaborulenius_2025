import { Box, Button, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { motion } from "framer-motion";
import { FormattedMessage } from "react-intl";
import { fadeUp } from "../sectionMotion";
import ExplorerCapabilityGrid from "./ExplorerCapabilityGrid";
import ExplorerCarousel from "./ExplorerCarousel";

type ExplorerProjectPanelProps = {
  onDetailsClick: () => void;
};

const ExplorerProjectPanel = ({
  onDetailsClick,
}: ExplorerProjectPanelProps) => {
  return (
    <motion.div initial={false} animate="visible" custom={2} variants={fadeUp}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr)" },
          gap: { xs: 5, md: 6 },

          p: { xs: 4, md: 6 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 1fr) minmax(260px, 300px)",
            },
            gap: { xs: 5, md: 7 },
            alignItems: "start",
          }}
        >
          <Box>
            <Typography variant="h5" component="h3" gutterBottom>
              <FormattedMessage id="projectExplorerTitle" />
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.primary", maxWidth: 560, mb: 5 }}
            >
              <FormattedMessage id="projectExplorerSummary" />
            </Typography>
            <Button
              variant="contained"
              startIcon={<InfoOutlinedIcon />}
              onClick={onDetailsClick}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              <FormattedMessage id="projectExplorerButtonDetails" />
            </Button>
          </Box>
          <ExplorerCarousel />
        </Box>
        <ExplorerCapabilityGrid dense />
      </Box>
    </motion.div>
  );
};

export default ExplorerProjectPanel;
