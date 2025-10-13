import { useCallback, useState } from "react";
import Button from "../../components/general/Button";
import Splash from "../../components/general/Splash";

const convertDMSToDecimal = (deg: number, min: number, sec: number, dir: string) => {
    // Basic validation
    if (isNaN(deg) || isNaN(min) || isNaN(sec) || deg < 0 || min < 0 || sec < 0 || min >= 60 || sec >= 60) {
        return null;
    }

    let decimal = deg + (min / 60) + (sec / 3600);

    // Apply sign for South (S) or West (W)
    if (dir === 'S' || dir === 'W') {
        decimal = -decimal;
    }

    // Format to 6 decimal places for precision
    return parseFloat(decimal.toFixed(6));
};

/**
 * Parser 1: Handles flexible DMS format (e.g., "40 44 55 N").
 * @param {string} dmsString - The DMS string for one coordinate (Lat or Long).
 * @returns {{deg: number, min: number, sec: number, dir: string} | null} The extracted components.
 */
const parseSingleFlexibleDMS = (dmsString: string) => {
    // Regex to capture Degrees, Minutes, Seconds, and Direction, handling various separators.
    const regex = /(\d+)[^\d\w]*(\d+)[^\d\w]*([\d.]+)[^\d\w]*([NnSsEeWw])/;
    const match = dmsString.trim().match(regex);

    if (!match) return null;

    return {
        deg: parseFloat(match[1]),
        min: parseFloat(match[2]),
        sec: parseFloat(match[3]),
        dir: match[4].toUpperCase(),
    };
};

/**
 * Wrapper for flexible DMS pair conversion.
 * @param {string} latLongString - Input string containing both coordinates, separated by comma.
 * @returns {{lat: number, long: number} | null} The resulting coordinate object or null on failure.
 */
const parseFlexibleDMSPair = (latLongString: string) => {
    const parts = latLongString.split(/[,;]/).map(p => p.trim()).filter(p => p.length > 0);

    if (parts.length < 2) return null;

    // Identify Lat and Long parts based on direction letter
    let latPart = parts.find(p => p.toUpperCase().includes('N') || p.toUpperCase().includes('S'));
    let longPart = parts.find(p => p.toUpperCase().includes('E') || p.toUpperCase().includes('W'));

    if (!latPart || !longPart) return null;

    const latComponents = parseSingleFlexibleDMS(latPart);
    const longComponents = parseSingleFlexibleDMS(longPart);

    if (!latComponents || !longComponents) return null;

    const latDecimal = convertDMSToDecimal(latComponents.deg, latComponents.min, latComponents.sec, latComponents.dir);
    const longDecimal = convertDMSToDecimal(longComponents.deg, longComponents.min, longComponents.sec, longComponents.dir);

    if (latDecimal === null || longDecimal === null) return null;

    return { lat: latDecimal, long: longDecimal };
};

/**
 * Parser 2: Handles concatenated DMS format (e.g., "372951N 0082302W").
 * @param {string} concatenatedString - Input string containing both coordinates separated by space.
 * @returns {{lat: number, long: number} | null} The resulting coordinate object or null on failure.
 */
const parseConcatenatedDMSPair = (concatenatedString: string) => {
    const parts = concatenatedString.trim().split(/\s+/).filter(p => p.length > 0);

    if (parts.length !== 2) return null;

    let latStr = parts.find(p => p.match(/[NnSs]$/));
    let longStr = parts.find(p => p.match(/[EeWw]$/));

    if (!latStr || !longStr) return null;

    // Lat (DDMMSS[N/S]) - Expects 6 digits + 1 direction
    const latMatch = latStr.match(/^(\d{2})(\d{2})(\d{2})([NnSs])$/);
    // Long (DDDMMSS[E/W]) - Expects 7 digits + 1 direction
    const longMatch = longStr.match(/^(\d{3})(\d{2})(\d{2})([EeWw])$/);

    if (!latMatch || !longMatch) return null;

    // Parse Latitude
    const latDeg = parseInt(latMatch[1], 10);
    const latMin = parseInt(latMatch[2], 10);
    const latSec = parseFloat(latMatch[3]);
    const latDir = latMatch[4].toUpperCase();
    const latDecimal = convertDMSToDecimal(latDeg, latMin, latSec, latDir);

    // Parse Longitude
    const longDeg = parseInt(longMatch[1], 10);
    const longMin = parseInt(longMatch[2], 10);
    const longSec = parseFloat(longMatch[3]);
    const longDir = longMatch[4].toUpperCase();
    const longDecimal = convertDMSToDecimal(longDeg, longMin, longSec, longDir);

    if (latDecimal === null || longDecimal === null) return null;

    return { lat: latDecimal, long: longDecimal };
};

export default function ChartBuilder() {
    const [dmsInput, setDmsInput] = useState('372951N 0082302W');
    const [resultOutput, setResultOutput] = useState('');
    const [conversionError, setConversionError] = useState('');

    const [waypointData, setWaypointData] = useState({
        id: 'RELVA',
        lat: '37.4975',
        long: '-8.38389',
        type: 'INT',
        display: 'true',
        output: '',
    });

    const handleConversion = useCallback((e: any) => {
        e.preventDefault();
        setConversionError('');
        setResultOutput('');

        if (!dmsInput.trim()) {
            setConversionError('Please enter coordinate strings.');
            return;
        }
        
        const trimmedInput = dmsInput.trim();

        // 1. Try Concatenated Parser (e.g., 372951N 0082302W)
        let coords = parseConcatenatedDMSPair(trimmedInput);

        // 2. If concatenated parsing failed, try Flexible Parser (e.g., 40 44 55 N, 73 59 11 W)
        if (!coords) {
            coords = parseFlexibleDMSPair(trimmedInput);
        }

        if (coords) {
            const resultString = `Lat: ${coords.lat}° / Long: ${coords.long}°`;
            setResultOutput(resultString);
            setConversionError('');
        } else {
            setConversionError('Invalid format. Please use DMS with separators OR the concatenated format (DDMMSSDir DDDMMSSDir).');
            setResultOutput('');
        }
    }, [dmsInput]);

    const handleWaypointChange = useCallback((e: any) => {
        const { name, value } = e.target;
        // Use an internal name mapping to simplify the object keys
        const keyMap = { 'ID': 'id', 'LAT': 'lat', 'LONG': 'long', 'TYPE': 'type', 'DISPLAY': 'display' };
        setWaypointData(prev => ({ 
            ...prev, 
            [keyMap[name as keyof typeof keyMap]]: value,
            // Clear previous output/error when input changes
            output: '', 
        }));
    }, []);

    const handleCreateWaypoint = useCallback((e: any) => {
        e.preventDefault();
        const { id, lat, long, type, display } = waypointData;
        
        // Simple validation
        if (!id || !lat || !long) {
            setWaypointData(prev => ({ ...prev, output: 'Error: ID, LAT, and LONG are required.', isError: true }));
            return;
        }

        // Format the CSV output line: ID,LAT,LONG,TYPE,DISPLAY
        const csvLine = `ID,LAT,LONG,TYPE,DISPLAY\n${id},${lat},${long},${type},${display}`;

        setWaypointData(prev => ({ ...prev, output: csvLine, isError: false }));
    }, [waypointData]);

    return (
        <>
            <Splash uppertext="Chart Builder" />

            <div className="container mx-auto max-w-6xl p-4 lg:px-0">
                <div className="grid grid-cols-3 gap-4">
                    <div className="ring-2 ring-white/25 rounded-lg p-4">
                        <h1 className="font-semibold text-white/75 mb-2">
                            Text Coordinate to Decimal
                        </h1>

                        <form onSubmit={handleConversion}>
                            <div className="mb-6">
                                <label htmlFor="latlong" className="block text-sm font-medium mb-2">
                                    DMS Strings
                                </label>
                                <input
                                    id="latlong"
                                    name="latlong"
                                    value={dmsInput}
                                    onChange={(e) => setDmsInput(e.target.value)}
                                    placeholder="e.g., 40 44 55 N, 73 59 11 W OR 372951N 0082302W"
                                    className="w-full px-4 py-2 bg-secondary ring-2 ring-white/25 rounded-lg text-white focus:ring-white/50 focus:outline-none transition duration-150"
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="latlong" className="block text-sm font-medium mb-2">
                                    Decimal Result
                                </label>
                                <input
                                    id="result"
                                    name="result"
                                    readOnly
                                    value={conversionError || resultOutput}
                                    className={`w-full px-4 py-2 rounded-lg text-white focus:ring-white/50 focus:outline-none transition duration-150 ${
                                        conversionError
                                        ? 'bg-red-900 text-red-300 ring-2 ring-red-500'
                                        : 'bg-secondary ring-2 ring-white/25'
                                    } focus:outline-none`}
                                />
                                {conversionError && (
                                    <p className="mt-2 text-sm text-red-400">
                                        Error: {conversionError}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-row">
                                <Button
                                    type="submit"
                                    text="Convert Coordinates"
                                    className="w-full"
                                />
                            </div>
                        </form>
                    </div>
                    <div className="col-span-2 ring-2 ring-white/25 rounded-lg p-4">
                        <form onSubmit={handleCreateWaypoint}>
                            <h1 className="font-semibold text-white/75 mb-2">
                                Create Waypoint (CSV)
                            </h1>
                            <div className="grid grid-cols-5 gap-4">
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2 bg-secondary ring-2 ring-white/25 rounded-lg text-white focus:ring-white/50 focus:outline-none transition duration-150" 
                                    name="ID" 
                                    placeholder="ID" 
                                    id="ID"
                                    value={waypointData.id}
                                    onChange={handleWaypointChange}
                                />
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 bg-secondary ring-2 ring-white/25 rounded-lg text-white focus:ring-white/50 focus:outline-none transition duration-150"
                                    name="LAT"
                                    placeholder="LAT"
                                    id="LAT"
                                    value={waypointData.lat}
                                    onChange={handleWaypointChange}
                                />
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 bg-secondary ring-2 ring-white/25 rounded-lg text-white focus:ring-white/50 focus:outline-none transition duration-150"
                                    name="LONG"
                                    placeholder="LONG"
                                    id="LONG"
                                    value={waypointData.long}
                                    onChange={handleWaypointChange}
                                />
                                <select
                                    className="w-full px-4 py-2 bg-secondary ring-2 ring-white/25 rounded-lg text-white focus:ring-white/50 focus:outline-none transition duration-150"
                                    name="TYPE"
                                    id="TYPE"
                                    defaultValue="INT"
                                    value={waypointData.type}
                                    onChange={handleWaypointChange}
                                >
                                    <option value="INT">INT</option>
                                    <option value="VOR">RNAV</option>
                                    <option value="NDB">NDB</option>
                                    <option value="VOR">VOR</option>
                                    <option value="DME">FIX</option>
                                </select>

                                <select 
                                    className="w-full px-4 py-2 bg-secondary ring-2 ring-white/25 rounded-lg text-white focus:ring-white/50 focus:outline-none transition duration-150"
                                    name="DISPLAY"
                                    id="DISPLAY"
                                    defaultValue="true"
                                    value={waypointData.display}
                                    onChange={handleWaypointChange}
                                >
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                </select>
                            </div>
                            <div className="mt-4">
                                <textarea
                                    readOnly
                                    value={waypointData.output}
                                    placeholder="ID,LAT,LONG,TYPE,DISPLAY"
                                    className={`w-full px-4 py-2 bg-secondary ring-2 ring-white/25 rounded-lg text-white focus:ring-white/50 focus:outline-none transition duration-150 resize-none ${
                                        waypointData.output.startsWith('Error')
                                        ? 'bg-red-900 text-red-300 ring-2 ring-red-500'
                                        : 'bg-gray-700 text-yellow-300 ring-2 ring-gray-600'
                                    }`}
                                />
                                {waypointData.output.startsWith('Error') && (
                                    <p className="mt-2 text-sm text-red-400">
                                        {waypointData.output}
                                    </p>
                                )}
                            </div>
                            <div className="mt-4 flex flex-row">
                                <Button

                                    type="submit"
                                    text="Create Waypoint"
                                    className="w-full"
                                />
                            </div>

                        </form>
                    </div>
                </div> 
            </div>
        </>
    )
}