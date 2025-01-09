import { Link } from "react-router-dom";

const NavLogo = () => {
  return (
    <Link to="/sales" className="flex flex-col md:flex-row items-center">
      <img 
        src="/lovable-uploads/46d09936-801a-49ed-b585-95bccf81c0c8.png" 
        alt="ŽIR-MD COMPANY Logo" 
        className="h-12 w-auto md:h-16 md:mr-2 animate-[scale-in_0.2s_ease-out]"
      />
    </Link>
  );
};

export default NavLogo;