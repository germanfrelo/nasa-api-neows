import addDays from "date-fns/addDays";
import format from "date-fns/format";
import { useEffect } from "react";
import { useAsync } from "react-async-hook";
import Orbital from "./Orbital";

function getDate(d = new Date()) {
	return d.toJSON().split("T")[0];
}

const fetchData = () =>
	fetch(
		`https://api.nasa.gov/neo/rest/v1/feed?start_date=${getDate()}&api_key=DEMO_KEY`,
	).then((res) => res.json());

export default function App() {
	const data = useAsync(fetchData, []);

	// Handle document.title updates correctly
	useEffect(() => {
		if (data.loading) {
			document.title = "Counting potential earth HAZARDS…";
		} else if (data.result) {
			const day = getDate(addDays(new Date(), 1));

			if (data.result.near_earth_objects?.[day]) {
				const hazards = data.result.near_earth_objects[day].reduce(
					(acc, curr) =>
						curr.is_potentially_hazardous_asteroid ? acc + 1 : acc,
					0,
				);
				document.title = `${hazards} potential HAZARDS ${hazards > 0 ? "😱" : "👍"}`;
			}
		}
	}, [data.loading, data.result]);

	// Handle loading state
	if (data.loading) {
		return (
			<p>
				Getting data from NASA right now to check whether something from space
				is going to hit us. One moment…
			</p>
		);
	}

	const day = getDate(addDays(new Date(), 1));

	// Ensure `near_earth_objects` exists before accessing it
	if (!data.result?.near_earth_objects?.[day]) {
		return <p>No data available for the selected date.</p>;
	}

	const results = data.result.near_earth_objects[day];

	return (
		<div>
			<p>
				{format(addDays(new Date(), 1), "EEEE d-MMM")} there will be{" "}
				<strong>{results.length}</strong> near misses
			</p>
			<hr />
			{results
				.sort((a) => (a.is_potentially_hazardous_asteroid ? -1 : 1))
				.map((data) => (
					<Orbital
						key={data.id}
						{...data}
					/>
				))}
		</div>
	);
}
