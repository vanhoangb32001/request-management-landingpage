import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/ticketApi";

const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(auth.getToken() ? "/dashboard" : "/login", { replace: true });
  }, [navigate]);
  return null;
};

export default Index;
