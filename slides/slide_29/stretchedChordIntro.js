pt.stretchedChordIntro = pt.stretchedChordIntro || {};

pt.stretchedChordIntro.init = function() {
	
	//Remove any existing svgs
	d3.select('#intro-stretched-chord #stretchedChordIntro svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 10,
		right: 0,
		bottom: 10,
		left: 0
	};
	var width = $(".slides").width()*0.75 - margin.left - margin.right;
	var height = $(".slides").height()*0.75 - margin.top - margin.bottom;
				
	//SVG container
	pt.stretchedChordIntro.svg = d3.select('#intro-stretched-chord #stretchedChordIntro')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.stretchedChordIntro.svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
	///////////////////////////////////////////////////////////////////////////
	/////////////////////// Calculate hexagon variables ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var SQRT3 = Math.sqrt(3),
		hexRadius = Math.min(width, height)/2, 
		hexWidth = SQRT3 * hexRadius,
		hexHeight = 2 * hexRadius;
	var hexagonPoly = [[0,-1],[SQRT3/2,0.5],[0,1],[-SQRT3/2,0.5],[-SQRT3/2,-0.5],[0,-1],[SQRT3/2,-0.5]];
	var hexagonPath = "m" + hexagonPoly.map(function(p){ return [p[0]*hexRadius, p[1]*hexRadius].join(','); }).join('l') + "z";

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create gradient /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var defs = svg.append("defs");
	var linearGradient = defs.append("linearGradient")
		.attr("gradientUnits", "userSpaceOnUse")
	.attr("id","stretchedChordIntroID"); //Make filter truly uniue id in entire script
	
	//Safari has a bug and can't handle spreadMethod reflect, thus create something that optically looks like it's going on idefinitely
	if(is_safari) {
		linearGradient.attr("x1","-75%")
			.attr("y1","0%")
			.attr("x2","25%")
			.attr("y2","0%");
	
		linearGradient.selectAll(".stop")
			.data([
				{offset: 0, color: "#C64277"},
				{offset: 0.083, color: "#E36172"},
				{offset: 0.166, color: "#FC8669"},
				{offset: 0.25, color: "#FDA860"},
				{offset: 0.33, color: "#FC8669"},
				{offset: 0.417, color: "#E36172"},
				{offset: 0.5, color: "#C64277"},
				{offset: 0.583, color: "#E36172"},
				{offset: 0.66, color: "#FC8669"},
				{offset: 0.75, color: "#FDA860"},
				{offset: 0.83, color: "#FC8669"},
				{offset: 0.916, color: "#E36172"},
				{offset: 1, color: "#C64277"},
			])
			.enter().append("stop")
			.attr("offset", function(d) { return d.offset; })
			.attr("stop-color", function(d) { return d.color; });

		linearGradient.append("animate")
			.attr("attributeName","x1")
			.attr("values","-75%;-25%")
			.attr("dur","7s")
			.attr("repeatCount","indefinite");

		linearGradient.append("animate")
			.attr("attributeName","x2")
			.attr("values","25%;75%")
			.attr("dur","7s")
			.attr("repeatCount","indefinite");
	} else {
		//Although Chrome and Firefox would also work with the code above
		//I wanted to show the shorter method for when reflect does work
		linearGradient.attr("x1","0%")
			.attr("y1","0%")
			.attr("x2","100%")
			.attr("y2","0%")
			.attr("spreadMethod", "reflect");

		linearGradient.selectAll(".stop")
			.data([
				{offset: 0, color: "#C64277"},
				{offset: 0.167, color: "#E36172"},
				{offset: 0.33, color: "#FC8669"},
				{offset: 0.5, color: "#FDA860"},
				{offset: 0.66, color: "#FC8669"},
				{offset: 0.833, color: "#E36172"},
				{offset: 1, color: "#C64277"},
			])
			.enter().append("stop")
			.attr("offset", function(d) { return d.offset; })
			.attr("stop-color", function(d) { return d.color; });

		linearGradient.append("animate")
			.attr("attributeName","x1")
			.attr("values","0%;100%")
			.attr("dur","7s")
			.attr("repeatCount","indefinite");

		linearGradient.append("animate")
			.attr("attributeName","x2")
			.attr("values","100%;200%")
			.attr("dur","7s")
			.attr("repeatCount","indefinite");		
	}//else
	
	//Create a clip path that is the same as the top hexagon
	defs.append("clipPath")
        .attr("id", "clip")
        .append("path")
        .attr("d", "M" + (width/2) + "," + (height/2) + hexagonPath);
		
	////////////////////////////////////////////////////////////
	//////////////////// Chord variables ///////////////////////
	////////////////////////////////////////////////////////////

	var innerRadius = hexWidth/2,
		outerRadius = innerRadius/0.95,
		pullOutSize = 100,
		opacityDefault = 0.7;
	
	var Names = ["X","Y","Z","","C","B","A",""];	

	////////////////////////////////////////////////////////////
	////////////////////////// Data ////////////////////////////
	////////////////////////////////////////////////////////////

	var respondents = 95, //Total number of respondents (i.e. the number that makes up the group)
		emptyPerc = 0.2, //What % of the circle should become empty in comparison to the visible arcs
		emptyStroke = Math.round(respondents*emptyPerc); //How many "units" would define this empty percentage
	var matrix = [
		[0,0,0,0,10,5,15,0], //X
		[0,0,0,0,5,15,20,0], //Y
		[0,0,0,0,15,5,5,0], //Z
		[0,0,0,0,0,0,0,emptyStroke], //Dummy stroke
		[10,5,15,0,0,0,0,0], //C
		[5,15,5,0,0,0,0,0], //B
		[15,20,5,0,0,0,0,0], //A
		[0,0,0,emptyStroke,0,0,0,0] //Dummy stroke
	];
	//Calculate how far the Chord Diagram needs to be rotated clockwise
	//to make the dummy invisible chord center vertically
	var offset = Math.PI * (emptyStroke/(respondents + emptyStroke)) / 2;

	////////////////////////////////////////////////////////////
	///////////////////// Layout set-up ////////////////////////
	////////////////////////////////////////////////////////////

	//Include the offset in de start and end angle to rotate the Chord diagram clockwise
	function startAngle(d) { return d.startAngle + offset; }
	function endAngle(d) { return d.endAngle + offset; }

	//Custom sort function of the chords to keep them in the original order
	var chord = pt.stretchedChord.customChordLayout() //d3.layout.chord()//Custom sort function of the chords to keep them in the original order
		.padding(.02)
		.sortChords(d3.descending) //which chord should be shown on top when chords cross. Now the biggest chord is at the bottom
		.matrix(matrix);

	var path = pt.stretchedChord.stretchedChord() //replaced d3.svg.chord() with the custom chord function
		.radius(innerRadius)
		.startAngle(startAngle)
		.endAngle(endAngle)
		.pullOutSize(pullOutSize);
		
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Place the chords /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //First append a group for the clip path, then a new group that can be transformed
	var chordWrapper = svg.append("g")
		.attr("clip-path", "url(#clip")
		.style("clip-path", "url(#clip)") //make it work in safari
		.append("g")
		.attr("transform", "translate(" + (width/2) + "," + (height/2) + ")");

	var chords = chordWrapper.selectAll("path.chord")
		.data(chord.chords)
		.enter().append("path")
		.attr("class", "chord")
		.style("stroke", "none")
		.style("fill", "url(#stretchedChordIntroID)")
		.style("opacity", function(d) { return (Names[d.source.index] === "" ? 0 : opacityDefault); }) //Make the dummy strokes have a zero opacity (invisible)
		.attr("d", path);

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Place Hexagon in center /////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Place a hexagon on the scene
	svg.append("path")
		.attr("class", "hexagon")
		.attr("d", "M" + (width/2) + "," + (height/2) + hexagonPath)
		.style("stroke", "#E36172")
		.style("stroke-width", "7px")
		.style("fill", "none");

}//init
