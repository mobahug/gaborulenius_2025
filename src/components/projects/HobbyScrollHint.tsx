import { IconButton } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useIntl } from "react-intl";

type HobbyScrollHintProps = {
  accent: string;
  onClick: () => void;
};

const HobbyScrollHint = ({ accent, onClick }: HobbyScrollHintProps) => {
  const intl = useIntl();

  return (
    <IconButton
      aria-label={intl.formatMessage({
        id: "projectHobbyScrollDownLabel",
      })}
      onClick={onClick}
      sx={{
        position: "absolute",
        left: "50%",
        bottom: { xs: 10, sm: 14 },
        zIndex: 2,
        width: 44,
        height: 44,
        transform: "translateX(-50%)",
        backgroundColor: "rgba(0,0,0,.45)",
        backdropFilter: "blur(10px)",
        border: `1px solid ${accent}`,
        boxShadow: "0 12px 26px rgba(0,0,0,.32)",
        "&:hover": {
          backgroundColor: "rgba(0,0,0,.6)",
        },
      }}
    >
      <KeyboardArrowDownIcon sx={{ fontSize: 30 }} />
    </IconButton>
  );
};

export default HobbyScrollHint;
