export const loadTechnicianFromStorage = (store) => (next) => (action) => {
  // Call first to allow the action to be processed
  const result = next(action);
  
  // Only load from storage on app init, not after login
  // because login already sets technician from API response
  if (action.type === "@@INIT") {
    const technician = localStorage.getItem("technician");
    if (technician) {
      try {
        const technicianData = JSON.parse(technician);
        store.dispatch({
          type: "auth/setTechnician",
          payload: technicianData,
        });
      } catch (error) {
        console.error("Error parsing technician from localStorage:", error);
        localStorage.removeItem("technician"); // Clean up corrupted data
      }
    }
  }

  return result;
};