// All criterion scores are DEMONSTRATION model inputs derived from published
// analogue literature, not processed NASA measurements. They are labelled as such in the UI.

export type CriterionKey =
  | "terrain" | "geology" | "environment" | "solar" | "water"
  | "mineral" | "access" | "research" | "resilience";

export const CRITERIA: { key: CriterionKey; label: string; unit: string; reference: string; method: string; source: string }[] = [
  { key: "terrain", label: "Terrain similarity", unit: "m slope/roughness index", reference: "LOLA / MOLA slope distributions", method: "Min–max scaled distance to reference slope histogram", source: "SRTM (Earth) vs LRO LOLA / MGS MOLA — processing required" },
  { key: "geology", label: "Geological similarity", unit: "qualitative class", reference: "Basaltic regolith (Moon) / altered basalt, sulfates (Mars)", method: "Expert class mapping → 0–100", source: "Peer-reviewed analogue literature" },
  { key: "environment", label: "Environmental similarity", unit: "aridity / extremity index", reference: "Mars hyper-arid, Moon vacuum", method: "Aridity index rank scaling", source: "NASA POWER precipitation (live) + literature" },
  { key: "solar", label: "Solar illumination", unit: "kWh/m²/day", reference: "Lunar polar ridges ~80–90% illumination", method: "Linear scale 2–7.5 kWh/m²/day", source: "NASA POWER ALLSKY_SFC_SW_DWN" },
  { key: "water", label: "Water & resource availability", unit: "qualitative", reference: "Polar ice (Moon), subsurface ice (Mars)", method: "Expert class mapping", source: "Literature / demonstration" },
  { key: "mineral", label: "Mineral characteristics", unit: "spectral class", reference: "CRISM phyllosilicates / sulfates", method: "Mineral match count scaled", source: "Literature vs MRO CRISM — processing required" },
  { key: "access", label: "Accessibility", unit: "km to logistics hub", reference: "n/a (operational)", method: "Inverse distance scaling", source: "Demonstration" },
  { key: "research", label: "Research potential", unit: "publication / campaign count", reference: "n/a", method: "Log-scaled campaign history", source: "Literature / demonstration" },
  { key: "resilience", label: "Operational resilience", unit: "qualitative", reference: "n/a", method: "Expert class mapping", source: "Demonstration" },
];

export type MissionId = "lunar" | "mars" | "emergency";
export type Weights = Partial<Record<CriterionKey, number>>;

export const MISSIONS: Record<MissionId, { name: string; short: string; objective: string; color: string; weights: Weights }> = {
  lunar: {
    name: "Lunar Research Outpost", short: "Lunar",
    objective: "Find Earth environments that offer useful analogues for a permanent Moon research outpost.",
    color: "lunar",
    weights: { terrain: 20, geology: 20, solar: 15, water: 15, environment: 15, access: 5, research: 10 },
  },
  mars: {
    name: "Martian Science Station", short: "Mars",
    objective: "Identify Earth locations that provide meaningful analogues for Martian geological and environmental research.",
    color: "mars",
    weights: { geology: 25, environment: 20, solar: 15, mineral: 15, research: 15, water: 5, access: 5 },
  },
  emergency: {
    name: "Emergency Survival Outpost", short: "Emergency",
    objective: "Identify locations with the strongest operational resilience for a remote emergency outpost.",
    color: "multi",
    weights: { access: 20, water: 20, mineral: 15, environment: 15, terrain: 10, resilience: 15, research: 5 },
  },
};
// Note: "Temperature characteristics" (Mars) is folded into solar/thermal; "Infrastructure" (Emergency) maps to terrain/operability.

export type Category = "lunar" | "mars" | "multi" | "pending";

export interface Location {
  id: string; name: string; country: string; lat: number; lon: number;
  elevation: number; terrain: string; geology: string; environment: string;
  resources: string; relevance: string; category: Category;
  scores: Partial<Record<CriterionKey, number | null>>;
  advantages: string[]; limitations: string[];
}

const L = (l: Location) => l;

export const LOCATIONS: Location[] = [
  L({ id: "atacama", name: "Atacama Desert (Yungay)", country: "Chile", lat: -24.08, lon: -70.0, elevation: 1000, terrain: "Hyper-arid plateau, salt flats", geology: "Nitrate & sulfate-rich soils, oxidised regolith", environment: "Driest non-polar desert, intense UV", resources: "Mining infrastructure, limited groundwater", relevance: "Mars soil oxidant and life-detection studies (NASA ARADS)", category: "mars",
    scores: { terrain: 70, geology: 86, environment: 95, solar: 96, water: 30, mineral: 88, access: 72, research: 92, resilience: 58 },
    advantages: ["Extreme aridity close to Martian regolith", "Exceptional solar resource", "Long NASA field-campaign history"], limitations: ["Atmosphere and gravity differ entirely", "Some microbial life present"] }),
  L({ id: "devon", name: "Haughton Crater, Devon Island", country: "Canada", lat: 75.38, lon: -89.68, elevation: 200, terrain: "23 km impact crater, polar desert", geology: "Impact breccia, carbonate target rock", environment: "Polar desert, permafrost", resources: "Ground ice, seasonal meltwater", relevance: "Haughton-Mars Project rover and EVA tests", category: "multi",
    scores: { terrain: 82, geology: 80, environment: 78, solar: 40, water: 70, mineral: 62, access: 25, research: 90, resilience: 55 },
    advantages: ["Impact morphology analogous to both bodies", "Ground ice like Martian mid-latitudes"], limitations: ["Very remote, short field season", "Low annual solar input"] }),
  L({ id: "riotinto", name: "Río Tinto", country: "Spain", lat: 37.72, lon: -6.56, elevation: 300, terrain: "Acidic river valley", geology: "Iron sulfides, jarosite, hematite", environment: "Acidic (pH ~2) aqueous system", resources: "Water, road access", relevance: "Jarosite analogue to Meridiani Planum (Opportunity)", category: "mars",
    scores: { terrain: 45, geology: 84, environment: 50, solar: 78, water: 85, mineral: 95, access: 92, research: 80, resilience: 80 },
    advantages: ["Mineralogy matches MER Opportunity findings", "Highly accessible"], limitations: ["Wet, vegetated surroundings", "Terrain not Mars-like"] }),
  L({ id: "maunakea", name: "Mauna Kea flanks", country: "USA", lat: 19.76, lon: -155.45, elevation: 3000, terrain: "Basaltic volcanic slopes, tephra", geology: "Basaltic tephra, palagonite", environment: "High-altitude, low humidity", resources: "Observatory infrastructure", relevance: "NASA ISRU and lunar regolith simulant (JSC-1 origin region)", category: "lunar",
    scores: { terrain: 76, geology: 90, environment: 60, solar: 80, water: 45, mineral: 75, access: 80, research: 85, resilience: 70 },
    advantages: ["Basaltic regolith similar to lunar mare", "PISCES ISRU test heritage"], limitations: ["Culturally sensitive site", "Weather variability"] }),
  L({ id: "dryvalleys", name: "McMurdo Dry Valleys", country: "Antarctica", lat: -77.5, lon: 162.0, elevation: 500, terrain: "Ice-free valleys, patterned ground", geology: "Granite, dolerite, salt-rich soils", environment: "Coldest, driest desert; katabatic winds", resources: "Glacial ice", relevance: "Mars periglacial and astrobiology analogue", category: "multi",
    scores: { terrain: 80, geology: 72, environment: 96, solar: 35, water: 65, mineral: 70, access: 10, research: 94, resilience: 40 },
    advantages: ["Closest climate analogue to Mars", "Polar light cycle like lunar poles"], limitations: ["Extremely restricted access", "Environmental protection rules"] }),
  L({ id: "mdrs", name: "Mars Desert Research Station", country: "USA", lat: 38.41, lon: -110.79, elevation: 1350, terrain: "Badlands, mesas", geology: "Jurassic/Cretaceous clays, gypsum", environment: "Semi-arid desert", resources: "Road access, nearby town", relevance: "Crewed Mars simulation since 2001", category: "mars",
    scores: { terrain: 78, geology: 74, environment: 70, solar: 82, water: 35, mineral: 72, access: 88, research: 82, resilience: 75 },
    advantages: ["Operating habitat infrastructure", "Mars-like colouration and clays"], limitations: ["Summer closure due to heat", "Vegetation patches"] }),
  L({ id: "lonar", name: "Lonar Crater", country: "India", lat: 19.98, lon: 76.51, elevation: 480, terrain: "1.8 km impact crater with lake", geology: "Impact into Deccan basalt", environment: "Semi-arid, saline-alkaline lake", resources: "Lake water, road access", relevance: "Rare basalt-hosted impact crater — lunar/Martian basalt analogue", category: "multi",
    scores: { terrain: 74, geology: 88, environment: 48, solar: 85, water: 72, mineral: 70, access: 90, research: 68, resilience: 82 },
    advantages: ["Basalt impact crater like lunar maria", "Easy access"], limitations: ["Vegetated crater floor", "Small crater scale"] }),
  L({ id: "ladakh", name: "Tso Kar, Ladakh", country: "India", lat: 33.3, lon: 78.0, elevation: 4530, terrain: "High-altitude cold desert basin", geology: "Evaporites, hydrated salts", environment: "Low pressure, high UV, cold", resources: "Saline lake, seasonal access", relevance: "Proposed Mars analogue site (ISRO / PRL studies)", category: "mars",
    scores: { terrain: 68, geology: 76, environment: 85, solar: 92, water: 50, mineral: 80, access: 45, research: 60, resilience: 55 },
    advantages: ["Low pressure, high UV", "Hydrated sulfate deposits"], limitations: ["Altitude logistics", "Winter isolation"] }),
  L({ id: "holuhraun", name: "Holuhraun Lava Field", country: "Iceland", lat: 64.87, lon: -16.83, elevation: 750, terrain: "Fresh basaltic lava field", geology: "2014–15 basaltic flows", environment: "Subpolar, unvegetated", resources: "Glacial water", relevance: "Lava flow analogue for Mars and lunar volcanic plains", category: "multi",
    scores: { terrain: 85, geology: 87, environment: 62, solar: 38, water: 75, mineral: 65, access: 55, research: 70, resilience: 60 },
    advantages: ["Fresh unweathered basalt", "Rover test heritage"], limitations: ["Harsh weather", "Low winter sunlight"] }),
  L({ id: "meteor", name: "Meteor Crater (Barringer)", country: "USA", lat: 35.03, lon: -111.02, elevation: 1740, terrain: "1.2 km simple impact crater", geology: "Sedimentary target, ejecta blanket", environment: "Arid", resources: "Road access", relevance: "Apollo astronaut training site", category: "lunar",
    scores: { terrain: 88, geology: 60, environment: 68, solar: 88, water: 25, mineral: 50, access: 90, research: 84, resilience: 72 },
    advantages: ["Well-preserved simple crater", "Apollo heritage"], limitations: ["Sedimentary not basaltic", "Tourism restrictions"] }),
  L({ id: "svalbard", name: "Bockfjorden, Svalbard", country: "Norway", lat: 79.43, lon: 13.3, elevation: 100, terrain: "Volcanic centres, permafrost", geology: "Carbonate globules similar to ALH84001", environment: "High Arctic", resources: "Ground ice, fjord", relevance: "AMASE rover testing", category: "mars",
    scores: { terrain: 62, geology: 82, environment: 72, solar: 30, water: 80, mineral: 84, access: 40, research: 76, resilience: 50 },
    advantages: ["Carbonates analogous to Martian meteorite"], limitations: ["Polar night", "Wildlife hazards"] }),
  L({ id: "pilbara", name: "Pilbara Craton", country: "Australia", lat: -21.2, lon: 119.4, elevation: 300, terrain: "Ancient eroded terrain", geology: "3.5 Ga stromatolites, cherts", environment: "Hot arid", resources: "Mining infrastructure", relevance: "Early-life biosignature analogue for Jezero", category: "mars",
    scores: { terrain: 55, geology: 85, environment: 74, solar: 97, water: 28, mineral: 78, access: 60, research: 82, resilience: 64 },
    advantages: ["Oldest biosignatures", "Excellent solar"], limitations: ["Extreme heat", "Remote"] }),
  L({ id: "danakil", name: "Dallol, Danakil Depression", country: "Ethiopia", lat: 14.24, lon: 40.3, elevation: -125, terrain: "Hydrothermal salt flats", geology: "Evaporites, acidic brines", environment: "Hottest inhabited region, pH < 1", resources: "Salt mining caravans", relevance: "Polyextreme habitability limit studies", category: "pending",
    scores: { terrain: 50, geology: 70, environment: 88, solar: 95, water: null, mineral: 82, access: 30, research: 55, resilience: 35 },
    advantages: ["Polyextreme chemistry"], limitations: ["Water data not available", "Security and heat hazards"] }),
  L({ id: "lanzarote", name: "Timanfaya, Lanzarote", country: "Spain", lat: 29.0, lon: -13.75, elevation: 400, terrain: "Volcanic cones, lava tubes", geology: "Basaltic flows, lava tubes", environment: "Arid subtropical", resources: "Island infrastructure", relevance: "ESA PANGAEA astronaut geology training", category: "lunar",
    scores: { terrain: 80, geology: 84, environment: 55, solar: 86, water: 40, mineral: 66, access: 94, research: 78, resilience: 85 },
    advantages: ["Lava tubes like lunar skylights", "Very accessible"], limitations: ["Protected national park"] }),
];

export const DATASETS = [
  { group: "Earth", name: "MODIS MOD11A2", mission: "Terra", instrument: "MODIS", desc: "8-day land surface temperature, day & night", id: "MOD11A2.061", archive: "LP DAAC", res: "1 km", period: "2000–present", status: "AUTHENTICATION REQUIRED", url: "https://lpdaac.usgs.gov/products/mod11a2v061/" },
  { group: "Earth", name: "MODIS MOD13Q1", mission: "Terra", instrument: "MODIS", desc: "16-day NDVI / EVI vegetation indices", id: "MOD13Q1.061", archive: "LP DAAC", res: "250 m", period: "2000–present", status: "AUTHENTICATION REQUIRED", url: "https://lpdaac.usgs.gov/products/mod13q1v061/" },
  { group: "Earth", name: "NASA SRTM", mission: "SRTM (STS-99)", instrument: "C-band radar", desc: "Global elevation model", id: "SRTMGL1.003", archive: "LP DAAC", res: "30 m", period: "Feb 2000", status: "PROCESSING REQUIRED", url: "https://lpdaac.usgs.gov/products/srtmgl1v003/" },
  { group: "Earth", name: "NASA POWER", mission: "POWER (LaRC)", instrument: "CERES / MERRA-2 derived", desc: "Solar radiation, temperature, precipitation climatology", id: "POWER Climatology API", archive: "NASA LaRC", res: "0.5° × 0.625°", period: "1981–present", status: "LIVE", url: "https://power.larc.nasa.gov/" },
  { group: "Earth", name: "NASA AppEEARS", mission: "LP DAAC", instrument: "Sampling service", desc: "Point/area sampling of MODIS and other products", id: "AppEEARS API", archive: "Earthdata Cloud", res: "Product-dependent", period: "—", status: "AUTHENTICATION REQUIRED", url: "https://appeears.earthdatacloud.nasa.gov/" },
  { group: "Moon", name: "LRO LOLA", mission: "Lunar Reconnaissance Orbiter", instrument: "LOLA", desc: "Lunar elevation, slopes, roughness", id: "LRO-L-LOLA-4-GDR-V1.0", archive: "PDS Geosciences", res: "Up to 5 m (poles)", period: "2009–present", status: "PROCESSING REQUIRED", url: "https://pds-geosciences.wustl.edu/missions/lro/lola.htm" },
  { group: "Moon", name: "LROC", mission: "Lunar Reconnaissance Orbiter", instrument: "NAC / WAC", desc: "Surface imagery and morphology", id: "LRO-L-LROC-5-RDR-V1.0", archive: "PDS Imaging", res: "0.5 m (NAC)", period: "2009–present", status: "AVAILABLE", url: "https://wms.lroc.asu.edu/lroc" },
  { group: "Moon", name: "Diviner", mission: "Lunar Reconnaissance Orbiter", instrument: "Diviner Radiometer", desc: "Surface temperature and thermal inertia", id: "LRO-L-DLRE-5-GDR-V1.0", archive: "PDS Geosciences", res: "~200 m", period: "2009–present", status: "PROCESSING REQUIRED", url: "https://pds-geosciences.wustl.edu/missions/lro/diviner.htm" },
  { group: "Moon", name: "LEND", mission: "Lunar Reconnaissance Orbiter", instrument: "LEND", desc: "Neutron flux, hydrogen indicators", id: "LRO-L-LEND-4-RDR-V1.0", archive: "PDS Geosciences", res: "~10 km", period: "2009–present", status: "PROCESSING REQUIRED", url: "https://pds-geosciences.wustl.edu/missions/lro/lend.htm" },
  { group: "Mars", name: "MOLA", mission: "Mars Global Surveyor", instrument: "MOLA", desc: "Global Mars topography", id: "MGS-M-MOLA-5-MEGDR-L3-V1.0", archive: "PDS Geosciences", res: "~463 m", period: "1997–2001", status: "PROCESSING REQUIRED", url: "https://pds-geosciences.wustl.edu/missions/mgs/mola.html" },
  { group: "Mars", name: "THEMIS", mission: "Mars Odyssey", instrument: "THEMIS", desc: "Infrared thermal imaging, thermal inertia", id: "ODY-M-THM-5-IRGEO-V2.0", archive: "PDS / ASU", res: "100 m (IR)", period: "2002–present", status: "AVAILABLE", url: "https://themis.asu.edu/" },
  { group: "Mars", name: "HiRISE", mission: "Mars Reconnaissance Orbiter", instrument: "HiRISE", desc: "High-resolution surface imagery", id: "MRO-M-HIRISE-3-RDR-V1.1", archive: "PDS Imaging", res: "~0.3 m", period: "2006–present", status: "AVAILABLE", url: "https://www.uahirise.org/" },
  { group: "Mars", name: "CRISM", mission: "Mars Reconnaissance Orbiter", instrument: "CRISM", desc: "Mineralogical spectral data", id: "MRO-M-CRISM-3-RDR-TARGETED-V1.0", archive: "PDS Geosciences", res: "18 m", period: "2006–2018", status: "PROCESSING REQUIRED", url: "https://pds-geosciences.wustl.edu/missions/mro/crism.htm" },
  { group: "Mars", name: "Mars Climate Sounder", mission: "Mars Reconnaissance Orbiter", instrument: "MCS", desc: "Atmospheric temperature, dust & ice profiles", id: "MRO-M-MCS-5-DDR-V1.0", archive: "PDS Atmospheres", res: "~5 km vertical", period: "2006–present", status: "PROCESSING REQUIRED", url: "https://atmos.nmsu.edu/data_and_services/atmospheres_data/MARS/mcs.html" },
] as const;
