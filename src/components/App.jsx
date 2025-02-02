import { addDays, format } from "date-fns";
import { useEffect, useState } from "react";
import Orbital from "./Orbital";

function getDate(d = new Date()) {
	return d.toJSON().split("T")[0];
}

const fetchData = async () => {
	const response = await fetch(
		`https://api.nasa.gov/neo/rest/v1/feed?start_date=${getDate()}&api_key=DEMO_KEY`,
	);
	return response.json();
};

export default function App() {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchData()
			.then((result) => setData(result))
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		if (loading) {
			document.title = "Counting potential earth HAZARDS…";
		} else if (data) {
			const day = getDate(addDays(new Date(), 1));
			const hazards =
				data.near_earth_objects?.[day]?.filter(
					(obj) => obj.is_potentially_hazardous_asteroid,
				).length || 0;
			document.title = `${hazards} potential HAZARDS ${hazards > 0 ? "😱" : "👍"}`;
		}
	}, [loading, data]);

	if (loading) {
		return (
			<p>
				Getting data from NASA right now to check whether something from space
				is going to hit us. One moment…
			</p>
		);
	}

	const day = getDate(addDays(new Date(), 1));
	const results = data?.near_earth_objects?.[day] || [];

	if (!results.length) {
		return <p>No data available for the selected date.</p>;
	}

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
