"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { metrixApi } from "./api";

const MetrixStoreContext = createContext(null);

export const DEFAULT_USERS = [
  {
    id: "AC-AJM-001",
    name: "Dr. R. K. Sharma",
    role: "ASSISTANT_CONTROLLER",
    district_id: "AJM",
    designation: "Assistant Controller of Legal Metrology",
    districtName: "Ajmer",
    badge: "AC-AJM-001",
    subtitle: "District Regulatory Head (Ajmer)",
  },
  {
    id: "AC-JPR-001",
    name: "Dr. M. L. Gupta",
    role: "ASSISTANT_CONTROLLER",
    district_id: "JPR",
    designation: "Assistant Controller of Legal Metrology",
    districtName: "Jaipur",
    badge: "AC-JPR-001",
    subtitle: "District Regulatory Head (Jaipur)",
  },
  {
    id: "LMO-AJM-021",
    name: "Rajesh Kumar",
    role: "LMO",
    district_id: "AJM",
    designation: "Legal Metrology Officer",
    districtName: "Ajmer",
    badge: "LMO-AJM-021",
    subtitle: "Field Officer (Ajmer City)",
  },
  {
    id: "LMO-JPR-001",
    name: "Sanjay Verma",
    role: "LMO",
    district_id: "JPR",
    designation: "Legal Metrology Officer",
    districtName: "Jaipur",
    badge: "LMO-JPR-001",
    subtitle: "Field Officer (Jaipur North)",
  },
  {
    id: "BIZ-AJM-001",
    name: "Ramesh Kumar Agarwal",
    businessName: "Shree Balaji Traders & Cold Storage",
    role: "BUSINESS",
    district_id: "AJM",
    districtName: "Ajmer",
    subtitle: "Merchant (Ajmer Commercial Yard)",
  },
  {
    id: "BIZ-JPR-001",
    name: "Naresh Sharma",
    businessName: "Jaipur Agro & Pulse Processing Mills",
    role: "BUSINESS",
    district_id: "JPR",
    districtName: "Jaipur",
    subtitle: "Merchant (VKI Industrial Area, Jaipur)",
  },
  {
    id: "SYS-ADMIN-001",
    name: "System Administrator",
    role: "SYSTEM_ADMIN",
    district_id: "ALL",
    districtName: "All Rajasthan Districts",
    badge: "STATE-ADMIN",
    subtitle: "Technical Platform Administration",
  },
];

export function MetrixStoreProvider({ children }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUserState] = useState(DEFAULT_USERS[0]);
  const [userRole, setUserRoleState] = useState("admin"); // 'admin' | 'lmo' | 'business'
  const [district, setDistrict] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [lmos, setLmos] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [currentDraft, setCurrentDraft] = useState(null);
  const currentUserRef = useRef(currentUser);
  const refreshInFlightRef = useRef(false);
  const initializedRef = useRef(false);

  // Sync with Backend API
  const refreshData = useCallback(async (userToLoad) => {
    if (refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;
    const user = userToLoad || currentUserRef.current;
    try {
      metrixApi.setUserId(user.id);

      const [dashRes, appsRes, lmosRes, inspsRes, certsRes, notifsRes, auditsRes, instsRes, bizRes, draftRes] =
        await Promise.allSettled([
          metrixApi.getDashboardStats(),
          metrixApi.getApplications(),
          metrixApi.getLmos(),
          metrixApi.getInspections(),
          metrixApi.getCertificates(),
          metrixApi.getNotifications(),
          metrixApi.getAuditLogs(),
          metrixApi.getInstruments(),
          metrixApi.getBusinessProfile(),
          metrixApi.getDraft(),
        ]);

      if (dashRes.status === "fulfilled" && dashRes.value?.data) {
        setDashboardStats(dashRes.value.data);
        if (dashRes.value.data.district) {
          setDistrict(dashRes.value.data.district);
        }
      }

      if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value?.data)) {
        setApplications(appsRes.value.data);
      }

      if (lmosRes.status === "fulfilled" && Array.isArray(lmosRes.value?.data)) {
        setLmos(lmosRes.value.data);
      }

      if (inspsRes.status === "fulfilled" && Array.isArray(inspsRes.value?.data)) {
        setInspections(inspsRes.value.data);
      }

      if (certsRes.status === "fulfilled" && Array.isArray(certsRes.value?.data)) {
        setCertificates(certsRes.value.data);
      }

      if (notifsRes.status === "fulfilled" && Array.isArray(notifsRes.value?.data)) {
        setNotifications(notifsRes.value.data);
      }

      if (auditsRes.status === "fulfilled" && Array.isArray(auditsRes.value?.data)) {
        setAuditLogs(auditsRes.value.data);
      }

      if (instsRes.status === "fulfilled" && Array.isArray(instsRes.value?.data)) {
        setInstruments(instsRes.value.data);
      }

      if (bizRes.status === "fulfilled" && bizRes.value?.data) {
        setBusinessProfile(bizRes.value.data);
      }

      if (draftRes.status === "fulfilled") {
        setCurrentDraft(draftRes.value?.data || null);
      }
    } catch (err) {
      console.warn("Backend API sync warning:", err);
    } finally {
      refreshInFlightRef.current = false;
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let initialUser = currentUserRef.current;
    try {
      const savedUser = localStorage.getItem("metrix_active_user");
      const savedRole = localStorage.getItem("metrix_active_role");
      if (savedUser && savedRole) {
        initialUser = JSON.parse(savedUser);
        currentUserRef.current = initialUser;
        queueMicrotask(() => {
          setCurrentUserState(initialUser);
          setUserRoleState(savedRole);
          metrixApi.setUserId(initialUser.id);
        });
      }
    } catch (e) {
      console.warn("Could not load persona from localStorage:", e);
    }

    refreshData(initialUser);
  }, [refreshData]);

  const authenticate = async (userId) => {
    const { user } = await metrixApi.login(userId);
    const role = user.role === "ASSISTANT_CONTROLLER" || user.role === "SYSTEM_ADMIN"
      ? "admin"
      : user.role === "LMO" ? "lmo" : "business";
    setCurrentUserState(user);
    setUserRoleState(role);
    localStorage.setItem("metrix_active_user", JSON.stringify(user));
    localStorage.setItem("metrix_active_role", role);
    await refreshData(user);
    return user;
  };

  const switchUser = (user) => {
    currentUserRef.current = user;
    setCurrentUserState(user);
    let role = "business";
    if (user.role === "ASSISTANT_CONTROLLER" || user.role === "SYSTEM_ADMIN") {
      role = "admin";
    } else if (user.role === "LMO") {
      role = "lmo";
    }
    setUserRoleState(role);
    try {
      localStorage.setItem("metrix_active_user", JSON.stringify(user));
      localStorage.setItem("metrix_active_role", role);
    } catch (e) {}
    metrixApi.setUserId(user.id);
    refreshData(user);
  };

  const setUserRole = (roleKey) => {
    setUserRoleState(roleKey);
    const matched = DEFAULT_USERS.find((u) => {
      if (roleKey === "admin") return u.role === "ASSISTANT_CONTROLLER";
      if (roleKey === "lmo") return u.role === "LMO";
      return u.role === "BUSINESS";
    }) || DEFAULT_USERS[0];

    currentUserRef.current = matched;
    setCurrentUserState(matched);
    try {
      localStorage.setItem("metrix_active_user", JSON.stringify(matched));
      localStorage.setItem("metrix_active_role", roleKey);
    } catch (e) {}
    metrixApi.setUserId(matched.id);
    refreshData(matched);
  };

  // --- 1. Accept Application ---
  const acceptApplication = async (id) => {
    try {
      const res = await metrixApi.acceptApplication(id);
      if (res?.data) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? res.data : a))
        );
        refreshData(currentUser);
        return res.data;
      }
    } catch (err) {
      console.error("Accept application failed:", err);
      throw err;
    }
  };

  // --- 2. Reject Application ---
  const rejectApplication = async (id, rejectionReason) => {
    try {
      const res = await metrixApi.rejectApplication(id, rejectionReason);
      if (res?.data) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? res.data : a))
        );
        refreshData(currentUser);
        return res.data;
      }
    } catch (err) {
      console.error("Reject application failed:", err);
      throw err;
    }
  };

  // --- 3. LMO Assignment ---
  const assignLmo = async ({ applicationId, officerId, scheduledDate }) => {
    try {
      const res = await metrixApi.assignLmo(applicationId, officerId, scheduledDate);
      if (res?.data) {
        refreshData(currentUser);
        return res.data;
      }
    } catch (err) {
      console.error("Assign LMO failed:", err);
      throw err;
    }
  };

  // --- 4. Final Approval & Certificate Issuance ---
  const approveInspection = async ({ applicationId, remarks }) => {
    try {
      const res = await metrixApi.approveInspection(applicationId, remarks);
      if (res?.data) {
        setCertificates((prev) => [res.data, ...prev]);
        refreshData(currentUser);
        return res.data;
      }
    } catch (err) {
      console.error("Approve inspection failed:", err);
      throw err;
    }
  };

  // --- 5. Return Inspection for Correction ---
  const returnInspection = async ({ applicationId, reason }) => {
    try {
      const res = await metrixApi.returnInspection(applicationId, reason);
      if (res?.data) {
        refreshData(currentUser);
        return res.data;
      }
    } catch (err) {
      console.error("Return inspection failed:", err);
      throw err;
    }
  };

  // --- 6. Update Business Profile ---
  const updateBusinessProfile = async (profileData) => {
    try {
      const res = await metrixApi.updateBusinessProfile(profileData);
      if (res?.data) {
        setBusinessProfile(res.data);
        refreshData(currentUser);
        return res.data;
      }
    } catch (err) {
      console.error("Update business profile failed:", err);
      throw err;
    }
  };

  // --- 7. Add & Update Instrument with Purchase Bill ---
  const addInstrument = async (instrumentData) => {
    try {
      const res = await metrixApi.createInstrument(instrumentData);
      if (!res?.data) {
        throw new Error("The server did not return the saved instrument.");
      }

      setInstruments((prev) => [res.data, ...prev]);
      await refreshData(currentUserRef.current);
      return res.data;
    } catch (err) {
      console.error("Add instrument failed:", err);
      throw err;
    }
  };

  const updateInstrument = async (id, instrumentData) => {
    try {
      const res = await metrixApi.updateInstrument(id, instrumentData);
      if (res?.data) {
        setInstruments((prev) =>
          prev.map((inst) => (inst.id === id ? { ...inst, ...res.data } : inst))
        );
        refreshData(currentUser);
        return res.data;
      }
    } catch (err) {
      console.error("Update instrument API failed, using fallback:", err);
      throw err;
    }
  };

  // --- 8. Submit Application ---
  const submitApplication = async (applicationData) => {
    try {
      const res = await metrixApi.createApplication(applicationData);
      if (res?.data) {
        setApplications((prev) => [res.data, ...prev]);
        setCurrentDraft(null);
        refreshData(currentUser);
        return res.data;
      }
    } catch (err) {
      console.error("Submit application failed:", err);
      throw err;
    }
  };

  // --- 9. Draft Management ---
  const saveDraft = async (draftData) => {
    try {
      const res = await metrixApi.saveDraft(draftData);
      if (res?.data) {
        setCurrentDraft(res.data);
        return res.data;
      }
    } catch (err) {
      console.warn("Save draft fallback:", err);
    }
  };

  const clearDraft = () => {
    setCurrentDraft(null);
  };

  // --- 10. Issue Official Notice to LMOs ---
  const issueNotice = async (noticeData) => {
    try {
      const res = await metrixApi.createNotice(noticeData);
      if (res?.data) {
        setNotifications((prev) => [res.data, ...prev]);
        refreshData(currentUser);
        return res.data;
      }
    } catch (err) {
      console.error("Issue notice failed:", err);
      throw err;
    }
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false, read: true }))
    );
  };

  // Reset to default state
  const resetToDefault = async () => {
    await metrixApi.resetDatabase().catch(() => {});
    refreshData(currentUser);
  };

  return (
    <MetrixStoreContext.Provider
      value={{
        isHydrated,
        currentUser,
        authenticate,
        switchUser,
        userRole,
        setUserRole,
        district,
        dashboardStats,
        businesses,
        instruments,
        applications,
        lmos,
        inspections,
        certificates,
        notifications,
        auditLogs,
        businessProfile,
        currentDraft,
        updateBusinessProfile,
        addInstrument,
        updateInstrument,
        submitApplication,
        saveDraft,
        clearDraft,
        acceptApplication,
        rejectApplication,
        assignLmo,
        approveInspection,
        returnInspection,
        issueNotice,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshData,
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
