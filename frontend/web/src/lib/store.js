"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  initialUserProfile,
  initialInstruments,
  initialApplications,
  initialCertificates,
  initialInspections,
  initialNotifications,
} from "./mockData";
import { generateHash } from "./utils";

const MetrixStoreContext = createContext(null);

export function MetrixStoreProvider({ children }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [userRole, setUserRoleState] = useState("business"); // 'business' | 'lmo' | 'admin'
  const [userProfile, setUserProfileState] = useState(initialUserProfile);
  const [instruments, setInstrumentsState] = useState(initialInstruments);
  const [applications, setApplicationsState] = useState(initialApplications);
  const [certificates, setCertificatesState] = useState(initialCertificates);
  const [inspections, setInspectionsState] = useState(initialInspections);
  const [notifications, setNotificationsState] = useState(initialNotifications);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("metrix_user_role");
      const savedProfile = localStorage.getItem("metrix_user_profile");
      const savedInstruments = localStorage.getItem("metrix_instruments");
      const savedApplications = localStorage.getItem("metrix_applications");
      const savedCertificates = localStorage.getItem("metrix_certificates");
      const savedInspections = localStorage.getItem("metrix_inspections");
      const savedNotifications = localStorage.getItem("metrix_notifications");

      if (savedRole) setUserRoleState(savedRole);
      if (savedProfile) setUserProfileState(JSON.parse(savedProfile));
      if (savedInstruments) setInstrumentsState(JSON.parse(savedInstruments));
      if (savedApplications) setApplicationsState(JSON.parse(savedApplications));
      if (savedCertificates) setCertificatesState(JSON.parse(savedCertificates));
      if (savedInspections) setInspectionsState(JSON.parse(savedInspections));
      if (savedNotifications) setNotificationsState(JSON.parse(savedNotifications));
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save changes to localStorage
  const setUserRole = (role) => {
    setUserRoleState(role);
    localStorage.setItem("metrix_user_role", role);
  };

  const setUserProfile = (profile) => {
    setUserProfileState(profile);
    localStorage.setItem("metrix_user_profile", JSON.stringify(profile));
  };

  const addInstrument = (instrumentData) => {
    const newId = `INST-2026-${String(instruments.length + 1).padStart(3, "0")}`;
    const newInstrument = {
      id: newId,
      verificationStatus: "DRAFT",
      installationDate: new Date().toISOString().split("T")[0],
      ...instrumentData,
    };
    const updated = [newInstrument, ...instruments];
    setInstrumentsState(updated);
    localStorage.setItem("metrix_instruments", JSON.stringify(updated));

    // Add notification
    addNotification({
      title: "New Instrument Registered",
      message: `${newInstrument.name} (S/N: ${newInstrument.serialNumber}) registered successfully.`,
      category: "INSTRUMENT_REGISTERED",
      actionUrl: `/instruments`,
      priority: "LOW",
    });

    return newInstrument;
  };

  const submitApplication = (appData) => {
    const newAppId = `APP-2026-${String(applications.length + 200).padStart(5, "0")}`;
    const newApp = {
      id: newAppId,
      status: "SUBMITTED",
      submissionDate: new Date().toISOString().split("T")[0],
      scheduledDate: "Pending Assignment",
      scheduledTime: "-",
      assignedOfficer: "Pending Department Assignment",
      feePaid: "₹ 3,500.00",
      transactionId: `TXN-GOV-${Math.floor(10000000 + Math.random() * 90000000)}`,
      ...appData,
    };

    const updatedApps = [newApp, ...applications];
    setApplicationsState(updatedApps);
    localStorage.setItem("metrix_applications", JSON.stringify(updatedApps));

    // Update target instrument verification status
    if (appData.instrumentId) {
      const updatedInst = instruments.map((inst) =>
        inst.id === appData.instrumentId
          ? { ...inst, verificationStatus: "PENDING" }
          : inst
      );
      setInstrumentsState(updatedInst);
      localStorage.setItem("metrix_instruments", JSON.stringify(updatedInst));
    }

    addNotification({
      title: "Verification Application Submitted",
      message: `Application ${newAppId} for ${appData.instrumentName} filed with Legal Metrology Dept.`,
      category: "APPLICATION_SUBMITTED",
      actionUrl: `/applications`,
      priority: "MEDIUM",
    });

    return newApp;
  };

  const assignOfficerAndSchedule = (appId, officerName, date, time) => {
    const targetApp = applications.find((a) => a.id === appId);
    const updatedApps = applications.map((app) =>
      app.id === appId
        ? {
            ...app,
            status: "SCHEDULED",
            assignedOfficer: officerName,
            scheduledDate: date,
            scheduledTime: time || "11:00 AM",
          }
        : app
      );
    setApplicationsState(updatedApps);
    localStorage.setItem("metrix_applications", JSON.stringify(updatedApps));

    // Create corresponding inspection record if it doesn't exist
    const newInspId = `INSP-2026-${String(inspections.length + 50).padStart(4, "0")}`;
    const newInsp = {
      id: newInspId,
      applicationId: appId,
      instrumentId: targetApp?.instrumentId || "INST-2024-001",
      instrumentName: targetApp?.instrumentName || "Weighing Instrument",
      officer: officerName,
      officerRole: "Legal Metrology Officer",
      scheduledDate: date,
      scheduledTime: time || "11:00 AM",
      status: "SCHEDULED",
      location: targetApp?.location || "Site Address",
      gpsCoords: "28.5355° N, 77.2601° E",
      checklistItems: [
        { id: "c1", label: "Physical Examination & Plaque Readability", passed: true },
        { id: "c2", label: "Zero-Load Repeatability & Return to Zero", passed: true },
        { id: "c3", label: "Corner / Eccentricity Load Testing", passed: true },
        { id: "c4", label: "Maximum Permissible Error (MPE) Verification", passed: true },
        { id: "c5", label: "Tamper-Proof Lead/Wire Security Stamping", passed: false },
      ],
      measurements: [
        { testLoad: "10 kg", observed: "10.002 kg", mpe: "± 5 g", result: "PASS" },
        { testLoad: "20 kg", observed: "20.004 kg", mpe: "± 10 g", result: "PASS" },
      ],
      remarks: "Field inspection scheduled by Department Administrator.",
    };

    const updatedInsps = [newInsp, ...inspections];
    setInspectionsState(updatedInsps);
    localStorage.setItem("metrix_inspections", JSON.stringify(updatedInsps));

    addNotification({
      title: "Officer Assigned & Scheduled",
      message: `${officerName} assigned to ${appId} for inspection on ${date}.`,
      category: "SCHEDULE_UPDATE",
      actionUrl: `/applications`,
      priority: "MEDIUM",
    });
  };

  const completeInspectionAndIssueCertificate = (inspId, result, remarks, measurements) => {
    const targetInsp = inspections.find((i) => i.id === inspId);
    if (!targetInsp) return;

    const targetApp = applications.find((a) => a.id === targetInsp.applicationId);
    const targetInst = instruments.find((i) => i.id === targetInsp.instrumentId);

    // Update inspection
    const updatedInsps = inspections.map((insp) =>
      insp.id === inspId
        ? {
            ...insp,
            status: result === "PASS" ? "COMPLETED" : "FAILED",
            remarks: remarks || insp.remarks,
            measurements: measurements || insp.measurements,
          }
        : insp
    );
    setInspectionsState(updatedInsps);
    localStorage.setItem("metrix_inspections", JSON.stringify(updatedInsps));

    // Update application
    if (targetApp) {
      const updatedApps = applications.map((app) =>
        app.id === targetApp.id
          ? {
              ...app,
              status: result === "PASS" ? "PASSED" : "REJECTED",
            }
          : app
      );
      setApplicationsState(updatedApps);
      localStorage.setItem("metrix_applications", JSON.stringify(updatedApps));
    }

    if (result === "PASS") {
      // Issue new certificate
      const certId = `LM-DEL-2026-${String(certificates.length + 500).padStart(5, "0")}`;
      const today = new Date().toISOString().split("T")[0];
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const validUntil = nextYear.toISOString().split("T")[0];

      const newCert = {
        id: certId,
        certificateNumber: `LM/DL/2026/${certId.replace("LM-DEL-", "")}/PASS`,
        instrumentId: targetInst?.id || targetInsp.instrumentId,
        instrumentName: targetInst?.name || targetInsp.instrumentName,
        serialNumber: targetInst?.serialNumber || "SN-VERIFIED-2026",
        manufacturer: targetInst?.manufacturer || "Certified Manufacturer",
        model: targetInst?.model || "Standard Model",
        capacity: targetInst?.maxCapacity || "Standard Capacity",
        ownerName: userProfile.businessName,
        location: targetInsp.location,
        issueDate: today,
        validFrom: today,
        validUntil: validUntil,
        status: "VALID",
        issuingAuthority: "Directorate of Legal Metrology, Government of NCT of Delhi",
        officerName: targetInsp.officer,
        officerDesignation: "Legal Metrology Officer",
        securityHash: generateHash(certId + targetInst?.serialNumber),
        sealNumber: `SEAL-DEL-${Math.floor(10000 + Math.random() * 90000)}`,
        verificationStandardsUsed: "Working Standards verified against Apex Reference Masses",
      };

      const updatedCerts = [newCert, ...certificates];
      setCertificatesState(updatedCerts);
      localStorage.setItem("metrix_certificates", JSON.stringify(updatedCerts));

      // Update instrument status
      if (targetInst) {
        const updatedInsts = instruments.map((inst) =>
          inst.id === targetInst.id
            ? {
                ...inst,
                verificationStatus: "VERIFIED",
                lastVerificationDate: today,
                validUntil: validUntil,
                certificateId: certId,
                stampingOfficer: targetInsp.officer,
              }
            : inst
        );
        setInstrumentsState(updatedInsts);
        localStorage.setItem("metrix_instruments", JSON.stringify(updatedInsts));
      }

      addNotification({
        title: "Digital Certificate Issued!",
        message: `Certificate ${certId} generated for ${targetInsp.instrumentName}. Digitally signed and QR verified.`,
        category: "CERTIFICATE_ISSUED",
        actionUrl: `/certificates`,
        priority: "HIGH",
      });

      return newCert;
    }
  };

  const addNotification = (notif) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toISOString(),
      unread: true,
      ...notif,
    };
    const updated = [newNotif, ...notifications];
    setNotificationsState(updated);
    localStorage.setItem("metrix_notifications", JSON.stringify(updated));
  };

  const markNotificationAsRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, unread: false } : n
    );
    setNotificationsState(updated);
    localStorage.setItem("metrix_notifications", JSON.stringify(updated));
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    setNotificationsState(updated);
    localStorage.setItem("metrix_notifications", JSON.stringify(updated));
  };

  const resetToDefault = () => {
    localStorage.clear();
    setUserRoleState("business");
    setUserProfileState(initialUserProfile);
    setInstrumentsState(initialInstruments);
    setApplicationsState(initialApplications);
    setCertificatesState(initialCertificates);
    setInspectionsState(initialInspections);
    setNotificationsState(initialNotifications);
  };

  return (
    <MetrixStoreContext.Provider
      value={{
        isHydrated,
        userRole,
        setUserRole,
        userProfile,
        setUserProfile,
        instruments,
        addInstrument,
        applications,
        submitApplication,
        assignOfficerAndSchedule,
        certificates,
        inspections,
        completeInspectionAndIssueCertificate,
        notifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetToDefault,
      }}
    >
      {children}
    </MetrixStoreContext.Provider>
  );
}

export function useMetrixStore() {
  const context = useContext(MetrixStoreContext);
  if (!context) {
    throw new Error("useMetrixStore must be used within a MetrixStoreProvider");
  }
  return context;
}
