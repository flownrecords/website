import { Link } from "react-router-dom";

export default function Button({
    text = "Click me",
    to = "#",
    className = "",
    onClick = () => {},
}) {
    return (
    <Link
        to={to}
        className={`
          ${className} 
          inline-block
          cursor-pointer bg-gradient-to-t 
          from-neutral-900 to-neutral-800 
          hover:opacity-75 transition duration-150
          text-white
          py-2 px-6 
          rounded-md text-center
          ring-2 ring-white/25 
        `}
        onClick={onClick}
    >
      {text}
    </Link>
  );
}