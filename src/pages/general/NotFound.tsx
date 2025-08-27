import Button from "../../components/general/Button";
import Splash from "../../components/general/Splash";

export default function NotFound() {
    return (
        <>
            <Splash title="Page Not Found" uppertext="The page you are looking for does not exist." />
            <div className="flex justify-center">
                <Button to="/" text="Go to Home" />
            </div>
        </>
    );
}
