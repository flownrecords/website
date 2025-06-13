import { Link } from "react-router-dom";
import { useState } from "react";


export default function Navbar() {
  const [mobileMenu, toggleMobileMenu] = useState(false);

  return (
    <>
        <nav className="bg-secondary px-4 py-2 m-4 rounded-lg ring-2 ring-white/25">

          <div className="hidden md:flex container mx-auto justify-between items-center">
              <div className="flex space-x-4 items-center">

                <Link to="/" className="text-lg font-semibold">Flown Records</Link>

                <ul className="flex space-x-6 mx-10">
                  <li><Link to="/" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">Home</Link></li>
                  <li><Link to="/q&a" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">Questions</Link></li>
                  <li><Link to="/about" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">About Us</Link></li>
                </ul>
              </div>

              <div>
                <ul className="flex space-x-4">
                  <li><Link to="/login" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">Login</Link></li>
                </ul>
              </div>
          </div>

          <div className="flex md:hidden container mx-auto justify-between items-center">
            <Link to="/" className="text-lg font-semibold">Flown Records</Link>

            <button 
            className="cursor-pointer text-white focus:outline-none hover:opacity-75 transition duration-150" 
            onClick={() => toggleMobileMenu(!mobileMenu)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>

        </nav>

        { mobileMenu && 
        <div className="block md:hidden p-4 m-4 bg-secondary rounded-lg ring-2 ring-white/25">
          <ul className="container mx-auto flex flex-col space-y-4">
            <li><Link to="/" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">Home</Link></li>
            <li><Link to="/q&a" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">Questions</Link></li>
            <li><Link to="/about" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">About Us</Link></li>
            <li><Link to="/login" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">Login</Link></li>
          </ul>
        </div>
        }
    </>
  );
}