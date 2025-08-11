export const loadTechnicianFromStorage = (store) => (next) => (action) => {
  // Gọi khi app khởi tạo hoặc login thành công
  if (action.type === "@@INIT" || action.type === "auth/authSuccess") {
    const technician = localStorage.getItem("technician");
    if (technician) {
      store.dispatch({
        type: "auth/setTechnician",
        payload: JSON.parse(technician),
      });
    }
  }

  return next(action);
};