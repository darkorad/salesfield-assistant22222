import { Link } from "react-router-dom";

const NavLogo = () => {
  return (
    <Link to="/sales" className="flex flex-col md:flex-row items-center">
      <img 
        src="/lovable-uploads/46d09936-801a-49ed-b585-95bccf81c0c8.png" 
        alt="ŽIR-MD COMPANY Logo" 
        className="h-8 w-auto md:h-12 md:mr-2"
      />
    </Link>
  );
};

export default NavLogo;