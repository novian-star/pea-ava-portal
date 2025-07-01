const serviceNames = [
	'N1',
	'N2',
	'N3',
	'NE1',
	'NE2',
	'NE3',
	'C1',
	'C2',
	'C3',
	'S1',
	'S2',
	'S3',
];

export function Home() {
	const services = serviceNames.map((service) => {
		return {
			name: service,
			url: process.env[service],
		};
	});

	return (
		<>
			<ul>
				{services.map((service) => (
					<li>
						<a href={service.url} target="_blank" rel="noopener noreferrer">
							{service.name}
						</a>
					</li>
				))}
			</ul>
			<div>
				<button>
					<a href="/auth/logout">Log out</a>
				</button>
			</div>
		</>
	);
}
