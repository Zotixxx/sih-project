"use client";

import React, { useState } from "react";
import Link from "next/link";
import Badge from "../ui/Badge";

export default function InspectionLocationMap({ inspections }) {
  const [selectedPin, setSelectedPin] = useState(inspections[0] || null);

  const pins = [
    {
      id: "pin-1",
      inspId: "INSP-2026-0044",
      name: "Industrial Pitless Weighbridge (60T)",
      category: "Heavy Weighbridge",
      officer: "Inspector Rajesh Sharma",
      location: "Gate 2 Inward Logistics Bay, Okhla",
      coords: "28.5284° N, 77.2798° E",
      status: "SCHEDULED",
      top: "58%",
      left: "64%",
      zone: "South Delhi",
    },
    {
      id: "pin-2",
      inspId: "INSP-2026-0038",
      name: "Precision Analytical Micro-Balance",
      category: "Class I Laboratory",
      officer: "Sunita Rao (LMO-AJM-005)",
      location: "Quality Assurance Lab, Bay 3, Okhla",
      coords: "28.5301° N, 77.2785° E",
      status: "COMPLETED",
      top: "52%",
      left: "68%",
      zone: "South Delhi",
    },
    {
      id: "pin-3",
      inspId: "INSP-2026-0048",
      name: "Dual Fuel Dispenser (Island A)",
      category: "Liquid Fuel Dispenser",
      officer: "Officer P. K. Verma",
      location: "Fuel Island, Connaught Place Fleet Depot",
      coords: "28.6304° N, 77.2177° E",
      status: "SCHEDULED",
      top: "34%",
      left: "48%",
      zone: "Central Delhi",
    },
    {
      id: "pin-4",
      inspId: "INSP-2026-0051",
      name: "Automated Checkweigher Conveyor",
      category: "Automatic Gravimetric",
      officer: "Inspector Rajesh Sharma",
      location: "Warehouse 1, Mayapuri Industrial Zone",
      coords: "28.6289° N, 77.1211° E",
      status: "COMPLETED",
      top: "36%",
      left: "32%",
      zone: "West Delhi",
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">
              map
            </span>
            GIS Field Inspection Radar &amp; GPS Geotags
          </h3>
          <p className="text-xs text-slate-500">
            Interactive territory map with real-time GPS inspection pins across NCT Delhi
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Scheduled
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Verified / Complete
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Canvas */}
        <div className="lg:col-span-8 relative h-[380px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
          {/* Map Grid Pattern & Roads */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* SVG Map Lines for Major Delhi Corridors */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
            <path
              d="M 120 80 Q 240 180 340 140 T 520 220 T 680 320"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <path
              d="M 280 40 L 320 360"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <path
              d="M 60 200 L 700 200"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <circle cx="340" cy="140" r="45" fill="none" stroke="#64748b" strokeWidth="1" />
            <text x="345" y="145" fill="#94a3b8" fontSize="10" fontWeight="bold">
              CENTRAL ZONE
            </text>
            <text x="480" y="270" fill="#94a3b8" fontSize="10" fontWeight="bold">
              SOUTH ZONE
            </text>
            <text x="140" y="220" fill="#94a3b8" fontSize="10" fontWeight="bold">
              WEST ZONE
            </text>
          </svg>

          {/* Dynamic Map Pins */}
          {pins.map((pin) => {
            const isSelected = selectedPin?.inspId === pin.inspId;
            return (
              <button
                key={pin.id}
                onClick={() => setSelectedPin(pin)}
                style={{ top: pin.top, left: pin.left }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform duration-200 z-20 ${
                  isSelected ? "scale-125 z-30" : "hover:scale-110"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[14px] shadow-lg border-2 ${
                      pin.status === "COMPLETED"
                        ? "bg-emerald-600 border-white"
                        : "bg-amber-500 border-white animate-pulse"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {pin.status === "COMPLETED" ? "check" : "schedule"}
                    </span>
                  </span>
                  {isSelected && (
                    <span className="absolute -bottom-6 whitespace-nowrap bg-white text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded shadow border border-slate-300">
                      {pin.zone}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Map Controls Watermark */}
          <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] font-mono-code text-slate-400 border border-slate-800">
            OpenStreetMap • Legal Metrology GIS v1.0
          </div>
        </div>

        {/* Selected Pin Details Panel */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 text-xs">
          {selectedPin ? (
            <>
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="font-mono-code font-bold text-slate-500 text-[10px]">
                    {selectedPin.inspId}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedPin.name}
                  </h4>
                </div>
                <Badge status={selectedPin.status} />
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">
                    Assigned Officer
                  </span>
                  <p className="font-semibold text-slate-800">
                    {selectedPin.officer}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">
                    Operating Premises
                  </span>
                  <p className="font-semibold text-slate-800">
                    {selectedPin.location}
                  </p>
                </div>

                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-emerald-600">
                      pin_drop
                    </span>
                    GPS Geotag Stamp
                  </span>
                  <p className="font-mono-code font-bold text-slate-900 mt-0.5">
                    {selectedPin.coords}
                  </p>
                </div>
              </div>

              <Link
                href="/inspections"
                className="w-full py-2 rounded-lg bg-slate-900 text-white font-bold text-xs text-center block hover:bg-slate-800 transition-colors shadow-2xs"
              >
                View Full Audit Details →
              </Link>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Select a pin on the territory map to inspect coordinates and field status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
