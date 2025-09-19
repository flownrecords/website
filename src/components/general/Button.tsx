import { Link } from "react-router-dom";

type ButtonProps = {
    text?: string | React.ReactNode;
    to?: string;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
    type?: "button" | "submit" | "reset";
    styleType?: "normal" | "small";
    disabled?: boolean;
};

function alertIfDisabled() {
    console.warn("Button is disabled, no action will be performed.");
}

const Button: React.FC<ButtonProps> = ({
    disabled = false,
    text = "Click me",
    to,
    className = "",
    onClick,
    type = "button",
    styleType = "normal",
}) => {
    const style = `
    ${disabled ? "opacity-50" : "hover:opacity-75"}
    ${disabled ? "cursor-default" : "cursor-pointer"}

    ${className}

    ${styleType === "small" ? "md:text-sm" : "text-base"}
    ${styleType === "small" ? "py-2 md:py-1" : ""}

    inline-block
    bg-gradient-to-t 
    from-neutral-900 to-neutral-800 
    transition duration-150
    text-white
    py-1 md:py-2 px-4 md:px-6 
    rounded-lg text-center
    ring-2 ring-white/25 
  `;

    return to && !disabled ? (
        <Link to={to} onClick={onClick} className={style}>
            {text}
        </Link>
    ) : (
        <button onClick={disabled ? alertIfDisabled : onClick} className={style} type={type}>
            {text}
        </button>
    );
};

export default Button;
