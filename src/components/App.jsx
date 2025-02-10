import { addDays, format } from "date-fns"; // Import date manipulation functions
import { useEffect, useState } from "react"; // Import React hooks for state and side effects
import Orbital from "./Orbital"; // Import the Orbital component

// Function to get the current date in YYYY-MM-DD format
function getDate(d = new Date()) {
	return d.toJSON().split("T")[0];
}

// Asynchronous function to fetch data from the NASA NeoWs API
const fetchData = async () => {
	try {
		const response = await fetch(
			`https://api.nasa.gov/neo/rest/v1/feed?start_date=${getDate()}&api_key=DEMO_KEY`, // Construct the API URL with the CURRENT date
		);
		if (!response.ok) {
			throw new Error("Failed to fetch data"); // Throw an error if the response is not OK
		}
		return await response.json(); // Parse the response as JSON
	} catch (error) {
		console.error("Error fetching data:", error);
		return null; // Return null in case of an error to prevent app crashes
	}
};

export default function App() {
	const [data, setData] = useState(null); // State to store the fetched data, initialized to null
	const [loading, setLoading] = useState(true); // State to track the loading state, initialized to true

	// useEffect hook to fetch data when the component mounts
	useEffect(() => {
		fetchData()
			.then((result) => setData(result)) // Set the data state with the fetched data
			.catch(() => setData(null)) // Set data to null if the fetch fails
			.finally(() => setLoading(false)); // Set loading to false regardless of success or failure
	}, []); // Empty dependency array ensures this runs only once on mount

	// useEffect hook to update the document title based on the data and loading state
	useEffect(() => {
		if (loading) {
			document.title = "Counting potential earth HAZARDS…"; // Display a loading message in the title
		} else if (data && data.near_earth_objects) {
			const tomorrow = getDate(addDays(new Date(), 1)); // Get the date for TOMORROW
			const hazards =
				data.near_earth_objects[tomorrow]?.filter(
					// Filter the asteroids for potentially hazardous ones for TOMORROW
					(obj) => obj.is_potentially_hazardous_asteroid,
				).length || 0; // Get the number of hazardous asteroids
			document.title = `${hazards} potential HAZARDS ${hazards > 0 ? "😱" : "👍"}`; // Update the title with the number of hazards
		} else {
			document.title = "Error fetching asteroid data 🚨"; // Display an error message in the title
		}
	}, [loading, data]); // This effect runs when loading or data state changes

	if (loading) {
		return (
			<p>
				Getting data from NASA right now to check whether something from space
				is going to hit us. One moment…
			</p> // Display a loading message
		);
	}

	const tomorrow = getDate(addDays(new Date(), 1)); // Get the date for TOMORROW
	const results = data?.near_earth_objects?.[tomorrow] || []; // Get the asteroid data for TOMORROW, or an empty array if no data is available

	if (!results.length) {
		return <p>No data available for the selected date.</p>; // Display a message if no data is available
	}

	return (
		<div>
			<p>
				{format(addDays(new Date(), 1), "EEEE d-MMM")} there will be{" "}
				<strong>{results.length}</strong> near misses // Display the date
				(TOMORROW) and number of near misses
			</p>
			<hr />
			{results
				.sort(
					// Sort the asteroids by hazardous status (hazardous first)
					(a, b) =>
						b.is_potentially_hazardous_asteroid -
						a.is_potentially_hazardous_asteroid,
				)
				.map((data) => (
					<Orbital // Render the Orbital component for each asteroid
						key={data.id} // Use the asteroid ID as the key
						{...data} // Spread the asteroid data as props to the Orbital component
					/>
				))}
		</div>
	);
}
