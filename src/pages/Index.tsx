import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to sales page when landing on the index
    navigate("/sales");
  }, [navigate]);

  return null;
};

export default Index;