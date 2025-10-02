import { useAuth } from "../../components/auth/AuthContext";

function syntaxHighlight(json: string) {
    return json.replace(
        /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d*)?([eE][+\-]?\d+)?)/g,
        (match) => {
        let cls = "number";
        if (/^"/.test(match)) {
            cls = /:$/.test(match) ? "key" : "string";
        } else if (/true|false/.test(match)) {
            cls = "boolean";
        } else if (/null/.test(match)) {
            cls = "null";
        }
        return `<span class="${cls}">${match}</span>`;
        }
    );
}

export default function Raw() {
    const { user } = useAuth();
    const { profilePictureUrl, passwordHash, ...rest } = user as any || {};
    const parsed = { ...rest };
    const json = JSON.stringify(parsed, null, 2);

    const PAGE_ENABLED = true;

    return (
        <>
            {
                user?.permissions?.includes("ADMIN") && PAGE_ENABLED ?
                (
                    <pre
                    className="p-4 m-4 bg-secondary overflow-x-auto rounded-lg"
                    style={{ color: "#ccc" }}
                    dangerouslySetInnerHTML={{ __html: syntaxHighlight(json) }}
                    />
                ) : (
                    <p className="text-center text-second-accent font-medium mt-10">You do not have permission to view this page.</p>
                )
            }
        </>
    );
}
