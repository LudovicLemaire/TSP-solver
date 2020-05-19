Array.prototype.shuffle = function () {
	for (let j, x, i = this.length - 1; i; j = randomNumber(i), x = this[--i], this[i] = this[j], this[j] = x) {
	
	}
	return this
}

var optimalDistance = 1000 // Definitely an upper bound - it only takes 255 tiles to traverse the whole board
var lastPoints = []
var optimalPath = []
var displayChange = 0

function randomNumber (boundary) {
	return parseInt(Math.random() * boundary)
}

function numberToLetter (nb) {
	nb = parseInt(nb)
	return String.fromCharCode(64 + nb)
}

function Point (x, y) {
	this.x = x
	this.y = y
}

function Normalize(vector) {
	let len = Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1])
	return [vector[0]/len, vector[1]/len]
}

function Dot(vec1, vec2) {
	return vec1[0]*vec2[0] + vec1[1]*vec2[1]
}

function torusDist (p1, p2, hSize, vSize) {
	let dx = Math.abs(p2.x - p1.x)
	let dy = Math.abs(p2.y - p1.y)

	dx = Math.min(dx, hSize - dx)
	dy = Math.min(dy, vSize - dy)
	return dx * dx + dy * dy
}

function distance (p1, p2, hSize, vSize) {
	return torusDist(p1, p2, hSize, vSize)
}

function randomIndividual (n) {
	let a = []
	for (let i = 0; i < n; i++) {
		a.push(i)
	}
	return a.shuffle()
}

function wrap (i, max) {
	return (max + i) % max
}

function randomIntFromInterval(min, max) { // min included, max not included
	return Math.floor(Math.random() * (max - min) + min);
}

export default class Path {
	constructor(value, hMap, vMap) {
		this.points = []
		value.forEach(item => {
			item = item.split(',')
			this.points.push(new Point(item[0], item[1]))
		})
		this.numCities = this.points.length

		this.distanceMat = []
		this.bestPath = []
		this.bestDistance = Math.max(hMap, vMap) * this.numCities // Definitely an upper bound - distance to travel around the globe for each point.

		this.hMap = hMap
		this.vMap = vMap


		// Create a distance matrix
		this.points.forEach(pti => {
			let row = []
			this.points.forEach(ptj => {
				row.push(Math.sqrt(distance(pti, ptj, this.hMap, this.vMap)))
			})
			this.distanceMat.push(row)
		})
		
		this.bestPath = randomIndividual(this.points.length)
		this.currentPath = [...this.bestPath]
		this.currentDistance = this.bestDistance
		this.calculateCurrentValue()

		this.pointactive = []
		for (let i = 0; i < this.numCities; i++) {
			this.pointactive[i] = true
		}
	}

	moveCost(i, j) {
		let l = wrap(i-1, this.numCities)
		let r = wrap(j+1, this.numCities)
		let _ab = this.distanceMat[this.currentPath[l]][this.currentPath[i]]
		let _cd = this.distanceMat[this.currentPath[j]][this.currentPath[r]]
		let _ac = this.distanceMat[this.currentPath[l]][this.currentPath[j]]
		let _bd = this.distanceMat[this.currentPath[i]][this.currentPath[r]]

		//console.log([_ab, _cd, _ac, _bd])
		//console.log([this.currentPath[l], this.currentPath[i], this.currentPath[j], this.currentPath[r]])
				

		// Compute the angle contribution to the cost
		// let oldAngleCost = 0
		// let newAngleCost = 0
		// let angleMult = 1 // Parameter in [0,1] that dictates how much we care about the angle versus the raw distance
		// console.log(this.bestPath)
		// console.log(l,i,j,r)
		// console.log("Calculating angle cost for swapping between " + i + " and " + j)
		// for(let idx = i; idx != j; idx = wrap(idx+1, this.numCities)) {
		// 	let lPt = this.points[this.bestPath[wrap(idx-1, this.numCities)]]
		// 	let cPt = this.points[this.bestPath[idx]]
		// 	let rPt = this.points[this.bestPath[wrap(idx+1, this.numCities)]]
		// 	let left = Normalize([cPt.x-lPt.x, cPt.y-lPt.y])
		// 	let right = Normalize([rPt.x-cPt.x, rPt.y-cPt.y])
		// 	let angle = Math.acos(Dot(left, right)) // Need to know if it's right or left still

		// 	// Rotate right ccw by 90 degrees then dot with left - negative means left turn, positive means right turn
		// 	right = [right[1], -right[0]] // 90 degrees rotated
		// 	angle *= Math.sign(Dot(left, right))

		// 	let rdist = this.distanceMat[this.bestPath[i]][this.bestPath[wrap(i+1, this.numCities)]]
		// 	let ldist = this.distanceMat[this.bestPath[wrap(i-1, this.numCities)]][this.bestPath[i]]
		// 	let rbestAngle = rdist*Math.PI/60 // Rough estimate of a good rotation/grid
		// 	let lbestAngle = ldist*Math.PI/60 // Rough estimate of a good rotation/grid
		// 	oldAngleCost += rdist*angleMult*(1-Math.cos(rbestAngle-angle))
		// 	newAngleCost += ldist*angleMult*(1-Math.cos(lbestAngle+angle)) // Opposite direction has opposite angle between nodes
		// }
		// console.log(oldAngleCost, newAngleCost)

		return (_ac + _bd) - (_ab + _cd)
	}

	get result() {
		this.pathCalculator()
		let points = this.points
		let regions = this.regions
		return {optimalDistance, optimalPath, regions, displayChange, points}
	}

	calculateCurrentValue() {
		this.currentDistance = 0
		for (let i = 0; i < this.currentPath.length-1; i++) {
			this.currentDistance += this.distanceMat[this.currentPath[i]][this.currentPath[i+1]]
		}
		this.currentDistance += this.distanceMat[this.currentPath[this.currentPath.length-1]][this.currentPath[0]]
		return this.currentDistance
	}
	
	activate (a, b, c, d) {
		this.pointactive[a] = true
		this.pointactive[b] = true
		this.pointactive[c] = true
		this.pointactive[d] = true
	}
	
	reverse (from, to) {
		for (let i = from, j = to; i != wrap(j+1, this.numCities) && i != j; i = wrap(i+1, this.numCities), j = wrap(j-1, this.numCities)) {
			let tmp = this.currentPath[i]
			this.currentPath[i] = this.currentPath[j]
			this.currentPath[j] = tmp
		}
	}
	
	findMove (i, j, annealing, prohibitNoCostMoves=false) {
		let lengthScale = 0.25
		let delta = this.moveCost(i, j)
		if(prohibitNoCostMoves && delta == 0) {
			return 0.0 // Ignore no-change costs to avoid infinite loops
		}
		let chance = Math.random()

		if (chance < Math.exp(-delta/lengthScale*annealing)) {
			this.reverse(i, j)
			this.activate(wrap(i-1, this.numCities), i, j, wrap(j+1, this.numCities))
			return delta
		}
		return 0.0
	}

	ConsistentOptimize() {
		let visited = 0
		let current = 0
		for (let i = 0; i < this.numCities; i++) {
			this.pointactive[i] = true
		}
		this.calculateCurrentValue()
		while (visited < this.numCities) {
			if (this.pointactive[current]) {
				let modified = 0 // Define here so we can "Continue" if the path was modified
				for (let i = 0; i < this.numCities-1; i++) {
					let idx = wrap(current+i, this.numCities)
					modified = this.findMove(current, idx, 100000, true) // Large annealing converts to previous method (accept change only if distance decreases)
					this.currentDistance += modified
					if (modified < 0) {
						visited = 0
						this.bestDistance = this.currentDistance
						this.bestPath = [...this.currentPath]
						break
					}
				}
				if(modified < 0) {
					continue
				}
				this.pointactive[current] = false
			}
			current = wrap(current + 1, this.numCities)
			visited++
		}
	}
	
	RandomOptimize () {
		let maxIterations = 20000 * this.numCities // Scale iteration time linearly with nodes
		this.calculateCurrentValue()
		for(let iteration = 0; iteration < maxIterations; ++iteration) {
			let i = randomIntFromInterval(0, this.numCities)
			let reversalLength = randomIntFromInterval(1, this.numCities-1)
			let j = wrap(i+reversalLength, this.numCities)
			let modified = this.findMove(i, j, iteration/maxIterations)
			this.currentDistance += modified
			if(this.currentDistance < this.bestDistance) {
				this.bestDistance = this.currentDistance
				this.bestPath = [...this.currentPath]
			}
		}
	}
	
	readableBest () {
		let resultData = []
		this.bestPath.forEach(item => {
			resultData.push(numberToLetter(this.points[item].x) + this.points[item].y)
		})
		this.regions = []
		resultData.forEach(region => {
			this.regions.push(region)
		})
	}
	
	pathCalculator() {
		let isDifferent = false
		this.ConsistentOptimize() // Optimize like before
		this.RandomOptimize() // Optimize past that point using Monte Carlo
		if (this.points.length !== lastPoints.length) {
			isDifferent = true
		}
		else{
			for (let pIndex = 0; pIndex < this.numCities; ++pIndex) {
				if (this.points[pIndex].x !== lastPoints[pIndex].x || this.points[pIndex].y !== lastPoints[pIndex].y) {
					isDifferent = true
					break
				}
			}
		}
		/* eslint-enable no-unused-vars */
		lastPoints = this.points
		if (Math.ceil(this.bestDistance * 1000) < Math.trunc(optimalDistance * 1000) || isDifferent) {
			optimalDistance = this.bestDistance
			optimalPath = this.bestPath
			if (isDifferent) {
				console.log('%c New layout', 'color: #E67E22')
			} else {
				console.log('%c Better Path Found', 'color: #27AE60')
			}
			this.readableBest()
			displayChange = 1
		} else {
			displayChange = 0
			console.log('%c No Better Path Found', 'color: #AAAAAA')
		}
	}
}

