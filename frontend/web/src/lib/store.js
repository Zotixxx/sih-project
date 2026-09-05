"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { metrixApi } from "./api";
import { getSupabaseBrowserClient } from "./supabase/browser";

const MetrixStoreContext = createContext(null);

const portalRole = (role) =>
  role === "ASSISTANT_CONTROLLER" || role === "SYSTEM_ADMIN"
    ? "admin"
    : role === "LMO"
    ? "lmo"
    : "business";

export function MetrixStoreProvider({ children }) {
  const [isHydrated, setIsHydrated] = useState(!metrixApi.isSupabaseConfigured);
  const [currentUser, setCurrentUserState] = useState(null);
  const [userRole, setUserRoleState] = useState(null);
  const [district, setDistrict] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [businesses] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [lmos, setLmos] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [currentDraft, setCurrentDraft] = useState(null);
  const currentUserRef = useRef(null);
  const refreshInFlightRef = useRef(false);

  const setCurrentUser = (user) => {
    currentUserRef.current = user;
    setCurrentUserState(user);
    setUserRoleState(user?.role ? portalRole(user.role) : null);
  };

  const clearData = () => {
    setDashboardStats(null);
    setDistrict(null);
    setInstruments([]);
    setApplications([]);
    setLmos([]);
    setInspections([]);
    setCertificates([]);
    setNotifications([]);
    setAuditLogs([]);
    setBusinessProfile(null);
    setCurrentDraft(null);
  };

  const refreshData = useCallback(async (userToLoad) => {
    if (refreshInFlightRef.current) return;
    const user = userToLoad || currentUserRef.current;
    if (!user) {
      setIsHydrated(true);
      return;
    }

    refreshInFlightRef.current = true;
    try {
      const calls = [
        metrixApi.getDashboardStats(),
        metrixApi.getApplications(),
        metrixApi.getCertificates(),
        metrixApi.getNotifications(),
        metrixApi.getAuditLogs(),
      ];

      if (user.role === "BUSINESS") {
        calls.push(metrixApi.getInstruments());
        calls.push(metrixApi.getBusinessProfile());
        calls.push(metrixApi.getDraft());
      } else if (user.role === "LMO") {
        calls.push(metrixApi.getInspections());
      } else {
        calls.push(metrixApi.getLmos());
        calls.push(metrixApi.getInspections());
      }

      const [
        dashRes,
        appsRes,
        certsRes,
        notifsRes,
        auditsRes,
        sixthRes,
        seventhRes,
        eighthRes,
      ] = await Promise.allSettled(calls);

      if (dashRes.status === "fulfilled" && dashRes.value?.data) {
        setDashboardStats(dashRes.value.data);
        if (dashRes.value.data.district) setDistrict(dashRes.value.data.district);
      }
      if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value?.data)) {
        setApplications(appsRes.value.data);
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

      if (user.role === "BUSINESS") {
        if (sixthRes.status === "fulfilled" && Array.isArray(sixthRes.value?.data)) {
          setInstruments(sixthRes.value.data);
        }
        if (seventhRes.status === "fulfilled" && seventhRes.value?.data) {
          setBusinessProfile(seventhRes.value.data);
        }
        if (eighthRes.status === "fulfilled") {
          setCurrentDraft(eighthRes.value?.data || null);
        }
      } else if (user.role === "LMO") {
        if (sixthRes.status === "fulfilled" && Array.isArray(sixthRes.value?.data)) {
          setInspections(sixthRes.value.data);
        }
      } else if (user.role === "ASSISTANT_CONTROLLER" || user.role === "SYSTEM_ADMIN") {
        if (sixthRes.status === "fulfilled" && Array.isArray(sixthRes.value?.data)) {
          setLmos(sixthRes.value.data);
        }
        if (seventhRes.status === "fulfilled" && Array.isArray(seventhRes.value?.data)) {
          setInspections(seventhRes.value.data);
        }
      }
    } finally {
      refreshInFlightRef.current = false;
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!metrixApi.isSupabaseConfigured) {
      return;
    }

    let mounted = true;

    const hydrate = async () => {
      try {
        const profileResponse = await metrixApi.getProfile();
        if (!mounted) return;
        const profile = profileResponse.data;
        setCurrentUser(profile);
        await refreshData(profile);
      } catch {
        if (!mounted) return;
        setCurrentUser(null);
        clearData();
        setIsHydrated(true);
      }
    };

    hydrate();

    const { data } = getSupabaseBrowserClient().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        clearData();
        setIsHydrated(true);
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [refreshData]);

  const authenticate = async ({ email, password }) => {
    const { user } = await metrixApi.loginWithSupabase(email, password);
    setCurrentUser(user);
    await refreshData(user);
    return user;
  };

  const logout = async () => {
    await metrixApi.logoutSupabase();
    setCurrentUser(null);
    clearData();
  };

  const acceptApplication = async (id) => {
    const res = await metrixApi.acceptApplication(id);
    if (res?.data) {
      setApplications((prev) => prev.map((application) => (application.id === id ? res.data : application)));
      await refreshData(currentUserRef.current);
      return res.data;
    }
    return null;
  };

  const rejectApplication = async (id, rejectionReason) => {
    const res = await metrixApi.rejectApplication(id, rejectionReason);
    if (res?.data) {
      setApplications((prev) => prev.map((application) => (application.id === id ? res.data : application)));
      await refreshData(currentUserRef.current);
      return res.data;
    }
    return null;
  };

  const assignLmo = async ({ applicationId, officerId, scheduledDate }) => {
    const res = await metrixApi.assignLmo(applicationId, officerId, scheduledDate);
    if (res?.data) {
      await refreshData(currentUserRef.current);
      return res.data;
    }
    return null;
  };

  const approveInspection = async ({ applicationId, remarks }) => {
    const res = await metrixApi.approveInspection(applicationId, remarks);
    if (res?.data) {
      setCertificates((prev) => [res.data, ...prev.filter((certificate) => certificate.id !== res.data.id)]);
      await refreshData(currentUserRef.current);
      return res.data;
    }
    return null;
  };

  const returnInspection = async ({ applicationId, reason }) => {
    const res = await metrixApi.returnInspection(applicationId, reason);
    if (res?.data) {
      await refreshData(currentUserRef.current);
      return res.data;
    }
    return null;
  };

  const updateBusinessProfile = async (profileData) => {
    const res = await metrixApi.updateBusinessProfile(profileData);
    if (res?.data) {
      setBusinessProfile(res.data);
      await refreshData(currentUserRef.current);
      return res.data;
    }
    return null;
  };

  const addInstrument = async (instrumentData) => {
    const res = await metrixApi.createInstrument(instrumentData);
    if (!res?.data) throw new Error("The server did not return the saved instrument.");
    setInstruments((prev) => [res.data, ...prev]);
    await refreshData(currentUserRef.current);
    return res.data;
  };

  const updateInstrument = async (id, instrumentData) => {
    const res = await metrixApi.updateInstrument(id, instrumentData);
    if (res?.data) {
      setInstruments((prev) => prev.map((instrument) => (instrument.id === id ? res.data : instrument)));
      await refreshData(currentUserRef.current);
      return res.data;
    }
    return null;
  };

  const submitApplication = async (applicationData) => {
    const res = await metrixApi.createApplication(applicationData);
    if (res?.data) {
      setApplications((prev) => [res.data, ...prev]);
      setCurrentDraft(null);
      await refreshData(currentUserRef.current);
      return res.data;
    }
    return null;
  };

  const saveDraft = async (draftData) => {
    const res = await metrixApi.saveDraft(draftData);
    if (res?.data) {
      setCurrentDraft(res.data);
      return res.data;
    }
    return null;
  };

  const clearDraft = () => {
    setCurrentDraft(null);
  };

  const issueNotice = async (noticeData) => {
    const res = await metrixApi.createNotice(noticeData);
    if (res?.data) {
      setNotifications((prev) => [res.data, ...prev]);
      await refreshData(currentUserRef.current);
      return res.data;
    }
    return null;
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, unread: false, read: true } : notification))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, unread: false, read: true })));
  };

  return (
    <MetrixStoreContext.Provider
      value={{
        isHydrated,
        currentUser,
        authenticate,
        logout,
        userRole,
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
