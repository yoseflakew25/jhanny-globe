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
    "India",
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
    "United Arab Emirates"
];

export type Vlog = {
    title: string;
    youtubeId: string;
};

export const JAHNNY_VLOGS: Record<string, Vlog[]> = {
    "United States of America": [
        { title: "MY FIRST TIME IN NYC! 🍎", youtubeId: "placeholder1" },
        { title: "DRIVING ACROSS CALIFORNIA ☀️", youtubeId: "placeholder2" }
    ],
    "Ethiopia": [
        { title: "THE BEST FOOD IN ADDIS ABABA 🥘", youtubeId: "placeholder3" }
    ],
    "Kenya": [
        { title: "SAFARI ADVENTURE! 🦁", youtubeId: "placeholder4" }
    ],
    "South Africa": [
        { title: "CAPE TOWN IS BEAUTIFUL 🇿🇦", youtubeId: "placeholder5" }
    ],
    "South Korea": [
        { title: "SEOUL NIGHTLIFE & STREET FOOD 🇰🇷", youtubeId: "placeholder6" }
    ],
    "Thailand": [
        { title: "BANGKOK 24 HOUR CHALLENGE 🇹🇭", youtubeId: "placeholder7" }
    ],
    "Vietnam": [
        { title: "MOTORBIKE TRIP THROUGH VIETNAM 🇻🇳", youtubeId: "placeholder8" }
    ],
    "Malaysia": [
        { title: "KUALA LUMPUR SKYLINE 🇲🇾", youtubeId: "placeholder9" }
    ],
    "Indonesia": [
        { title: "BALI VIBES 🌴", youtubeId: "placeholder10" }
    ],
    "Egypt": [
        { title: "INSIDE THE GREAT PYRAMIDS 🇪🇬", youtubeId: "placeholder11" }
    ],
    "India": [
        { title: "THE COLORS OF MUMBAI 🇮🇳", youtubeId: "placeholder12" }
    ],
    "Singapore": [
        { title: "MARINA BAY SANDS IS INSANE 🇸🇬", youtubeId: "placeholder13" }
    ],
    "Brazil": [
        { title: "RIO DE JANEIRO CARNIVAL 🇧🇷", youtubeId: "placeholder14" }
    ],
    "Colombia": [
        { title: "MEDELLIN TRANSFORMATION 🇨🇴", youtubeId: "placeholder15" }
    ],
    "El Salvador": [
        { title: "SURFING IN EL TUNCO 🇸🇻", youtubeId: "placeholder16" }
    ],
    "Romania": [
        { title: "BUCHAREST HIDDEN GEMS 🇷🇴", youtubeId: "placeholder17" }
    ],
    "Turkey": [
        { title: "ISTANBUL BAZAAR ADVENTURE 🇹🇷", youtubeId: "placeholder18" }
    ],
    "Portugal": [
        { title: "LISBON STREET ART 🇵🇹", youtubeId: "placeholder19" }
    ],
    "United Kingdom": [
        { title: "LONDON IN THE RAIN 🇬🇧", youtubeId: "placeholder20" }
    ],
    "Switzerland": [
        { title: "TRAIN RIDE THROUGH THE ALPS 🇨🇭", youtubeId: "placeholder21" }
    ],
    "Spain": [
        { title: "BARCELONA ARCHITECTURE 🇪🇸", youtubeId: "placeholder22" }
    ],
    "China": [
        { title: "GREAT WALL HIKE 🇨🇳", youtubeId: "placeholder23" }
    ],
    "United Arab Emirates": [
        { title: "DUBAI LUXURY VLOG 🇦🇪", youtubeId: "placeholder24" }
    ]
};

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
