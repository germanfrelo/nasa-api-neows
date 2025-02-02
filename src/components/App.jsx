import { addDays, format } from "date-fns";
import { useEffect, useState } from "react";
import Orbital from "./Orbital";

function getDate(date = new Date()) {
	return date.toJSON().split("T")[0];
}

const fetchData = async () => {
	try {
		const response = await fetch(
			`https://api.nasa.gov/neo/rest/v1/feed?start_date=${getDate()}&api_key=DEMO_KEY`,
		);
		if (!response.ok) {
			throw new Error("Failed to fetch data");
		}
		return await response.json();
	} catch (error) {
		console.error("Error fetching data:", error);
		return null; // Returns 'null' in case of an error to prevent app crashes
	}
};

export default function App() {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	// Fetches data when the component mounts
	useEffect(() => {
		fetchData()
			.then((result) => setData(result))
			.catch(() => setData(null))
			.finally(() => setLoading(false));
	}, []); // Empty dependency array ensures this runs only once on mount

	// Updates the document title based on the data and loading state
	useEffect(() => {
		if (loading) {
			document.title = "Counting potential earth HAZARDS…";
		} else if (data && data.near_earth_objects) {
			// Get the date for tomorrow
			const day = getDate(addDays(new Date(), 1));
			// Get the number of hazardous asteroids
			const hazards =
				data.near_earth_objects[day]?.filter(
					(obj) => obj.is_potentially_hazardous_asteroid,
				).length || 0;
			// Update the title with the number of hazards
			document.title = `${hazards} potential HAZARDS ${hazards > 0 ? "😱" : "👍"}`;
		} else {
			document.title = "Error fetching asteroid data 🚨";
		}
	}, [loading, data]); // This effect runs when loading or data state changes

	// Display a loading message while fetching data
	if (loading) {
		return (
			<p>
				Getting data from NASA right now to check whether something from space
				is going to hit us. One moment…
			</p>
		);
	}

	const day = getDate(addDays(new Date(), 1)); // Get the date for tomorrow
	const results = data?.near_earth_objects?.[day] || []; // Get the asteroid data for tomorrow, or an empty array if no data is available

	if (!results.length) {
		return <p>No data available for the selected date.</p>; // Display a message if no data is available
	}

	return (
		<div>
			<p>
				{format(addDays(new Date(), 1), "EEEE d-MMM")} there will be{" "}
				<strong>{results.length}</strong> near misses // Display the date and
				number of near misses
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
					// Render the Orbital component for each asteroid
					<Orbital
						key={data.id}
						{...data}
					/>
				))}
		</div>
	);
}
