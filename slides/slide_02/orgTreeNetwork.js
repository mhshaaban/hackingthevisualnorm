pt.orgTreeNetwork = pt.orgTreeNetwork || {};

pt.orgTreeNetwork.init = function(graph) {
	
	//Remove any existing svgs
	d3.select('#org-tree-network #orgTreeNetwork svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	};
	pt.orgTreeNetwork.width = $(".slides").width()*0.9 - margin.left - margin.right;
	pt.orgTreeNetwork.height = $(".slides").height()*0.9 - margin.top - margin.bottom;
				
	//SVG container
	pt.orgTreeNetwork.svg = d3.select('#org-tree-network #orgTreeNetwork')
		.append("svg")
		.attr("width", pt.orgTreeNetwork.width + margin.left + margin.right)
		.attr("height", pt.orgTreeNetwork.height + margin.top + margin.bottom);
		
	var svg = pt.orgTreeNetwork.svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
	
	
	var showToolTip = function (d){
		//Define and show the tooltip
		$(this).popover({
			placement: 'auto top',
			container: 'body',
			trigger: 'manual',
			viewport:'#tooltip',
			html : true,
			content: function() { 
				return "<span style='font-size: 11px; text-align: center;'>" + d.name + "</span>"; }
		});
		
		
		$(this).popover('show');
		
	};
	
	var hideToolTip = function(){
		$('.popover').each(function() {
			$(this).remove();
		}); 
	};
	
	
	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Initialize force //////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

  var nodeColors = ["#EFB605", "#E47D06", "#DB0131", "#AF0158", "#7F378D", "#3465A8", "#0AA174", "#7EB852"];
  pt.orgTreeNetwork.nodeRadius = 6;

  pt.orgTreeNetwork.networkData = JSON.parse(JSON.stringify(graph));

pt.orgTreeNetwork.nodes = (pt.orgTreeNetwork.networkData.nodes);
  pt.orgTreeNetwork.links = (pt.orgTreeNetwork.networkData.links);

  pt.orgTreeNetwork.force = d3.layout.force()
      .size([pt.orgTreeNetwork.width, pt.orgTreeNetwork.height])
      .nodes(pt.orgTreeNetwork.nodes)
      .links(pt.orgTreeNetwork.links)

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Initialize containers /////////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //Create a wrapper for the network
    var networkWrapper = svg.append("g")
		  .attr("class", "networkWrapper");

 	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Initialize Links ////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //Container for all the links
    var linkWrapper = networkWrapper.append("g")
        .attr("class", "linkWrapper");

    //Create the link lines
    pt.orgTreeNetwork.link = linkWrapper.selectAll(".link")
        .data(pt.orgTreeNetwork.links)
      .enter().append("line")
        .attr("class", "link");

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Initialize Nodes /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //Container for all the links
    var nodeWrapper = networkWrapper.append("g")
        .attr("class", "nodeWrapper");

    //Create the node circles - first a wrapper for each node
    pt.orgTreeNetwork.node = nodeWrapper.selectAll(".node")
        .data(pt.orgTreeNetwork.nodes)
      .enter().append("circle")
        .attr("class", "node")
        .style("fill", function(d,i) { return nodeColors[i%(nodeColors.length-1)]; })
        .attr("r", pt.orgTreeNetwork.nodeRadius)
	.on("mouseover",showToolTip)
	.on("mouseout",hideToolTip)
        .call(pt.orgTreeNetwork.force.drag);

}//init

pt.orgTreeNetwork.normalNetwork = function() {

  pt.orgTreeNetwork.force.stop();

  //Let the top node free
  pt.orgTreeNetwork.networkData.fixed = false;

  //Set the force for the network structure
  pt.orgTreeNetwork.force
    .gravity(.05)
    .charge(-60)
    .linkDistance(40)
    .on("tick", normalNetwork)
    .start();

  function normalNetwork() {
    pt.orgTreeNetwork.node
        .attr("cx", function(d) { return d.x = Math.max(pt.orgTreeNetwork.nodeRadius, Math.min(pt.orgTreeNetwork.width - pt.orgTreeNetwork.nodeRadius, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(pt.orgTreeNetwork.nodeRadius, Math.min(pt.orgTreeNetwork.height - pt.orgTreeNetwork.nodeRadius, d.y)); });

    pt.orgTreeNetwork.link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  }//normalNetwork

}//normalNetwork
