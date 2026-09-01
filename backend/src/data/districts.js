// MetriX Multi-District Definitions
// Currently supported: Ajmer (AJM) and Jaipur (JPR). Architecture is generic and extensible to any future district.

export const districts = [
  {
    id: "AJM",
    code: "AJM",
    name: "Ajmer",
    state: "Rajasthan",
    zone: "Central Rajasthan Administrative Zone",
    controllerOffice: "Office of the Assistant Controller of Legal Metrology, Ajmer",
    officeAddress: "Collectorate Compound, Kutchery Road, Ajmer, Rajasthan - 305001",
    subDivisions: ["Ajmer City", "Kishangarh", "Beawar", "Nasirabad", "Pushkar"],
    activeComplianceRate: "98.4%",
  },
  {
    id: "JPR",
    code: "JPR",
    name: "Jaipur",
    state: "Rajasthan",
    zone: "Jaipur Metropolitan Administrative Zone",
    controllerOffice: "Office of the Assistant Controller of Legal Metrology, Jaipur",
    officeAddress: "District Administrative Complex, Bani Park, Jaipur, Rajasthan - 302016",
    subDivisions: ["Jaipur North", "Jaipur South", "Sitapura Industrial Area", "VKI Zone", "Sanganer"],
    activeComplianceRate: "97.9%",
  },
];
