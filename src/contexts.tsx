import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Grid,
  Box,
} from "@mui/material";
import { colors as lightColors } from "./colors";
import { colors as darkColors } from "./colorsDark";
import { FormattedMessage } from "react-intl";
import LinkThumbnail from "./components/LinkThumbnail";

export type TimelineEvent = {
  icon: React.ReactNode;
  titleId: string;
  whenId: string;
  details: React.ReactNode;
};

export type Project = {
  id: string;
  hrefEN?: string;
  hrefFI?: string;
};

export const projects: Project[] = [
  {
    id: "projectHusDatalakeTitle",
    hrefEN:
      "https://www.tietoevry.com/en/newsroom/all-news-and-releases/articles/2021/an-agile-and-cost-effective-way-to-combine-patient-data-from-different-systems-it-already-exists-and-this-is-how-it-works/",
    hrefFI:
      "https://www.tietoevry.com/fi/asiakkaitamme/2019/HUS-kehittaa-kliinisen-datan-hyodyntamista-tietoallas-ratkaisulla/",
  },
  {
    id: "projectMedicalPocTitle",
  },
  { id: "projectIctDaysTitle" },
  {
    id: "projectAnyhauTitle",
    hrefEN: "https://app.anyhau.fi/en/partners",
    hrefFI: "https://app.anyhau.fi/partners",
  },
];

export const highlightedEvents: TimelineEvent[] = [
  {
    icon: <WorkIcon sx={{ fontSize: { xs: 28, md: 18 } }} />,
    titleId: "eventTietoCaretechTitle",
    whenId: "eventTietoCaretechWhen",
    details: (
      <>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <FormattedMessage id="eventTietoCaretechP1" />
          <FormattedMessage id="eventTietoCaretechP2" />
        </Typography>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
            fontWeight: 600,
          }}
        >
          <FormattedMessage id="eventTietoCaretechNotable" />
        </Typography>
        <List
          sx={{
            listStyle: "disc",
            pl: 4,
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
            "& .MuiListItem-root": { display: "list-item", p: 0 },
          }}
        >
          <ListItem>
            <ListItemText
              primary={<FormattedMessage id="eventTietoCaretechB1" />}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<FormattedMessage id="eventTietoCaretechB2" />}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<FormattedMessage id="eventTietoCaretechB3" />}
            />
          </ListItem>
        </List>
        <Grid container spacing={5} sx={{ pt: 8 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LinkThumbnail
              id="linkThumbnailTitleTietoCaretechHus"
              descriptionId="linkThumbnailDescriptionTietoCaretechHus"
              image="https://www.tietoevry.com/siteassets/images--videos/04-industries/healthcare-and-welfare/main/19--web-2560x1440-2.jpg?quality=80&width=1920&format=webp"
              urlEN="https://www.tietoevry.com/en/newsroom/all-news-and-releases/articles/2021/an-agile-and-cost-effective-way-to-combine-patient-data-from-different-systems-it-already-exists-and-this-is-how-it-works/"
              urlFI="https://www.tietoevry.com/fi/asiakkaitamme/2019/HUS-kehittaa-kliinisen-datan-hyodyntamista-tietoallas-ratkaisulla/"
              readingMinutes={7}
              isArticle={true}
              date="01.2021"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LinkThumbnail
              id="linkThumbnailTitleTietoCaretechPoc"
              descriptionId="linkThumbnailDescriptionTietoCaretechPoc"
              image="https://www.tietoevry.com/siteassets/images--videos/05-businesses/tietoevry-care/success-stories/hus-children-and-adolescents-hospital/lanu_11.jpg?quality=80&width=1920&format=webp"
              readingMinutes={4}
              isArticle={true}
              date="03.2024"
            />
          </Grid>
        </Grid>
      </>
    ),
  },
  {
    icon: <WorkIcon sx={{ fontSize: { xs: 28, md: 18 } }} />,
    titleId: "eventAnyhauTitle",
    whenId: "eventAnyhauWhen",
    details: (
      <>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <FormattedMessage id="eventAnyhauP1" />
        </Typography>
        <Grid container spacing={5} sx={{ pt: 8 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LinkThumbnail
              id="linkThumbnailTitleAnyhau"
              descriptionId="linkThumbnailDescriptionAnyhau"
              image="/gaborulenius/anyhau.webp"
              urlEN="https://app.anyhau.fi/en/partners"
              urlFI="https://app.anyhau.fi/partners"
            />
          </Grid>
        </Grid>
      </>
    ),
  },
  {
    icon: <SchoolIcon sx={{ fontSize: { xs: 28, md: 18 } }} />,
    titleId: "eventHiveTitle",
    whenId: "eventHiveWhen",
    details: (
      <>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <FormattedMessage id="eventHiveP1" />
        </Typography>
        <Grid container spacing={5} sx={{ pt: 8 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LinkThumbnail
              id="linkThumbnailTitleHive"
              descriptionId="linkThumbnailDescriptionHive"
              image="https://images.ctfassets.net/7oor54l3o0n4/656J6ndTUsw2c8AG4GuAoK/f4f14c0cb50fb260303cc9867bd2ad07/about-hive-logo.jpg?w=2560&h=1008&q=50"
              urlEN="https://www.hive.fi/en/"
              urlFI="https://www.hive.fi/en/"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 1,
                width: "100%",
                pt: "56.25%",
                "& iframe": { border: 0 },
              }}
            >
              <Box
                component="iframe"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                src="https://www.youtube.com/embed/Ma0Bp2rP48s"
                title="Hive Helsinki"
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </>
    ),
  },
  {
    icon: <SchoolIcon sx={{ fontSize: { xs: 28, md: 18 } }} />,
    titleId: "eventSataEduTitle",
    whenId: "eventSataEduWhen",
    details: (
      <>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <FormattedMessage id="eventSataEduP1" />
          <FormattedMessage id="eventSataEduP2" />
        </Typography>
      </>
    ),
  },
];

export const allEvents: TimelineEvent[] = [
  {
    icon: <WorkIcon sx={{ fontSize: { xs: 28, md: 18 } }} />,
    titleId: "eventTietoCaretechTitle",
    whenId: "eventTietoCaretechWhen",
    details: (
      <>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <FormattedMessage id="eventTietoCaretechP1" />
          <FormattedMessage id="eventTietoCaretechP2" />
        </Typography>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
            fontWeight: 600,
          }}
        >
          <FormattedMessage id="eventTietoCaretechNotable" />
        </Typography>
        <List
          sx={{
            listStyle: "disc",
            pl: 4,
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
            "& .MuiListItem-root": { display: "list-item", p: 0 },
          }}
        >
          <ListItem>
            <ListItemText
              primary={<FormattedMessage id="eventTietoCaretechB1" />}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<FormattedMessage id="eventTietoCaretechB2" />}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<FormattedMessage id="eventTietoCaretechB3" />}
            />
          </ListItem>
        </List>
        <Grid container spacing={5} sx={{ pt: 8 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LinkThumbnail
              id="linkThumbnailTitleTietoCaretechHus"
              descriptionId="linkThumbnailDescriptionTietoCaretechHus"
              image="https://www.tietoevry.com/siteassets/images--videos/04-industries/healthcare-and-welfare/main/19--web-2560x1440-2.jpg?quality=80&width=1920&format=webp"
              urlEN="https://www.tietoevry.com/en/newsroom/all-news-and-releases/articles/2021/an-agile-and-cost-effective-way-to-combine-patient-data-from-different-systems-it-already-exists-and-this-is-how-it-works/"
              urlFI="https://www.tietoevry.com/fi/asiakkaitamme/2019/HUS-kehittaa-kliinisen-datan-hyodyntamista-tietoallas-ratkaisulla/"
              readingMinutes={7}
              isArticle={true}
              date="01.2021"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LinkThumbnail
              id="linkThumbnailTitleTietoCaretechPoc"
              descriptionId="linkThumbnailDescriptionTietoCaretechPoc"
              image="https://www.tietoevry.com/siteassets/images--videos/05-businesses/tietoevry-care/success-stories/hus-children-and-adolescents-hospital/lanu_11.jpg?quality=80&width=1920&format=webp"
              readingMinutes={4}
              isArticle={true}
              date="03.2024"
            />
          </Grid>
        </Grid>
      </>
    ),
  },
  {
    icon: <WorkIcon sx={{ fontSize: { xs: 28, md: 18 } }} />,
    titleId: "eventAnyhauTitle",
    whenId: "eventAnyhauWhen",
    details: (
      <>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <FormattedMessage id="eventAnyhauP1" />
        </Typography>
        <Grid container spacing={5} sx={{ pt: 8 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LinkThumbnail
              id="linkThumbnailTitleAnyhau"
              descriptionId="linkThumbnailDescriptionAnyhau"
              image="/gaborulenius/anyhau.webp"
              urlEN="https://app.anyhau.fi/en/partners"
              urlFI="https://app.anyhau.fi/partners"
            />
          </Grid>
        </Grid>
      </>
    ),
  },
  {
    icon: <SchoolIcon sx={{ fontSize: { xs: 28, md: 18 } }} />,
    titleId: "eventHiveTitle",
    whenId: "eventHiveWhen",
    details: (
      <>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <FormattedMessage id="eventHiveP1" />
        </Typography>
        <Grid container spacing={5} sx={{ pt: 8 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LinkThumbnail
              id="linkThumbnailTitleHive"
              descriptionId="linkThumbnailDescriptionHive"
              image="https://images.ctfassets.net/7oor54l3o0n4/656J6ndTUsw2c8AG4GuAoK/f4f14c0cb50fb260303cc9867bd2ad07/about-hive-logo.jpg?w=2560&h=1008&q=50"
              urlEN="https://www.hive.fi/en/"
              urlFI="https://www.hive.fi/en/"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 1,
                width: "100%",
                pt: "56.25%",
                "& iframe": { border: 0 },
              }}
            >
              <Box
                component="iframe"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                src="https://www.youtube.com/embed/Ma0Bp2rP48s"
                title="Hive Helsinki"
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </>
    ),
  },
  {
    icon: <WorkIcon sx={{ fontSize: { xs: 28, md: 18 } }} />,
    titleId: "eventTekijaRentTitle",
    whenId: "eventTekijaRentWhen",
    details: (
      <>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <FormattedMessage id="eventTekijaRentP1" />
        </Typography>
      </>
    ),
  },
  {
    icon: <WorkIcon sx={{ fontSize: { xs: 28, md: 18 } }} />,
    titleId: "eventKotipalveluTitle",
    whenId: "eventKotipalveluWhen",
    details: (
      <>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <FormattedMessage id="eventKotipalveluP1" />
          <FormattedMessage id="eventKotipalveluP2" />
          <FormattedMessage id="eventKotipalveluP3" />
          <FormattedMessage id="eventKotipalveluP4" />
        </Typography>
      </>
    ),
  },
  {
    icon: <WorkIcon sx={{ fontSize: { xs: 28, md: 18 } }} />,
    titleId: "eventLumundooTitle",
    whenId: "eventLumundooWhen",
    details: (
      <>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <FormattedMessage id="eventLumundooP1" />
        </Typography>
      </>
    ),
  },
  {
    icon: <WorkIcon sx={{ fontSize: { xs: 28, md: 18 } }} />,
    titleId: "eventAaltovoimaTitle",
    whenId: "eventAaltovoimaWhen",
    details: (
      <>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <FormattedMessage id="eventAaltovoimaP1" />
        </Typography>
      </>
    ),
  },
  {
    icon: <WorkIcon sx={{ fontSize: { xs: 28, md: 18 } }} />,
    titleId: "eventEnersenseTitle",
    whenId: "eventEnersenseWhen",
    details: (
      <>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <FormattedMessage id="eventEnersenseP1" />
        </Typography>
      </>
    ),
  },
  {
    icon: <WorkIcon sx={{ fontSize: { xs: 28, md: 18 } }} />,
    titleId: "eventDeltamarinTitle",
    whenId: "eventDeltamarinWhen",
    details: (
      <>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <FormattedMessage id="eventDeltamarinP1" />
        </Typography>
      </>
    ),
  },
  {
    icon: <SchoolIcon sx={{ fontSize: { xs: 28, md: 18 } }} />,
    titleId: "eventSataEduTitle",
    whenId: "eventSataEduWhen",
    details: (
      <>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <FormattedMessage id="eventSataEduP1" />
          <FormattedMessage id="eventSataEduP2" />
        </Typography>
      </>
    ),
  },
  {
    icon: <SchoolIcon sx={{ fontSize: { xs: 28, md: 18 } }} />,
    titleId: "eventBkszcTitle",
    whenId: "eventBkszcWhen",
    details: (
      <>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <FormattedMessage id="eventBkszcP1" />
          <FormattedMessage id="eventBkszcP2" />
          <FormattedMessage id="eventBkszcP3" />
          <FormattedMessage id="eventBkszcP4" />
        </Typography>
      </>
    ),
  },
];

export const categories = [
  {
    id: "skillsCatFrontend",
    items: [
      "React",
      "Next.js",
      "TypeScript",
      "GraphQL",
      "HTML5",
      "CSS3",
      "JavaScript",
    ],
  },
  {
    id: "skillsCatBackend",
    items: [
      "Node.js/Express",
      "PHP",
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "MariaDB",
      "Redis",
      "GraphQL",
    ],
  },
  {
    id: "skillsCatTools",
    items: [
      "Azure DevOps",
      "Azure Cloud",
      "Terraform",
      "Databricks",
      "GitHub",
      "GitLab",
      "Git",
      "CI/CD pipelines",
      "Docker",
      "Kubernetes",
      "Figma",
      "Playwright",
      "Cypress",
      "Jest",
      "Asana",
      "Atlassian",
      "Jira",
      "Confluence",
      "Contentful",
      "Miro",
      "MAMP",
      "XAMPP",
      "LAMP",
      "MyphpAdmin",
      "pgAdmin",
      "DataGrip",
      "Postico 2",
      "DBeaver",
      "Mongoose",
      "Postman",
      "Lucidchart",
      "Bulma",
      "MUI",
      "Tailwind",
      "Redux",
      "Recoil",
      "Jotai",
      "VS Code",
      "IntelliJ IDEA",
      "Cursor",
      "Vim",
      "CLI",
      "Termux",
    ],
  },
];
