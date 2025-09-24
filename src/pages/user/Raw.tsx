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
  const { profilePictureUrl, ...rest } = user || {};
  const parsed = { ...rest };
  const json = JSON.stringify(parsed, null, 2);

  return (
    <pre
      className="p-4 m-4 bg-secondary overflow-x-auto rounded-lg"
      style={{ color: "#ccc" }}
      dangerouslySetInnerHTML={{ __html: syntaxHighlight(json) }}
    />
  );
}
