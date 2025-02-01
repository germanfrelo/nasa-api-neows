import format from "date-fns/format";
import formatNumber from "format-number";

const formatter = formatNumber({
	integerSeparator: "\u00A0",
	decimal: ",",
	round: 0,
});

export default function Passing({ data }) {
	return data.map((_, i) => (
		<p key={i}>
			Misses {_.orbiting_body} tomorrow at{" "}
			{format(_.epoch_date_close_approach, "HH:mm")} by{" "}
			{formatter(_.miss_distance.kilometers)}
			&nbsp;km whilst travelling at{" "}
			{formatter(_.relative_velocity.kilometers_per_hour)}
			{"\u00A0"}
			km/h
		</p>
	));
}
