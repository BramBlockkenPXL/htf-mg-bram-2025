export const fetchDivingCenters = async () => {
  try {
    const response = await fetch("http://localhost:5555/api/diving-centers");
    if (!response.ok) {
      console.error(`[fetchDivingCenters] Failed: ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("[fetchDivingCenters] Exception:", err);
    return [];
  }
};
