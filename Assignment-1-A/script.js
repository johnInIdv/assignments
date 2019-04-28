//You'll show messages in the console using console.log
console.log("Week-1 part-3:safasdfas data structures");
//Let's start with an array of objects, representing a selection of US cities
const data = [
  {"city":"seattle", "state":"WA", "population":652405, "land_area":83.9},
  {"city":"new york", "state":"NY", "population":8405837, "land_area":302.6},
  {"city":"boston", "state":"MA", "population":645966, "land_area":48.3},
  {"city":"kansas city", "state":"MO", "population":467007, "land_area":315}
];

//Complete the following exercises by following the prompts
console.log(data);
//#1
//Using array.forEach, print out (using console.log) the names of the 4 cities, followed by their population.
//The message should have the following sample format
//"seattle, WA has a population of 652405"
data.forEach(function(d){
	//YOUR CODE HERE
  console.log(`${d.city},${d.state} has a population of ${d.population}`);
});

//#2
//Using array.forEach to sum up the populations of the 4 cities
//and print out the average population of the 4 cities
let pop = 0;

data.forEach(function(d){
	//YOUR CODE HERE
  pop += d.population;
});

let sum = pop/data.length;
  console.log(sum);

//#3
//Sort these 4 cities in terms of land area, from highest to lowest
//And print out the name of the city with the largest land area
//Hint: use array.sort
data.sort(function(a,b) {
  return b.land_area - a.land_area;
});
console.log(JSON.stringify(data[0].city));

//#4
//Using array.map, compute the population density of these 4 cities (population divided by area)
//add population density as a property to each object, and return the array
var cities = data.map(function(d,i) {

  return {
    city: d.city,
    state: d.state,
    population: d.population,
    land_area: d.land_area,
    population_density: d.population/d.land_area
  };
});
// console.log(data[0]);
console.log(cities);

//#5
//Using array.filter, return a subset of the cities with a population <1 million
const smallCities = data.filter(d => d.population < 1000000);
console.log(smallCities);
