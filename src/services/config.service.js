import axios from "axios";

export const getMasterStructureCodes = async () => {
  const res = await axios.get("/api/config/master-structure-codes");
  return res.data;
};
