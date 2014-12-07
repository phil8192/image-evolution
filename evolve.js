/**
 * image evolution 
 * ---------------
 * see http://parasec.net/transmission/image-evolution/
 */

/**
 * genetic algorithm configuration. 
 */
var conf = {
  crossOverRate: 0, // probability of crossover
  mutationRate: 1, // probability of a mutation
  maxNumberOfPolygons: 500,
  maxNumberOfVertices: 6,
  initialPolys: 50 
};

/**
 * remove a range in an array
 * (pinched this from john resig)
 */
Array.prototype.remove = function(from, to) {
  var rest = this.slice(( to || from ) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

/**
 * shuffle an array
 */
Array.prototype.shuffle = function() {
  this.sort(function(a, b) {
    return 0.5-Math.random();
  });
};

/**
 * round a number. uses shifting.
 */
function myRound(d) {
  return d < 0 ? d - 0.5 >> 0 : d + 0.5 >> 0
}

/**
 * various functions to update dom.
 */
function updateDebug(line) {
  document.getElementById("debug").innerHTML = line;
}

function updateFitness(fitness) {
  document.getElementById("fitness").innerHTML = fitness;
}

function updateChi(chi) {
  document.getElementById("chi").innerHTML = "x^2: " + chi;
}

function updateInd(ind, fit) {
  document.getElementById("ind").innerHTML = "individual " + ind + 
      " fitness = " + fit; 
}

function updatePolys(polys) {
  document.getElementById("polys").innerHTML = "polygons = " + polys;
}

/**
 * get a random number up until n.
 */
function nextInt(n) {
  return Math.floor(Math.random()*(n+1));
}

/**
 * draw a polygon on the canvas.
 */
function drawPolygon(c, polygon) {
  var points = polygon.points;
  var firstPoint = points[0];
  c.beginPath();
  c.moveTo(firstPoint.x, firstPoint.y);
  c.fillStyle = polygon.colour.toString(); 
  for(var i = 1, len = points.length; i < len; i++) {
    var point = points[i];
    c.lineTo(point.x, point.y);
  }
  c.closePath();
  c.fill();
}

/**
 * draw an individual phenotype
 */
function drawIndividual(c, individual) {
  var dna = individual.dna;
  for(var i = 0, j = dna.length; i < j; i++)
    drawPolygon(c, dna[i]);		
}

/**
 * point struct
 */
function Point(x, y) {
  this.x = x;
  this.y = y;
}

/**
 * (point)
 */
Point.prototype.toString = function() {
  return "(" + this.x + "," + this.y + ")";
}

/**
 * RGB-a struct.
 */
function Colour(r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
}

/**
 * rgba(r,g,b,a)
 */
Colour.prototype.toString = function() {
  var s = "rgba(";
  s += this.r;
  s += ",";
  s += this.g;
  s += ",";
  s += this.b;
  s += ",";
  s += this.a;
  s += ")"; 
  return s;
};

/**
 * polygon constructor.
 */
function Polygon(colour) {
  this.colour = colour;
  this.points = [];
  this.marker = globalMarker;
}

/**
 * add a point to the polygon.
 */
Polygon.prototype.addPoint = function(point) {
  this.points.push(point);
  return this;	
};

/**
 * move the polygon
 */
Polygon.prototype.move = function(maxX, maxY) {
  var neX = 0, neY = Number.MAX_VALUE, swX = Number.MAX_VALUE, swY = 0;
  var vertics = this.points;

  for(var i = 0, len = vertics.length; i < len; i++) {
    var vertice = vertics[i];
    var x = vertice.x;
    var y = vertice.y;

    if(x > neX ) neX = x;
    if(x < swX ) swX = x;
    if(y < neY ) neY = y;
    if(y > swY ) swY = y;
  }
	
  var w = neX-swX;
  var h = swY-neY;
	
  var neX_new = w + nextInt(maxX-w);
  var neY_new = nextInt(maxY-h); 

  var deltaX = neX_new-neX;
  var deltaY = neY_new-neY;

  for(var i = 0, len = vertics.length; i < len; i++) {
    var vertice = vertics[i];
    vertice.x += deltaX;
    vertice.y += deltaY; 
  }
};

/**
 * remove a random point from the polyon
 */
Polygon.prototype.removePoint = function() {
  var len = this.points.length;
  if(len > 3) this.points.remove(nextInt(len-1));
};

/**
 * pretty print polygon
 */
Polygon.prototype.toString = function() {
  return this.points + " " + this.colour;
};

/**
 * initialise a vector with an intial value.
 */
function vector(size, initValue) {
  var arr = [];
  while(--size >= 0)
    arr.push(initValue);
  return arr;
}	

/**
 * draw a histogram on the canvas.
 * this was used when experimenting with a histogram based fitness function.
 */
function drawHistogram(pixels, context) {
  var rChannel = vector(256, 0);
  var gChannel = vector(256, 0);
  var bChannel = vector(256, 0);

  var maxR = 0, maxG = 0, maxB = 0;

  for(var i = 0, len = pixels.length; i < len; i += 4) {
    var r = pixels[i];
    var g = pixels[i+1];
    var b = pixels[i+2];
		
    var rVal = rChannel[r]+1;
    var gVal = gChannel[g]+1;
    var bVal = bChannel[b]+1;
		
    rChannel[r] = rVal;
    gChannel[g] = gVal;
    bChannel[b] = bVal;

    if(rVal > maxR) maxR = rVal;
    if(gVal > maxG) maxG = gVal;
    if(bVal > maxB) maxB = bVal;
  }

  context.clearRect(0, 0, 256, 300);
	
  for(var i = 1; i < 256; i++) {
    context.fillStyle = "rgb(255,0,0);";
    context.fillRect(i, 100, 1, -Math.round((rChannel[i]/maxR)*100));
    context.fillStyle = "rgb(0,255,0);";
    context.fillRect(i, 200, 1, -Math.round((gChannel[i]/maxG)*100));
    context.fillStyle = "rgb(0,0,255);";
    context.fillRect(i, 300, 1, -Math.round((bChannel[i]/maxB)*100));
  }
}

/**
 * some experiments with varuious histogram difference measures.
 * (not used)
 */
function histogramComp(byteArrA, byteArrB, width, height) {
  var e2 = 0; // sum of squares
  var e3 = 0; // intersection method
  var e4 = 0; // chi^2 method

  var s1r = 0, s2r = 0, s3r = 0; // for correlation method
  var s1g = 0, s2g = 0, s3g = 0;
  var s1b = 0, s2b = 0, s3b = 0;
  var nb = (1/256) * (width*height*3);

  for(var i = 0; i < 256; i++) {
    var rA = rChannelA[i], gA = gChannelA[i], bA = bChannelA[i];
    var rB = rChannelB[i], gB = gChannelB[i], bB = bChannelB[i];

    var rDelta = rA-rB;
    var gDelta = gA-gB;
    var bDelta = bA-bB;

    e2 += (rDelta*rDelta)+(gDelta*gDelta)+(bDelta*bDelta);
    e3 += (rA < rB ? rA : rB) + (gA < gB ? gA : gB) + (bA < bB ? bA : bB);
    e4 += e2/(1+rA+gA+bA+rB+gB+bB);

    var rAd = rA-nb;
    var rBd = rB-nb;
    s1r += rAd*rBd;
    s2r += rAd*rAd;
    s3r += rBd*rBd;

    var gAd = gA-nb;
    var gBd = gB-nb;
    s1g += gAd*gBd;
    s2g += gAd*gAd;
    s3g += gBd*gBd;

    var bAd = bA-nb;
    var bBd = bB-nb;
    s1b += bAd*bBd;
    s2b += bAd*bAd;
    s3b += bBd*bBd;
  }

  var rCor = s1r/Math.sqrt(s2r*s3r);
  var gCor = s1g/Math.sqrt(s2g*s3g);
  var bCor = s1b/Math.sqrt(s2b*s3b);

  return rCor*gCor*bCor;
}

/**
 * rgb histogram based firness function.
 * not used - did not work well. could be used in combination with something
 * else perhaps.
 */
function histogramDiff(byteArrA, byteArrB, width, height) {
  var rChannelA = vector(256, 0), rChannelB = vector(256, 0);
  var gChannelA = vector(256, 0), gChannelB = vector(256, 0);
  var bChannelA = vector(256, 0), bChannelB = vector(256, 0);
  var e1 = 0;
  for(var i = 0, len = byteArrA.length; i < len; i += 4) {
    var off1 = i + 1, off2 = i + 2;

    var rA = byteArrA[i], gA = byteArrA[off1], bA = byteArrA[off2];
    var rB = byteArrB[i], gB = byteArrB[off1], bB = byteArrB[off2];

    rChannelA[rA]++; gChannelA[gA]++; bChannelA[bA]++;
    rChannelB[rB]++; gChannelB[gB]++; bChannelB[bB]++;
 
    var rDelta = rA-rB;
    var gDelta = gA-gB;
    var bDelta = bA-bB;

    e1 += (rDelta*rDelta)+(gDelta*gDelta)+(bDelta*bDelta);
  }
  return (1-(e1/(195075*width*height)));
}


/**
 * rgb element by element fitness function.
 */
function diff(byteArrA, byteArrB, width, height) {
  var e1 = 0;
  for(var i = 0, len = byteArrA.length; i < len; i += 4) {
    var off1 = i + 1, off2 = i + 2;
    var rA = byteArrA[i], gA = byteArrA[off1], bA = byteArrA[off2];
    var rB = byteArrB[i], gB = byteArrB[off1], bB = byteArrB[off2];
    var rDelta = rA-rB;
    var gDelta = gA-gB;
    var bDelta = bA-bB;
    e1 += Math.abs(rDelta)+Math.abs(gDelta)+Math.abs(bDelta);
  }
  return 1-(e1/(255*3*width*height));
}

/**
 * a random brightness
 */
function randomColour() {
  return nextInt(255); 
}

/**
 * wrap around
 */
function incr(c) {
  return (c+1)%256; 
}

/**
 * a random polgon
 */
function randomPolygon(numberOfVertices, maxX, maxY) {
  var r = randomColour();
  var g = randomColour();
  var b = randomColour();
  var a = 1-Math.random(); 
  var poly = new Polygon(new Colour(r, g, b, a));

  for(var j = 0; j < numberOfVertices; j++) {
    var x = nextInt(maxX);
    var y = nextInt(maxY);
    poly.addPoint(new Point(x, y));
  }
  return poly;
}

/**
 * individual in the population.
 */
function Individual() {
  this.dna = [];
  this.fitness = 0;

  this.init = function(numberOfPolygons, numberOfVertices, maxX, maxY, 
      clonedPolys) {
		
    if(clonedPolys != null) { 
      this.dna = clonedPolys;
    } else {
      for(var i = 0; i < numberOfPolygons; i++) 
        this.dna.push(randomPolygon(numberOfVertices, maxX, maxY));		
    }

    this.mutate = function() {

      var dna = this.dna;
      var len = dna.length;
			
      var idx1 = nextInt(len-1);
      var poly = this.dna[idx1]; 
      var r = Math.random();
			
      if(r < 0.45) {
        var colour = poly.colour;
	if(r < 0.1125)  colour.r = randomColour();
	else if(r < 0.2250) colour.g = randomColour();
	else if(r < 0.3375) colour.b = randomColour();
	else colour.a = 1-Math.random();
      } else if(r < 0.9) {
        if(r < 0.675)	
	  poly.move(maxX, maxY);
	else {
	  var point = poly.points[nextInt(poly.points.length-1)];
	  if(r < 0.7875 ) point.x = nextInt(maxX); 
	  else point.y = nextInt(maxY);
	}
      }
			
      else if(r < 0.95) {
        if(r < 0.925) 
	  poly.removePoint();
	else {
	  var points = poly.points;
          var len2 = points.length;
          if( len2 < conf.maxNumberOfVertices)
            points.splice(nextInt(len2), 0, new Point(nextInt(maxX), 
                nextInt(maxY)));
	}
      } else {
        if(r < 0.975) {
	  if(len >= 2)
	    dna.remove(idx1);
	} else {
	  if(len < conf.maxNumberOfPolygons)
	    this.dna.splice(nextInt(len), 0, randomPolygon(numberOfVertices, 
                maxX, maxY));
	}
      }
    }
		
    this.draw = function(c) {
      c.clearRect(0, 0, maxX, maxY);
      drawIndividual(c, this);
      var imgData = c.getImageData(0, 0, maxX, maxY);
      return imgData.data;
    }
  } 
}

/**
 * remove a random polygon from individual
 */
Individual.prototype.removePoly = function() {
  var len = this.dna.length;
  if(len >= 2) this.dna.remove(nextInt(len-1));
}

/**
 * pretty print individual fitness
 */
Individual.prototype.toString = function() { 
  return this.fitness.toFixed(6); 
};

var globalMarker = 0;
var numPolygons = 1;

/**
 * population of individuals
 */
function Population() {
  this.individuals = [];
  this.max = 0;
  this.elite = null;	
  this.s = 0; // fitnessSum - sum of ranks

  this.init = function(numberOfIndividuals, initialNumberOfPolygons, 
      initialNumberOfVertics, maxX, maxY) {
    for(var i = 1; i <= numberOfIndividuals; i++) {
      var individual = new Individual();
      individual.init(initialNumberOfPolygons, initialNumberOfVertics, maxX, 
          maxY);
      this.individuals.push( individual );
      this.s += i;
    }
  }
}

/**
 * sort individuals by fitness
 */
function sortByFitness(indArr) {
  indArr.sort(function(a, b) { 
    return b.fitness-a.fitness; 
  });
}


/**
 * probabilistically select an individual from the population based on their
 * fitness. this uses rank selection. although could use 
 * roulette(indArr, fitnessSum) for roulette wheel selection.
 */
function fps(indArr, fitnessSum) {
  return rank(indArr, fitnessSum);	
}

/**
 * rank selection.
 */
function rank(indArr, fitnessSum) {
  var nSum = 1;
  var r = Math.random();
        
  var n = indArr.length;
  var last = n-1;
        
  for(var i = 0; i < last; i++) {
    nSum -= (n/fitnessSum); 
    n--;                
    if(r >= nSum)
      return indArr[i];
  }
  return indArr[last];
}

/**
 * roulette wheel selection. 
 */
function roulette(indArr, fitnessSum) {
  var nSum = 1;
  var r = Math.random();
  var last = indArr.length-1;

  for(var i = 0; i < last; i++) {
    var ind = indArr[i];
    var proportionateFitness = ind.fitness/fitnessSum;
    nSum -= proportionateFitness;
    if(r >= nSum)
      return ind;
  }
  return indArr[last];
}

/**
 * create 2 offspring from 2 parents. 
 * uses twoPointCrossover, although could use
 * cutAndSplice(ind1, ind2, polys1, polys2), or
 * onePointCrossover(par1, par2, off1, off2, numberOfPolygons)
 */
function mate(ind1, ind2, numberOfPolygons, numberOfVertices, maxX, maxY) {
  var mutationRate  = conf.mutationRate;
  var crossOverRate = conf.crossOverRate;

  var offspring1 = new Individual();
  var offspring2 = new Individual();	

  var polys1 = [];
  var polys2 = [];

  if(Math.random() <= crossOverRate)	
    twoPointCrossover( ind1, ind2, polys1, polys2)
  else cloneParents( ind1.dna, ind2.dna, polys1, polys2)
			
  offspring1.init(numberOfPolygons, numberOfVertices, maxX, maxY, polys1);
  offspring2.init(numberOfPolygons, numberOfVertices, maxX, maxY, polys2);

  if(Math.random() <= mutationRate) { 
    offspring1.mutate();
  }
  if(Math.random() <= mutationRate)  {
    offspring2.mutate();
  }

  return { 
    offspring1: offspring1, 
    offspring2: offspring2 
  }; 
}

/**
 * 1 point crossover.
 */
function onePointCrossover(par1, par2, off1, off2, numberOfPolygons) {
  var r = nextInt(numberOfPolygons);
  for(var i = 0; i < r; i++) {
    off1.push(clonePoly(par1[i]));
    off2.push(clonePoly(par2[i]));
  }
  for(var i = r; i < numberOfPolygons; i++) {
    off1.push(clonePoly(par2[i]));
    off2.push(clonePoly(par1[i]));
  }
}

/**
 * cut and splice crossover.
 */
function cutAndSplice(ind1, ind2, off1, off2) {
  var par1 = ind1.dna;
  var par2 = ind2.dna;

  var r1 = nextInt(par1.length);
  var r2 = nextInt(par2.length);

  for(var i = 0; i < r1; i++) 
    off1.push(clonePoly(par1[i]));
  for(var i = 0; i < r2; i++)
    off2.push(clonePoly(par2[i]));
  for(var i = r2, len = par2.length; i < len; i++)
    off1.push(clonePoly(par2[i]));
  for(var i = r1, len = par1.length; i < len; i++)
    off2.push(clonePoly(par1[i]));
}

/**
 * 2 point crossover
 */
function twoPointCrossover(ind1, ind2, off1, off2) {

  var par1 = ind1.dna;
  var par2 = ind2.dna;

  var fittest = ind1.fitness > ind2.fitness ? par1 : par2;

  var max = par1.length < par2.length ? par1.length : par2.length;

  var r1 = nextInt(max-1);
  var r2 = nextInt(max-1);
  var i1 = Math.min(r1, r2);
  var i2 = Math.max(r1, r2);

  for(var i = 0; i < i1; i++) {
    off1.push(clonePoly(fittest[i]));
    off2.push(clonePoly(fittest[i]));
  }
	
  var clones1 = [];
  var clones2 = [];

  for(var i = i1; i <= i2; i++) {
    clones1.push(clonePoly(par2[i]));
    clones2.push(clonePoly(par1[i]));
  }

  for(var i = 0, len = clones1.length; i < len; i++) {
    off1.push(clones1[i]);
    off2.push(clones2[i]);
  }

  for(var i = i2 + 1; i < fittest.length; i++) {
    off1.push(clonePoly(fittest[i]));
    off2.push(clonePoly(fittest[i]));
  }
}

/**
 * clone 2 parents.
 */
function cloneParents(par1, par2, polys1, polys2) {
  for(var i = 0, len = par1.length; i < len; i++)
    polys1.push( clonePoly(par1[i]));
  for(var i = 0, len = par2.length; i < len; i++)
    polys2.push(clonePoly(par2[i]));
}

/**
 * clone a polygon
 */
function clonePoly(poly) {
  var colour = poly.colour;
  var points = poly.points;
  var cloned = new Polygon(new Colour(colour.r, colour.g, colour.b, colour.a));
  cloned.marker = poly.marker;
  for(var i = 0, len = points.length; i < len; i++) {
    var point = points[i];
    cloned.addPoint(new Point(point.x, point.y));
  }
  return cloned;	
}

/**
 * clone a collection of polygons.
 */
function clonePolys(polys) {
  var clonedPolys = [];

  for(var i = 0, j = polys.length; i < j; i++) {
		
    var poly = polys[i];
    var points = poly.points;
    var colour = poly.colour;	
	
    var clonedPoly = new Polygon(new Colour(colour.r, colour.g, colour.b, 
        colour.a));
    clonedPoly.marker = poly.marker;
    
    for(var k = 0, l = points.length; k < l; k++) {
      var point = points[k];
      clonedPoly.addPoint(new Point(point.x, point.y));
    }		
    clonedPolys.push(clonedPoly);
  }

  return clonedPolys;
}

/**
 * start.
 */
function load() {
  var orig_canvas = document.getElementById("orig_img_canvas");
  var best_canvas = document.getElementById("best_img_canvas");
  var origContext = orig_canvas.getContext("2d");
  var bestContext = best_canvas.getContext("2d");
  var test_canvas = document.getElementById("test_img_canvas");
  var testContext = test_canvas.getContext("2d");
	
  origContext.drawImage(document.getElementById( "orig_img" ), 0, 0);
  var imgData = origContext.getImageData(0, 0, orig_canvas.width, 
      orig_canvas.height);
  var pixels = imgData.data;
  //drawHistogram( pixels, document.getElementById( "colorhistcanvas2" )
  //    .getContext( "2d" ) );

  var indivs = 3;	
  var polys = conf.initialPolys;
  var vertices = 3;
	
  var population = new Population();

  // initialise population and start evolution	
  population.init(indivs, polys, vertices, best_canvas.width, 
      best_canvas.height);
  evolve(population, bestContext, testContext, pixels, 0, polys, vertices, 0,
      indivs, best_canvas.width, best_canvas.height, null, 0);
}

/**
 * evolve the population.
 */
function evolve(population, bestContext, testContext, pixels, epoch, 
    initialNumberOfPolygons, initialNumberOfVertics, j, maxJ, maxX, maxY, 
    bestInd, fitnessSum) {
  if(j != maxJ) {
 			
    var ind = population.individuals[j];
    var bytes = ind.draw(testContext);
           
    var fitness = diff(bytes, pixels, maxX, maxY);
    if(fitness > population.max) {
      bestInd = ind;
      population.max = fitness;
      population.elite = ind;
    }

    ind.fitness = fitness;
		
    setTimeout(function() { 
      evolve(population, bestContext, testContext, pixels, epoch, 
          initialNumberOfPolygons, initialNumberOfVertics, ++j, maxJ, maxX, 
          maxY, bestInd, fitnessSum ); 
    }, 0);

  } else {
    if(bestInd) { 
      var bestPixels = bestInd.draw(bestContext);
      //var context = document.getElementById("colorhistcanvas1")
      //    .getContext("2d");
      //drawHistogram(bestPixels, context);
      updateFitness("epoch = " + epoch + " fitness = " + population.max);
      var polys = bestInd.dna.length;
      if(polys != numPolygons) {
        updatePolys(polys);
        numPolygons = polys;
      }
    }

    sortByFitness(population.individuals);

    var nextGeneration = [];
    nextGeneration.push(population.elite);

    for(var i = 1; i < j; i += 2) {
      var parent1 = fps(population.individuals, population.s);
      var parent2 = fps(population.individuals, population.s);
      var offspring = mate(parent1, parent2, initialNumberOfPolygons, 
          initialNumberOfVertics, maxX, maxY);
      nextGeneration.push(offspring.offspring1, offspring.offspring2);
    }
    population.individuals = nextGeneration;
    
    ++epoch;
    setTimeout(function() { 
      evolve(population, bestContext, testContext, pixels, epoch, 
          initialNumberOfPolygons, initialNumberOfVertics, 0, maxJ, maxX, maxY, 
          null, 0 ); 
    }, 0);
  }	
}

