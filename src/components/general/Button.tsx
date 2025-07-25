import { Link } from "react-router-dom";

type ButtonProps = {
    text?: string;
    to?: string;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
    type?: "button" | "submit" | "reset";
    styleType?: "normal" | "small";
};

const Button: React.FC<ButtonProps> = ({
    text = "Click me",
    to,
    className = "",
    onClick,
    type = "button",
    styleType = "normal",
}) => {
    const style = `
    ${className}
    ${styleType === "small" ? "text-sm" : "text-base"}
    ${styleType === "small" ? "py-1" : ""}
    inline-block
    cursor-pointer bg-gradient-to-t 
    from-neutral-900 to-neutral-800 
    hover:opacity-75 transition duration-150
    text-white
    py-1 md:py-2 px-4 md:px-6 
    rounded-lg text-center
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
