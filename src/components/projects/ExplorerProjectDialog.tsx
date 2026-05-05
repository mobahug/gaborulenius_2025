import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FormattedMessage } from "react-intl";
import { colors as lightColors } from "../../colors";
import { colors as darkColors } from "../../colorsDark";
import { Transition } from "../Sections";
import ExplorerCapabilityGrid from "./ExplorerCapabilityGrid";
import ExplorerCarousel from "./ExplorerCarousel";
import { explorerDetailGroups, explorerStack } from "./explorerProjectData";

type ExplorerProjectDialogProps = {
  fullScreen: boolean;
  onClose: () => void;
  open: boolean;
};

const ExplorerProjectDialog = ({
  fullScreen,
  onClose,
  open,
}: ExplorerProjectDialogProps) => {
  const theme = useTheme();
  const headingColor =
    theme.palette.mode === "dark"
      ? darkColors.textHeading
      : lightColors.textHeading;

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slots={{
        transition: Transition,
      }}
      slotProps={{
        transition: { timeout: { appear: 600, enter: 600, exit: 600 } },
        paper: {
          sx: {
            px: { xs: 4, sm: 6, md: 12 },
            pt: 2,
            pb: 0,
            maxWidth: "1200px",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        },
      }}
      aria-labelledby="explorer-dialog-title"
    >
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          p: 0,
          pb: { xs: 2, md: 1 },
        }}
      >
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{
            color:
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 0 }}>
        <Stack spacing={5}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(0, 1fr) minmax(380px, 440px)",
              },
              gap: { xs: 5, md: 8 },
              alignItems: "start",
            }}
          >
            <Box>
              <Typography
                id="explorer-dialog-title"
                variant="h4"
                component="h2"
                sx={{ color: headingColor, mb: { xs: 3, md: 5 } }}
              >
                <FormattedMessage id="projectExplorerTitle" />
              </Typography>
              <Typography variant="h6" component="h3" gutterBottom>
                <FormattedMessage id="projectExplorerWhyHeading" />
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "text.primary", maxWidth: 640 }}
              >
                <FormattedMessage id="projectExplorerDialogIntro" />
              </Typography>
            </Box>
            <ExplorerCarousel large />
          </Box>
          <Divider />
          <ExplorerCapabilityGrid />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 4,
            }}
          >
            {explorerDetailGroups.map(({ titleId, items }) => (
              <Box key={titleId}>
                <Typography variant="h6" component="h3" gutterBottom>
                  <FormattedMessage id={titleId} />
                </Typography>
                <List
                  disablePadding
                  sx={{
                    listStyle: "disc",
                    pl: 4,
                    "& .MuiListItem-root": {
                      display: "list-item",
                      p: 0,
                      mb: 2,
                    },
                  }}
                >
                  {items.map((itemId) => (
                    <ListItem key={itemId}>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{ color: "text.primary" }}
                          >
                            <FormattedMessage id={itemId} />
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </Box>
          <Divider />
          <Box>
            <Typography variant="h6" component="h3" gutterBottom>
              <FormattedMessage id="projectExplorerStackHeading" />
            </Typography>
            <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
              {explorerStack.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  variant="outlined"
                  sx={{ borderRadius: "8px" }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ py: 4 }}>
        <Button variant="contained" onClick={onClose}>
          <FormattedMessage id="buttonClose" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExplorerProjectDialog;
