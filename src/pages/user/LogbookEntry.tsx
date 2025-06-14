import { useParams } from 'react-router-dom';

export default function LogbookEntry() {
    const { entryId } = useParams();
    return (
        <div>
            <h1>Logbook Entry</h1>
            <p>This is where you can view or create a logbook entry.</p>
            <p>Entry ID: {entryId}</p>
            {/* Add more logbook entry related content here */}
        </div>
    )
}