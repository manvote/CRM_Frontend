import { Outlet } from 'react-router-dom';
import loginCards from '../assets/login cards.png';
import manovateLogo from '../assets/manovate.svg';

const AuthLayout = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 font-sans bg-gray-50">
      <div className="flex w-full max-w-[1100px] min-h-[600px] overflow-hidden bg-white shadow-xl rounded-[2rem]">
        
        {/* Left Panel: Form & Logo */}
        <div className="flex flex-col w-full p-8 lg:w-1/2">
          {/* Logo */}
          <div className="flex justify-center w-full mb-8 lg:mb-0">
             <img 
                src={manovateLogo} 
                alt="Manovate Technologies" 
                className="object-contain h-16" 
            />
          </div>

          {/* Form Outlet */}
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <Outlet />
          </div>
        </div>

        {/* Right Panel: Illustration Only */}
        <div className="hidden relative lg:flex lg:w-1/2 items-center justify-center bg-blue-50">
            <img 
                src={loginCards} 
                alt="Team Collaboration" 
                className="w-full h-full object-cover" 
            />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
