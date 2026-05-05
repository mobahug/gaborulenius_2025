import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import { FormattedMessage } from "react-intl";
import { Transition } from "../Sections";
import { useBirdEffect } from "../../hooks/useBirdEffect";
import { useLeavesEffect } from "../../hooks/useLeavesEffect";
import { useThemeToggle } from "../../hooks/useThemeToggle";
import { TabKey, tabConfig } from "./navConstants";
import { LanguageToggle } from "./LanguageToggle";
import { colors as lightColors } from "../../colors";
import { colors as darkColors } from "../../colorsDark";
import { useFireflyEffect } from "../../hooks/useFireflyEffect";

type SettingsDialogProps = {
  open: boolean;
  onClose: () => void;
};

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>("effects");
  const { birdEnabled, toggleBirdEffects } = useBirdEffect();
  const { leavesEnabled, toggleLeavesEffects } = useLeavesEffect();
  const { firefliesEnabled, toggleFireflyEffects } = useFireflyEffect();
  const { toggleTheme } = useThemeToggle();

  return (
    <Dialog
      slots={{ transition: Transition }}
      slotProps={{
        transition: {
          timeout: { appear: 600, enter: 600, exit: 600 },
        },
        paper: {
          sx: {
            minWidth: 750,
            py: 1,
          },
        },
      }}
      open={open}
      onClose={onClose}
      aria-labelledby="settings-dialog-title"
    >
      <DialogTitle component="div" sx={{ py: 4, px: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={3}>
            <SettingsIcon
              sx={{
                color:
                  theme.palette.mode === "dark"
                    ? darkColors.textHeading
                    : lightColors.textHeading,
              }}
            />
            <Typography
              id="settings-dialog-title"
              variant="h6"
              component="h3"
              fontWeight={600}
              sx={{
                color:
                  theme.palette.mode === "dark"
                    ? darkColors.textHeading
                    : lightColors.textHeading,
              }}
            >
              <FormattedMessage id="settingsTitle" />
            </Typography>
          </Stack>
          <IconButton
            onClick={onClose}
            aria-label="Close settings"
            sx={{
              color:
                theme.palette.mode === "dark"
                  ? darkColors.textLight
                  : lightColors.textLight,
              "&:hover": {
                color:
                  theme.palette.mode === "dark"
                    ? darkColors.accentHover
                    : lightColors.accentHover,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent dividers>
        <Box sx={{ display: "flex", minHeight: 220 }}>
          {/* Sidebar */}
          <List
            disablePadding
            sx={{
              width: 150,
            }}
          >
            <Divider orientation="vertical" flexItem />
            {tabConfig.map(({ key, id }) => (
              <ListItemButton
                sx={{
                  borderTopLeftRadius: 10,
                  borderBottomLeftRadius: 10,
                }}
                key={key}
                selected={activeTab === key}
                onClick={() => setActiveTab(key)}
              >
                <ListItemText primary={<FormattedMessage id={id} />} />
              </ListItemButton>
            ))}
          </List>
          <Divider orientation="vertical" flexItem />
          {/* Content panel */}
          <Box sx={{ flex: 1, px: 4, py: 2 }}>
            {activeTab === "effects" && (
              <Stack spacing={1}>
                <FormattedMessage id="effectsSubtitle" />
                {[
                  {
                    labelId: "labelBird",
                    checked: birdEnabled,
                    onChange: toggleBirdEffects,
                    disabled: false,
                  },
                  {
                    labelId: "labelLeaves",
                    checked: leavesEnabled,
                    onChange: toggleLeavesEffects,
                    disabled: false,
                  },
                  {
                    labelId: "labelFireflies",
                    checked: firefliesEnabled,
                    onChange: toggleFireflyEffects,
                    disabled: theme.palette.mode === "light",
                  },
                ].map((effect) => (
                  <FormControlLabel
                    key={effect.labelId}
                    control={
                      <Switch
                        checked={effect.checked}
                        onChange={effect.onChange}
                        disabled={effect.disabled}
                        sx={{
                          cursor: effect.disabled ? "not-allowed" : "pointer",
                        }}
                        color="primary"
                      />
                    }
                    label={<FormattedMessage id={effect.labelId} />}
                  />
                ))}
              </Stack>
            )}
            {activeTab === "appearance" && (
              <Stack spacing={3}>
                <FormattedMessage id="appearanceSubtitle" />
                <FormControlLabel
                  control={
                    <Switch
                      checked={theme.palette.mode === "dark"}
                      onChange={toggleTheme}
                      color="primary"
                    />
                  }
                  label={
                    <FormattedMessage
                      id={
                        theme.palette.mode === "dark"
                          ? "labelNightfallMode"
                          : "labelDaylightMode"
                      }
                    />
                  }
                />
              </Stack>
            )}
            {activeTab === "language" && (
              <Stack spacing={3}>
                <FormattedMessage id="languageSubtitle" />
                <LanguageToggle />
              </Stack>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose} size="large">
          <FormattedMessage id="buttonClose" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
