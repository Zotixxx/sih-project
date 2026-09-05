// Static district configuration only. Operational records are created through the API.
export const initialSeedData = {
  districts: [
    {
      id: "AJM",
      code: "AJM",
      name: "Ajmer",
      state: "Rajasthan",
      zone: "Central Rajasthan Administrative Zone",
      controllerOffice: "Office of the Assistant Controller of Legal Metrology, Ajmer",
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
      subDivisions: ["Jaipur North", "Jaipur South", "Sitapura Industrial Area", "VKI Zone", "Sanganer"],
      activeComplianceRate: "97.9%",
    },
  ],
};
