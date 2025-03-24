
import { Link } from "react-router-dom";

const NavLogo = () => {
  return (
    <Link to="/sales" className="flex items-center gap-2">
      <img 
        src="/lovable-uploads/46d09936-801a-49ed-b585-95bccf81c0c8.png" 
        alt="ŽIR-MD COMPANY Logo" 
        className="h-10 w-auto animate-[scale-in_0.2s_ease-out]"
      />
      <span className="font-semibold text-lg hidden sm:inline-block">ŽIR-MD COMPANY</span>
    </Link>
  );
};

export default NavLogo;
