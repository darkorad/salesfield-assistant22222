import { Link } from "react-router-dom";

const NavLogo = () => {
  return (
    <Link to="/sales" className="flex items-center">
      <img 
        src="/lovable-uploads/46d09936-801a-49ed-b585-95bccf81c0c8.png" 
        alt="ŽIR-MD COMPANY Logo" 
        className="h-16 w-auto mr-2 animate-[scale-in_0.2s_ease-out]"
      />
      <span className="font-semibold text-gray-900 text-xl">
        ZIR-MD COMPANY
      </span>
    </Link>
  );
};

export default NavLogo;