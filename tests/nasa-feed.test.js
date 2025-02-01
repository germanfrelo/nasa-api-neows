/* eslint-env node */

const { addDays } = require("date-fns");

function getDate(d = new Date()) {
	return d.toJSON().split("T")[0];
}

async function fetchData(url) {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Request failed with status code ${response.status}`);
	}

	return response.json();
}

// Tests the structure of the JSON to ensure it matches expectations
async function test() {
	const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${getDate()}&api_key=DEMO_KEY`;

	try {
		const data = await fetchData(url);
		const day = getDate(addDays(new Date(), 1));

		let dayData = null;
		try {
			dayData = data.near_earth_objects[day];
		} catch (e) {
			throw new Error(
				"Unexpected data structure, was looking for :root.near_earth_objects[array]",
			);
		}

		if (!dayData) {
			throw new Error("Missing any day for tomorrow");
		}

		const first = dayData[0];
		if (typeof first.is_potentially_hazardous_asteroid === "undefined") {
			throw new Error(
				'Missing key "is_potentially_hazardous_asteroid" from first data point, presuming remaining data is wrong.',
			);
		}
	} catch (error) {
		console.log(`Failed: ${error.message}`);
		process.exit(1);
	}
}

test();
