export default {
  navHome: "Home",
  navAbout: "About",
  navProjects: "Projects",
  navExperience: "Experience",
  navSkills: "Skills & Tools",
  navContact: "Contact",
  tabsEffects: "Effects",
  tabsAppearance: "Appearance",
  tabsLanguage: "Language",
  settingsTitle: "Customize Your Jungle Walk",
  effectsSubtitle:
    "Bring the jungle to life around you—choose which ambient elements you’d like to accompany your journey.",
  labelBirdCalls: "Bird Calls",
  labelDriftingLeaves: "Drifting Leaves",
  appearanceSubtitle:
    "Adjust the overall mood—daylight greens or the mystery of twilight.",
  labelNightfallMode: "Nightfall Mode",
  labelDaylightMode: "Daylight Mode",
  languageSubtitle:
    "Select your language to guide you through the undergrowth.",
  buttonClose: "Close",
  headingSettings: "Settings",
  labelBird: "Bird",
  labelLeaves: "Leaves",
  labelFireflies: "Fireflies",
  /* ---------- Home titles ---------- */
  homeGreeting: "…a Full-Stack Developer based in Espoo.",
  homeSubtitle:
    "Currently at Tieto Caretech, building cloud-native, AI-powered healthcare solutions.",
  homeBtnExplore: "Explore My Work",
  homeBtnDownloadCv: "Download My CV",
  /* ---------- About titles ---------- */
  aboutHeading: "About Me",
  aboutBody:
    "Contributed to Finland’s largest healthcare data platform (HUS DataLake), improving data accessibility. Proficient in <b>React</b>, <b>TypeScript</b>, <b>GraphQL</b>, <b>Node.js</b>, <b>Docker</b>, <b>Kubernetes</b>, <b>Terraform</b>, and <b>Azure Cloud</b>. Worked on LLM-based AI prototypes, including a demo at ICT Days and a diagnostic tool piloted at the New Children’s Hospital for faster symptom-based searches.",
  aboutLocation: "Finland, Espoo",
  aboutEducation: "Hive Helsinki Alumni",
  aboutExperience: "3+ years professional work experience",
  /* ---------- Project titles ---------- */
  projectHusDatalakeTitle:
    "Contributing to the HUS DataLake platform for real-time healthcare data access",
  projectMedicalPocTitle:
    "I played a key role in the implementation of an AI PoC at Helsinki's New Children's Hospital. This PoC speeds up doctors' diagnoses by analyzing medical documents.",
  projectIctDaysTitle:
    "As part of the team, I contributed significantly to the development of an LLM-based AI solution for the ATK-päivät event, which is Finland's largest healthcare IT event.",
  projectAnyhauTitle:
    "Worked with the 2022 “Diili” winner to launch a green-field platform for online animal-service bookings",
  /* ---------- Helpers ---------- */
  projectHeading: "Projects",
  projectTabWork: "Work",
  projectTabHobby: "Hobby",
  projectHobbyScrollDownLabel: "Scroll hobby project content",
  projectExplorerTitle: "The Explorer",
  projectExplorerSummary:
    "A mobile fieldwork app for remote conservation expeditions, built to capture reliable offline GPS trails, ecological zones, media, and structured environmental observations for later sync and review.",
  projectExplorerButtonDetails: "View details",
  projectExplorerGalleryLabel: "Explorer mobile app screenshots",
  projectExplorerGalleryPrevious: "Previous screenshot",
  projectExplorerGalleryNext: "Next screenshot",
  projectExplorerGalleryGoTo: "Show {title}",
  projectExplorerCapabilityTopoTitle: "Offline topographic maps",
  projectExplorerCapabilityTopoBody:
    "MapLibre + Protomaps/PMTiles power offline topographic maps, with Cloudflare R2/Workers serving tiles and country downloads for remote field use.",
  projectExplorerCapabilityPrecisionTitle: "Field precision",
  projectExplorerCapabilityPrecisionBody:
    "High-accuracy foreground/background GPS records expedition trails, while WGS84 geodesic ruler and distance calculations avoid rough map approximations.",
  projectExplorerCapabilityCaptureTitle: "Structured field capture",
  projectExplorerCapabilityCaptureBody:
    "Conservation-focused logs cover wildlife, vegetation, water samples, threats, waypoints, photos, insects, voice notes, weather, and ecological zones.",
  projectExplorerCapabilityCloudTitle: "Cloud platform",
  projectExplorerCapabilityCloudBody:
    "Local data remains usable offline, then Supabase, Auth0, and EAS-backed builds support sync, secure access, and later review workflows.",
  projectExplorerWhyHeading: "Built for remote conservation fieldwork",
  projectExplorerDialogIntro:
    "The Explorer is my first mobile app: a React Native and Expo field tool for environmental expeditions where connectivity can disappear. It keeps local data reliable first, records GPS trails across foreground and background sessions, captures structured conservation observations with media and ecological zones, and syncs through Supabase/Auth0 when the team has connectivity again.",
  projectExplorerDetailMobileHeading: "Remote field capture",
  projectExplorerDetailMobileItemOffline:
    "Local-first expedition data keeps active and archived expeditions, logs, zones, trail points, and media usable in remote areas without network access.",
  projectExplorerDetailMobileItemPrecision:
    "Background tracking records high-accuracy GPS trails, marks gaps and stops instead of drawing false connectors, and uses WGS84 geodesic measurement for ruler and trail distances.",
  projectExplorerDetailMobileItemCapture:
    "Structured logging supports wildlife, vegetation, water and hydrology, threats, waypoints, campsites, photos, insects, tags, notes, weather snapshots, and custom log boards.",
  projectExplorerDetailInfraHeading: "Infrastructure",
  projectExplorerDetailInfraItemCloudflare:
    "MapLibre basemaps use Protomaps/PMTiles delivered by Cloudflare R2/Workers with topographic hillshade, contour layers, and offline download controls.",
  projectExplorerDetailInfraItemSupabase:
    "Supabase stores expedition records, media, RLS policies, Edge Functions, sync state, PMTiles tokens, and weather snapshots.",
  projectExplorerDetailInfraItemRelease:
    "Auth0 secures sign-in and cloud access, while EAS handles Android release builds and production environment variables.",
  projectExplorerDetailWebHeading: "Review and reporting",
  projectExplorerDetailWebItemWorkspace:
    "The read-only web direction preserves field provenance while helping teams review synced expeditions, logs, trails, zones, photos, and structured metadata.",
  projectExplorerDetailWebItemReporting:
    "The reporting direction includes map review, dashboards, GeoJSON/GPX/KML/CSV/ZIP exports, print-ready reports, Auth0, Supabase, MapLibre, and PMTiles.",
  projectExplorerStackHeading: "Stack",
  projectExplorerScreenshotHomeTitle: "Active expedition home",
  projectExplorerScreenshotHomeAlt:
    "Explorer home screen with active expedition card, sync prompt, and field summary",
  projectExplorerScreenshotMapTrackingTitle: "Live topo map tracking",
  projectExplorerScreenshotMapTracking:
    "Explorer map view with GPS tracking, route, zone overlay, and log markers",
  projectExplorerScreenshotMeasureTitle: "Geodesic ruler",
  projectExplorerScreenshotMeasureAlt:
    "Explorer measure distance screen with dashed ruler segments over a topographic map",
  projectExplorerScreenshotLogTypeTitle: "Scientific log picker",
  projectExplorerScreenshotLogTypeAlt:
    "Explorer new log screen with selectable scientific log categories",
  projectExplorerScreenshotCustomizeTitle: "Custom log board",
  projectExplorerScreenshotCustomizeAlt:
    "Explorer customize layout screen for reordering and hiding log types",
  projectExplorerScreenshotLogDetailsTitle: "Log detail with weather",
  projectExplorerScreenshotLogDetailsAlt:
    "Explorer log detail screen with wildlife attributes, coordinates, tags, and weather data",
  projectExplorerScreenshotLogsOverviewTitle: "Chronological logs",
  projectExplorerScreenshotLogsOverview:
    "Explorer chronological logs screen with field records",
  projectExplorerScreenshotExpeditionsTitle: "Expedition library",
  projectExplorerScreenshotExpeditionsAlt:
    "Explorer expeditions list with active and ended expedition cards",
  projectExplorerScreenshotProfileTitle: "Research profile",
  projectExplorerScreenshotProfileAlt:
    "Explorer profile screen with researcher stats and fieldwork summary",
  projectExplorerScreenshotMapStoppedTitle: "Offline map prompt",
  projectExplorerScreenshotMapStopped:
    "Explorer map view with GPS stopped and offline map prompt",
  projectExplorerScreenshotLogsSelectionTitle: "Export selection",
  projectExplorerScreenshotLogsSelection:
    "Explorer logs export selection screen",
  projectExplorerScreenshotLogsRecordsTitle: "Expedition log cards",
  projectExplorerScreenshotLogsRecords:
    "Explorer expedition logs with photo and observation records",
  buttonReadMore: "Read More",
  noLinkAvailable: "(no link available)",
  qualificationTabHighlights: "Highlights",
  qualificationTabTimeline: "Timeline",
  qualificationHeadingHighlights: "Professional Highlights",
  qualificationHeadingTimeline: "Full Timeline",

  /* Event titles + dates */
  eventTietoCaretechTitle: "Full-Stack Developer – Tieto Caretech",
  eventTietoCaretechWhen: "Espoo, 2023 – Present",

  eventAnyhauTitle: "Full-Stack Developer – Anyhau Oy",
  eventAnyhauWhen: "Espoo, 2022 – 2023",

  eventHiveTitle: "Software Developer – Hive Helsinki",
  eventHiveWhen: "Helsinki, 2021 – 2023",

  eventSataEduTitle: "Finnish Language School – SataEdu",
  eventSataEduWhen: "Rauma, 2016 – 2017",

  eventTekijaRentTitle: "Scaffolder – Tekijä Rent Oy",
  eventTekijaRentWhen: "Espoo, 2020 – 2021",

  eventKotipalveluTitle: "Housekeeper – Kotipalvelu Ykköset Oy",
  eventKotipalveluWhen: "Espoo, 2019 – 2020",

  eventLumundooTitle: "Founder of Lumundoo – Self-employed",
  eventLumundooWhen: "Espoo, 2018 – 2019",

  eventAaltovoimaTitle: "Mover/Housekeeper – Aaltovoima Oy",
  eventAaltovoimaWhen: "Espoo, 2018 – 2019",

  eventEnersenseTitle:
    "Final Maintainer – Enersense International Oyj / VMP Oy",
  eventEnersenseWhen: "Rauma, 2017 – 2018",

  eventDeltamarinTitle: "Ship Designer – Deltamarin Oy",
  eventDeltamarinWhen: "Rauma, 2017 – 2017",

  eventBkszcTitle: "Construction Technician – BKSZC Schulek Frigyes",
  eventBkszcWhen: "Budapest, 2011 – 2016",

  /* Event details */
  eventTietoCaretechP1:
    "I work as a Full-Stack Developer in the healthcare domain, building cloud-native, AI-powered solutions that improve the accessibility and usability of patient data across the Nordic region.",
  eventTietoCaretechP2:
    "My daily stack includes React, TypeScript, Node.js, GraphQL, PostgreSQL, Docker, Kubernetes, Terraform and Azure DevOps in Agile-Scrum teams.",
  eventTietoCaretechNotable: "Notable contributions:",
  eventTietoCaretechB1:
    "Developed an LLM-powered AI solution showcased at ICT Days, Finland’s largest healthcare-tech event.",
  eventTietoCaretechB2:
    "Contributed to the HUS DataLake, enabling real-time access to healthcare data across multiple systems.",
  eventTietoCaretechB3:
    "Built an AI proof of concept that helps doctors find diagnoses faster through medical documents.",
  eventAnyhauP1:
    "Built a green-field web application for booking animal-related services, in collaboration with the 2022 *Diili* winner, using Next.js, Material UI and MongoDB. The platform lets providers list services and customers book and pay online.",
  eventHiveP1:
    "Completed a project-based program focused on teamwork, problem-solving and self-directed learning, strengthening collaboration, critical thinking and adaptability in real-world software projects.",
  eventSataEduP1:
    "Finished the TE Office’s SataEdu integration course (A2 level) with daily lessons in practical Finnish, workplace vocabulary and social skills.",
  eventSataEduP2:
    "Earned an A2 certificate and continued self-study to reach conversational fluency.",
  /* ─── Tekijä Rent ─────────────────────── */
  eventTekijaRentP1:
    "I led a team of scaffolders—delegating tasks, providing hands-on guidance, and coordinating workflows to meet tight metro-construction milestones. I also organised scaffold storage and managed full build-up and dismantling across the Soukka-station project, ensuring efficient and safe operations.",

  /* ─── Kotipalvelu Ykköset ─────────────── */
  eventKotipalveluP1:
    "I served as a full-time housekeeper at Kotipalvelu Ykköset (Aug 2019 – Jun 2020), delivering thorough cleaning, organising living spaces and maintaining impeccable hygiene standards for residential clients.",
  eventKotipalveluP2:
    "I proactively communicated with clients to understand their specific needs and consistently exceeded expectations, driving high satisfaction and repeat bookings.",
  eventKotipalveluP3:
    "I managed scheduling and cleaning-supply inventory, streamlining workflows to ensure timely, uninterrupted service delivery.",
  eventKotipalveluP4:
    "Strong attention to detail, efficient time management and a reliable work ethic underpinned a seamless customer experience throughout my tenure.",

  /* ─── Lumundoo ────────────────────────── */
  eventLumundooP1:
    "From Dec 2018 to Dec 2019 I founded and operated a dropshipping business in Espoo, handling everything from customer care to inventory and website management. I negotiated influencer partnerships, coordinated mailings and marketing materials, and gained foundational coding experience by building and maintaining my e-commerce site.",

  /* ─── Aaltovoima ──────────────────────── */
  eventAaltovoimaP1:
    "As a part-time mover and housekeeper at Aaltovoima Oy (Jun 2018 – Aug 2019) I delivered seamless relocation and cleaning services across Espoo and Helsinki—coordinating packing, loading, transport and unloading with care and efficiency, then performing detailed cleaning before and after each move to exceed client expectations.",

  /* ─── Enersense / VMP ─────────────────── */
  eventEnersenseP1:
    "Performed meticulous final cleaning of rooms, equipment and support systems at the Olkiluoto 3 nuclear power plant, meeting strict decontamination standards. Rigorously followed STUK radiation-safety rules, used required PPE, maintained cleaning logs and cooperated with maintenance crews to keep the outage schedule on track.",

  /* ─── Deltamarin ──────────────────────── */
  eventDeltamarinP1:
    "Completed a four-month internship at Deltamarin, shadowing senior naval architects and absorbing ship-design workflows. Reviewed drawings, attended design reviews and drafted simple components in AutoCAD—building a solid foundation in ship-design principles and CAD practices.",

  /* ─── BKSZC Schulek ──────────────────── */
  eventBkszcP1:
    "Finished a five-year bilingual Building-Construction Technology programme at BKSZC Schulek Frigyes (2011-2016), mastering technical-drawing fundamentals and architectural plan development.",
  eventBkszcP2:
    "Developed practical construction skills in masonry, wall building and formwork workshops, turning drawings into on-site structures.",
  eventBkszcP3:
    "Produced numerous house-drawing projects with proper scale and dimensioning, and used ArchiCAD for structural models, quantity take-offs and load calculations.",
  eventBkszcP4:
    "Graduated in June 2016 with a final grade of 69 %, demonstrating strong academic performance and hands-on expertise.",

  /* Skills & Tools */
  skillsToolsHeading: "Skills & Tools",
  skillsCatFrontend: "Frontend",
  skillsCatMobileCloud: "Mobile, Maps & Cloud",
  skillsCatBackend: "Backend",
  skillsCatTools: "Tools",

  /* Contact section */
  contactHeading: "Let’s Connect",
  contactIntro:
    "Navigating the digital jungle for your next project or a new team member? Whether it's a groundbreaking idea, a collaborative adventure, or an exciting opportunity, I'm ready to explore. Let's connect and create something wild!",
  contactBtnEmail: "Email Me",
  contactBtnLinkedIn: "LinkedIn",

  /* Cover */
  coverGreeting: "Hi, I'm {name}",
  coverScroll: "Scroll Down",

  /* Footer */
  footerJobTitle: "Full-Stack developer",
  footerNavAbout: "About",
  footerNavProjects: "Projects",
  footerNavContact: "Contact me",
  footerCopyright: "© {year} Gabor Ulenius. All rights reserved",
  headingEffects: "Effects",

  /*Links */
  linkThumbnailTitleTietoCaretechHus:
    "An agile and cost-effective way to combine patient data from different systems? It already exists and this is how it works",
  linkThumbnailDescriptionTietoCaretechHus:
    "Finnish healthcare and the healthcare information systems suffer from the same basic problem: fragmentation.",
  linkThumbnailTitleTietoCaretechPoc:
    "Generative AI pilot assists clinicians at New Children’s Hospital",
  linkThumbnailDescriptionTietoCaretechPoc:
    "An LLM-based pilot helps clinicians at Helsinki’s New Children’s Hospital find the right information faster in medical documents.",
  linkThumbnailTitleAnyhau: "Anyhau",
  linkThumbnailDescriptionAnyhau: "Find the best services for your pet",
  linkThumbnailTitleHive: "Hive Helsinki",
  linkThumbnailDescriptionHive:
    "Hive Helsinki is a new kind of coding school that preps you to launch your future-proof career through collaborative, project-based learning.",
  linkThumbnailTitleGabor: "A non-traditional journey into coding and AI",
  linkThumbnailDescriptionGabor:
    "Gàbor shares how he moved into software development and now builds AI solutions at Tieto Caretech.",
  linkThumbnailReadingTime: "{minutes} min read",
} as const;
