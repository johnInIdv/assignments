const migrationDataPromise = d3.csv('../data/un-migration/Table 1-Table 1.csv', parseMigrationData)
	.then(data => data.reduce((acc,v) => acc.concat(v), []));
const countryCodePromise = d3.csv('../data/un-migration/ANNEX-Table 1.csv', parseCountryCode)
	.then(data => new Map(data));
const metadataPromise = d3.csv('../data/country-metadata.csv', parseMetadata);


//Import all data via parallel promises
Promise.all([
		migrationDataPromise,
		countryCodePromise,
		metadataPromise
	]).then(([migration, countryCode, metadata]) => {

		//DATA MANIPULATION

		//Convert metadata to a metadata map
		const metadata_tmp = metadata.map(d => {
				return [d.iso_num, d]
			});
		const metadataMap = new Map(metadata_tmp);
console.log(metadataMap);

		//Let's pick a year, say 2000, and filter the migration data
		const migration_2000 = migration.filter(d => d.year === 2000);
console.log(migration_2000);

		//YOUR CODE HERE
		//Then sum up the total value, using either nest.rollup or array.map
		let migration_origin_by_country = d3.nest()//COMPLETE HERE
			.key(d => { return d.origin_name; })
			.rollup(function(v) { return d3.sum(v, function(d) { return d.value; })})
			.entries(migration_2000);

console.log(migration_origin_by_country);

		//YOUR CODE HERE
		//Then, join the transformed migration data to the lngLat values in the metadata
		const combinedData = migration_origin_by_country.map(d => {
	    //combine via 3-digit code
	    let code = countryCode.get(d.key);
			// console.log(code);
	    let metadata = metadataMap.get(code);
			// console.log(metadata);
	    if (metadata) {
				return{
				 	lngLat: metadata.lngLat,
		      subregion: metadata.subregion,
		      name_display: metadata.name_display,
		      iso_a3: metadata.iso_a3
				}
	    } else {
	      // console.log(`${d.key} code ${code} not found`);
	    }
	  })

	console.log(combinedData);

		//REPRESENT
		drawCartogram(d3.select('.cartogram').node(), migration_origin_by_country);

	})

//YOUR CODE HERE
//Complete the drawCartogram function
//Some of the functions related to geographic representation have already been implemented, so feel free to use them
function drawCartogram(rootDom, data){

	//measure the width and height of the rootDom element
	const w = rootDom.clientWidth;
	const h = rootDom.clientHeight;

	//projection function: takes [lng, lat] pair and returns [x, y] coordinates
	const projection = d3.geoMercator()
		.translate([w/2, h/2]);

	//Scaling function for the size of the cartogram symbols
	//Assuming the symbols are circles, we use a square root scale
	const scaleSize = d3.scaleSqrt().domain([0,1000000]).range([5,50]);

	//Complete the rest of the code here
	//Build the DOM structure using enter / exit / update

	const svg = d3.select(rootDom)
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .append('g');

	//UPDATE SELECTION
		const nodes = svg.selectAll('.node')
			.data(data, d => d.key);
		nodes.select('circle')
			//.transition()
			.style('fill','green'); //circles in the UPDATE selection are black; note the use of .transition

		//ENTER SELECTION
		const nodesEnter = nodes.enter()
			.append('g').attr('class', 'node');
		nodesEnter.append('circle')
			.style('fill', 'yellow'); //circles in the ENTER selection are colored differently
		nodesEnter.append('text')
			.attr('text-anchor', 'middle');

		nodes.merge(nodesEnter)
		.filter(d => d.lngLat)
		.attr('transform', d => {
			let xy = scaleSize(projection(d.lngLat));
			return `translate(${xy[0]}, ${xy[1]})`;
			console.log(xy);
		})

		nodes.merge(nodesEnter)
		.select('circle')
		.attr('r', d => scaleSize(d.value))
		.style('fill-opacity', .03)
		.style('fill', function (d) {
		return "rgb(0, 0, " + (Math.round(d * 200)) + ")";
	})
		.style('stroke', 'red')
		.style('stroke-width', '1px')
		.style('stroke-opacity', .2)

		nodes.merge(nodesEnter)
		.select('text')
		.filter(d => d.value > 1000000)
		.text(d => d.name_display)
		.style('font-family', 'sans-serif')
		.style('font-size', '10px');

		//EXIT SELECTION
		nodes.exit()
			.select('circle')
			.style('fill','red');
	}


//Utility functions for parsing metadata, migration data, and country code
function parseMetadata(d){
	return {
		iso_a3: d.ISO_A3,
		iso_num: d.ISO_num,
		developed_or_developing: d.developed_or_developing,
		region: d.region,
		subregion: d.subregion,
		name_formal: d.name_formal,
		name_display: d.name_display,
		lngLat: [+d.lng, +d.lat]
	}
}

function parseCountryCode(d){
	return [
		d['Region, subregion, country or area'],
		d.Code
	]
}

function parseMigrationData(d){
	if(+d.Code >= 900) return;

	const migrationFlows = [];
	const dest_name = d['Major area, region, country or area of destination'];
	const year = +d.Year

	delete d.Year;
	delete d['Sort order'];
	delete d['Major area, region, country or area of destination'];
	delete d.Notes;
	delete d.Code;
	delete d['Type of data (a)'];
	delete d.Total;

	for(let key in d){
		const origin_name = key;
		const value = d[key];

		if(value !== '..'){
			migrationFlows.push({
				origin_name,
				dest_name,
				year,
				value: +value.replace(/,/g, '')
			})
		}
	}

	return migrationFlows;
}
