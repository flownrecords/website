import { Link } from "react-router-dom";

type ButtonProps = {
  text?: string;
  to?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  type?: "button" | "submit" | "reset";
};

const Button: React.FC<ButtonProps> = ({
  text = "Click me",
  to,
  className = "",
  onClick,
  type = "button",
}) => {
  const style = `
    ${className}
    inline-block
    cursor-pointer bg-gradient-to-t 
    from-neutral-900 to-neutral-800 
    hover:opacity-75 transition duration-150
    text-white
    py-2 px-6 
    rounded-md text-center
    ring-2 ring-white/25 
  `;

  return to ? (
    <Link to={to} onClick={onClick} className={style}>
      {text}
    </Link>
  ) : (
    <button onClick={onClick} className={style} type={type}>
      {text}
    </button>
  );
};

export default Button;