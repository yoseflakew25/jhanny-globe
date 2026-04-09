import vlogsData from "../vlogs_template.json";

export const JAHNNY_VISITED_COUNTRIES = [
    "United States of America",
    "Ethiopia",
    "Kenya",
    "South Africa",
    "South Korea",
    "Thailand",
    "Vietnam",
    "Malaysia",
    "Indonesia",
    "Egypt",
    "Singapore",
    "Brazil",
    "Colombia",
    "El Salvador",
    "Romania",
    "Turkey",
    "Portugal",
    "United Kingdom",
    "Switzerland",
    "Spain",
    "China",
    "United Arab Emirates",
    "Qatar"
];

export type Vlog = {
    title: string;
    youtubeLink: string;
};

// Map and filter the JSON data to exclude empty entries
export const JAHNNY_VLOGS: Record<string, Vlog[]> = Object.entries(vlogsData).reduce((acc, [country, vlogs]) => {
    const validVlogs = (vlogs as any[]).filter(vlog => vlog.title && vlog.youtubeLink);
    if (validVlogs.length > 0) {
        acc[country] = validVlogs as Vlog[];
    }
    return acc;
}, {} as Record<string, Vlog[]>);

// Helper to normalize names for matching
export const normalizeCountryName = (name: string): string => {
    const mapping: Record<string, string> = {
        "USA": "United States of America",
        "United States": "United States of America",
        "UK": "United Kingdom",
        "UAE": "United Arab Emirates",
        "Swittzerland": "Switzerland", // Handle typo in user input
    };
    return mapping[name] || name;
};

