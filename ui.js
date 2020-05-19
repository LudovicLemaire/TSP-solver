import React, { useEffect, useState } from 'react'
import { CheckPicker, Notification, Message, Breadcrumb, ButtonToolbar, IconButton, Icon } from 'rsuite'
import { Grid, Slider } from '@material-ui/core'
import InputNb from '../../InputNb'
import Path from './calc'

import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

import { Link } from "react-router-dom"

const muiTheme = createMuiTheme({
	overrides:{
	  MuiSlider: {
		thumb:{
			color: "#409EFF",
		},
		track: {
		  color: '#409EFF'
		},
		rail: {
		  color: '#7ABDFF'
		}
	  }
  }
});

export default function Ui(props) {
	const NavLink = props => <Breadcrumb.Item componentClass={Link} {...props} />
	const [data, setData] = useState([])
	const [value, setValue] = useState([])
	const [hMap, setHMap] = useState(15)
	const [vMap, setVMap] = useState(15)
	const [scale, setScale] = useState(1)
	const [distance, setDistance] = useState(0)
	const [regions, setRegions] = useState([])
	const [orderBest, setOrderBest] = useState([])
	const [points, setPoints] = useState([])
	

	useEffect(() => {
		return (() => {
			//off for leaks
		})
	}, [])

	useEffect(() => {
		// on load
		//props.socket.emit('getAnimalBreeding', animalName)
	}, [])

	useEffect(() => {
		let ctx = document.getElementById('map').getContext('2d')
		redrawPoints(ctx)
		if(orderBest.length)
			readBest({
				points, optimalPath: orderBest, optimalDistance: distance, regions, displayChange: 1
			})
	}, [scale])

	useEffect(() => {
		let ctx = document.getElementById('map').getContext('2d')
		redrawPoints(ctx)
	}, [value])

	useEffect(() => {
		setValue([])
		setOrderBest([])
		setPoints([])
		setData(generateMap())
		document.getElementById('map').getContext('2d').clearRect(0, 0, (500 * scale), (500 * scale))
		reDrawOutMap(document.getElementById('map').getContext('2d'))
	}, [hMap, vMap])

	function generateMap() {
		let map = []
		let mapLetter = 'A'
		let mapNb = 1
		for (let i = 1; i <= hMap; i++) {
			let mapNb2 = 1
			for (let j = 1; j <= vMap; j++) {
				map.push({
					value: mapNb + ',' + mapNb2,
					label: mapLetter + mapNb2++,
					role: mapLetter
				})
			}
			mapLetter = String.fromCharCode(mapLetter.charCodeAt(0) + 1);
			mapNb++
		}
		return map
	}

	function numberToLetter (nb) {
		nb = parseInt(nb)
		return String.fromCharCode(64 + nb)
	}

	function Point (x, y) {
		this.x = x
		this.y = y
	}

	function visualCalc (nb) {
		return ((16.66 * scale) + ((33.33 * scale) * (nb - 1)))
	}

	function canvasCircle (ctx, x, y, r) {
		ctx.moveTo(x + r, y)
		ctx.arc(x, y, r, 0, 2 * Math.PI, false)
		ctx.fillStyle = '#ecf0f1'
		ctx.fill()
		ctx.lineWidth = 1.25 * scale
		ctx.strokeStyle = '#8e44ad'
	}

	function canvasArrow (ctx, fromx, fromy, tox, toy) {
		if (fromx == tox && fromy == toy)
			return
		var headlen = 10
		var dx = tox - fromx
		var dy = toy - fromy
		var angle = Math.atan2(dy, dx)
		ctx.moveTo(fromx, fromy)
		ctx.lineTo(tox, toy)
		ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6))
		ctx.moveTo(tox, toy)
		ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6))
	}

	function isBorderPath (p1, p2) {
		var dx = Math.abs(p2.x - p1.x)
		var dy = Math.abs(p2.y - p1.y)
		var i = 0
		if (dx > hMap - dx) {
			i++
		}
		if (dy > vMap - dy) {
			i += 2
		}
		return i
	}

	function reDrawOutMap (ctx) {
		ctx.beginPath()
		ctx.fillStyle = '#ffffff'
		ctx.fillRect(hMap * (33.33 * scale), 0, (500 * scale), (500 * scale))
		ctx.fillRect(0, vMap * (33.33 * scale), (500 * scale), (500 * scale))
		ctx.fill()
	}

	function reOrderToFirstPoint(a, firstPoint) {
		let orderedRegions = []
		let passed = false
		firstPoint = numberToLetter(firstPoint[0]) + firstPoint[1]
		for (let item of a) {
			if (item == firstPoint)
				passed = true
			if (passed) {
				orderedRegions.push(item)
			}
		}
		passed = false
		for (let item of a) {
			if (item == firstPoint)
				passed = true
			if (!passed) {
				orderedRegions.push(item)
			}
		}
		return orderedRegions
	}

	function readBest (v) {
		if (!v.displayChange)
			return
		setRegions(reOrderToFirstPoint(v.regions, value[0].split(',')))
		setDistance(v.optimalDistance)
		setPoints(v.points)
		setOrderBest(v.optimalPath)
		let ctx = document.getElementById('map').getContext('2d')
		ctx.clearRect(0, 0, (500 * scale), (500 * scale))
		ctx.beginPath()
		v.optimalPath.push(v.optimalPath[0])
		let oldItem = new Point(0, 0)
		let newItem = new Point(0, 0)
		let i = 0
		let j
		let newPrime
		let oldPrime
		let newPrimeY
		let oldPrimeY
		let bottomLeftX
		let bottomLeftY
		let bottomRightX
		let bottomRightY
		let topRightX
		let topRightY
		let topLeftX
		let topLeftY

		i = 0
		v.optimalPath.forEach(function (item) {
			if (i) {
				newItem.x = visualCalc(v.points[item].x)
				newItem.y = visualCalc(v.points[item].y)
				canvasCircle(ctx, newItem.x, newItem.y, 5 * scale)
			}
			i = 1
		})
		ctx.stroke()
		i = 0
		v.optimalPath.forEach(function (item) {
			ctx.beginPath()
			newItem.x = parseInt(v.points[item].x)
			newItem.y = parseInt(v.points[item].y)
			if (i) {
				if ((j = isBorderPath(oldItem, v.points[item]))) {
					if (j === 1) {
						if (oldItem.x > newItem.x) {
							newPrime = oldItem.x + (hMap - oldItem.x + newItem.x)
							oldPrime = newItem.x - (hMap - oldItem.x + newItem.x)
						} else {
							newPrime = oldItem.x - (hMap - newItem.x + oldItem.x)
							oldPrime = newItem.x + (hMap - newItem.x + oldItem.x)
						}
						canvasArrow(ctx, visualCalc(oldItem.x), visualCalc(oldItem.y), visualCalc(newPrime), visualCalc(newItem.y))
						canvasArrow(ctx, visualCalc(oldPrime), visualCalc(oldItem.y), visualCalc(newItem.x), visualCalc(newItem.y))
						ctx.strokeStyle = '#00EE00'
					} else if (j === 2) {
						if (oldItem.y > newItem.y) {
							newPrime = oldItem.y + (vMap - oldItem.y + newItem.y)
							oldPrime = newItem.y - (vMap - oldItem.y + newItem.y)
						} else {
							newPrime = oldItem.y - (vMap - newItem.y + oldItem.y)
							oldPrime = newItem.y + (vMap - newItem.y + oldItem.y)
						}
						canvasArrow(ctx, visualCalc(oldItem.x), visualCalc(oldItem.y), visualCalc(newItem.x), visualCalc(newPrime))
						canvasArrow(ctx, visualCalc(oldItem.x), visualCalc(oldPrime), visualCalc(newItem.x), visualCalc(newItem.y))
						ctx.strokeStyle = '#00EEEE'
					} else if (j === 3) {
						if (oldItem.y > newItem.y) {
							if (oldItem.x > newItem.x) {
								newPrime = oldItem.x + (hMap - oldItem.x + newItem.x)
								newPrimeY = oldItem.y + (vMap - oldItem.y + newItem.y)
								oldPrime = newItem.x - (hMap - oldItem.x + newItem.x)
								oldPrimeY = newItem.y - (vMap - oldItem.y + newItem.y)

								bottomLeftX = -(hMap - oldItem.x)
								bottomLeftY = vMap - (vMap - oldItem.y)
								topRightX = hMap - (hMap - oldItem.x)
								topRightY = newItem.y - (vMap - oldItem.y + newItem.y)

								canvasArrow(ctx, visualCalc(oldPrime), visualCalc(oldPrimeY), visualCalc(newItem.x), visualCalc(newItem.y))
								canvasArrow(ctx, visualCalc(oldItem.x), visualCalc(oldItem.y), visualCalc(newPrime), visualCalc(newPrimeY))
								canvasArrow(ctx, visualCalc(newItem.x), visualCalc(vMap + newItem.y), visualCalc(bottomLeftX), visualCalc(bottomLeftY))
								canvasArrow(ctx, visualCalc(hMap + newItem.x), visualCalc(newItem.y), visualCalc(topRightX), visualCalc(topRightY))
								ctx.strokeStyle = '#FF4500'
							} else {
								newPrime = oldItem.x - (hMap - newItem.x + oldItem.x)
								newPrimeY = oldItem.y + (vMap - oldItem.y + newItem.y)
								oldPrime = newItem.x + (hMap - newItem.x + oldItem.x)
								oldPrimeY = newItem.y - (vMap - oldItem.y + newItem.y)

								bottomRightX = hMap + oldItem.x
								bottomRightY = vMap - (vMap - oldItem.y)
								topLeftX = oldItem.x
								topLeftY = -(vMap - oldItem.y)

								canvasArrow(ctx, visualCalc(oldPrime), visualCalc(oldPrimeY), visualCalc(newItem.x), visualCalc(newItem.y))
								canvasArrow(ctx, visualCalc(oldItem.x), visualCalc(oldItem.y), visualCalc(newPrime), visualCalc(newPrimeY))
								canvasArrow(ctx, visualCalc(newItem.x), visualCalc(vMap + newItem.y), visualCalc(bottomRightX), visualCalc(bottomRightY))
								canvasArrow(ctx, visualCalc(-(hMap - newItem.x)), visualCalc(newItem.y), visualCalc(topLeftX), visualCalc(topLeftY))
								ctx.strokeStyle = '#FF4500'
							}
						} else {
							if (oldItem.x > newItem.x) {
								newPrime = oldItem.x + (hMap - oldItem.x + newItem.x)
								newPrimeY = oldItem.y - (vMap - newItem.y + oldItem.y)
								oldPrime = newItem.x - (hMap - oldItem.x + newItem.x)
								oldPrimeY = newItem.y + (vMap - newItem.y + oldItem.y)

								bottomRightX = hMap + newItem.x
								bottomRightY = vMap - (vMap - newItem.y)
								topLeftX = newItem.x
								topLeftY = -(vMap - newItem.y)

								canvasArrow(ctx, visualCalc(oldPrime), visualCalc(oldPrimeY), visualCalc(newItem.x), visualCalc(newItem.y))
								canvasArrow(ctx, visualCalc(oldItem.x), visualCalc(oldItem.y), visualCalc(newPrime), visualCalc(newPrimeY))
								canvasArrow(ctx, visualCalc(oldItem.x), visualCalc(vMap + oldItem.y), visualCalc(bottomRightX), visualCalc(bottomRightY))
								canvasArrow(ctx, visualCalc(-(hMap - oldItem.x)), visualCalc(oldItem.y), visualCalc(topLeftX), visualCalc(topLeftY))
								ctx.strokeStyle = '#FF4500'
							} else {
								newPrime = oldItem.x - (hMap - newItem.x + oldItem.x)
								newPrimeY = oldItem.y - (vMap - newItem.y + oldItem.y)
								oldPrime = newItem.x + (hMap - newItem.x + oldItem.x)
								oldPrimeY = newItem.y + (vMap - newItem.y + oldItem.y)

								bottomLeftX = -(hMap - newItem.x)
								bottomLeftY = vMap - (vMap - newItem.y)
								topRightX = hMap - (hMap - newItem.x)
								topRightY = oldItem.y - (vMap - newItem.y + oldItem.y)

								canvasArrow(ctx, visualCalc(oldPrime), visualCalc(oldPrimeY), visualCalc(newItem.x), visualCalc(newItem.y))
								canvasArrow(ctx, visualCalc(oldItem.x), visualCalc(oldItem.y), visualCalc(newPrime), visualCalc(newPrimeY))
								canvasArrow(ctx, visualCalc(oldItem.x), visualCalc(vMap + oldItem.y), visualCalc(bottomLeftX), visualCalc(bottomLeftY))
								canvasArrow(ctx, visualCalc(hMap + oldItem.x), visualCalc(oldItem.y), visualCalc(topRightX), visualCalc(topRightY))
								ctx.strokeStyle = '#FF4500'
							}
						}
					}
				} else {
					canvasArrow(ctx, visualCalc(oldItem.x), visualCalc(oldItem.y), visualCalc(v.points[item].x), visualCalc(v.points[item].y))
					ctx.strokeStyle = '#EEEE00'
				}
			}
			oldItem.x = parseInt(v.points[item].x)
			oldItem.y = parseInt(v.points[item].y)
			i = 1
			ctx.stroke()
		})
		reDrawOutMap(ctx)
	}

	function doCalc() {
		if (!value) { // /!\ need to clean this later /!\
			Notification.error({
				title: 'Operation failed',
				description: "Sorry, you need to select atleast 4 locations",
				duration: 7500 }
			)
			return
		}
		if (value.length < 4) {
			Notification.error({
				title: 'Operation failed',
				description: "Sorry, you need to select atleast 4 locations",
				duration: 7500 }
			)
			return
		}

		console.time('whole function')
		const calc = new Path(value, hMap, vMap);
		readBest(calc.result)
		console.timeEnd('whole function')
	}
	
	function redrawPoints(ctx) {
		let squareSize = 33.333333 * scale
		ctx.clearRect(0, 0, (500 * scale), (500 * scale))
		reDrawOutMap(ctx)
		value.forEach(function (item) {
			ctx.beginPath()
			item = item.split(',')
			canvasCircle(ctx, item[0] * squareSize - (16.66 * scale), item[1] * squareSize - (16.66 * scale), 5 * scale)
			ctx.stroke()
		})
	}
	function regionClick(event) {
		event.persist()
		let canvas = document.getElementById('map')
		let ctx = canvas.getContext('2d')
		let rect = canvas.getBoundingClientRect()
		let xCanvas = event.clientX - Math.trunc(rect.left)
		let yCanvas = event.clientY - Math.trunc(rect.top)
		let squareSize = 33.333333 * scale
		let h = Math.ceil(xCanvas / squareSize)
		let v = Math.ceil(yCanvas / squareSize)
		let newValue = [...value] // needed to create a copy, to do the splice and be able to use the useEffect
		if (h > hMap || v > vMap || h < 1 || v < 1)
			return ;
		let arrayFormat = h.toString() + ',' + v.toString()
		if (!newValue.includes(arrayFormat))
			setValue([...value, arrayFormat])
		else {
			newValue.splice(newValue.indexOf(arrayFormat), 1)
			setValue(newValue)
		}
	}

	return (
		<>
			<Breadcrumb>
				<NavLink to="/">Home</NavLink>
				<NavLink to="/calcList">Calculators</NavLink>
				<NavLink to="" active>Treasure Path</NavLink>
			</Breadcrumb>
			<div className="flexcontainer">
				<Grid container direction="row" justify="space-evenly" alignItems="center" style={{marginTop: -15}}>
					<Grid item xs={12} sm={6} md={4} style={{marginTop: 15}}>
						<InputNb onChange={e => setHMap(e)} value={hMap} min={2} max={15} step={1} label='Horizontal Map Size'/>
					</Grid>
					<Grid item xs={12} sm={6} md={4} style={{marginTop: 15}}>
						<InputNb onChange={e => setVMap(e)} value={vMap} min={2} max={15} step={1} label='Vertical Map Size'/>
					</Grid>
				</Grid>
				<div style={{textAlign: 'center', marginTop: 15}}>
					<CheckPicker
						data={data}
						value={value}
						onChange={(value, item, event)=> setValue(value)	}
						groupBy="role"
						renderMenuGroup={(label, item) => {
							return (
									<b>Grid {label}</b>
							)
						}}
						placeholder="Select your treasure maps locations"
						style={{ width: 300}}
					/>
				</div>
				<ButtonToolbar style={{marginTop: 15, textAlign: 'center'}}>
					<IconButton icon={<Icon icon="arrow-right" />} placement="right" onClick={doCalc}>
						Calculate
					</IconButton>
					<ThemeProvider theme={muiTheme}>
					<Slider
						defaultValue={scale}
						onChangeCommitted={(e, v) => setScale(v)}
						aria-labelledby="discrete-slider"
						valueLabelDisplay="auto"
						step={0.1}
						min={0.1}
						max={2.5}
					/>
					</ThemeProvider>
				</ButtonToolbar>
				
				<div style={{textAlign: 'center'}}>
					<p style={{color: 'rgba(0, 0, 0, 0.54)'}}>
						<b>Distance :</b> {Math.ceil(distance * 100) / 100}
						<br />
						<b>Path to follow : </b>
						{regions.map((region, i) => (
							<span key={i}>{region} -> </span>
						))}
						{regions[0]}
					</p>
					<div style={{marginTop: 5}}>
						<img style={{position: 'absolute'}} src={'map.jpg'} width={500 * scale} height={500 * scale}></img>
						<canvas onClick={(v) => regionClick(v)} style={{ position: "absolute", cursor: 'pointer' }} id="map" width={500 * scale} height={500 * scale}></canvas>
						<canvas style={{zIndex: "-1"}} id="d" width={500 * scale} height={500 * scale}></canvas>
					</div>
					<p style={{color: 'rgba(0, 0, 0, 0.54)', marginTop: 5}}>
						<b>Note :</b> Atlas has a "fake globe" aspect, if you cross an edge of the map, you will be teleported to the other side.
					</p>
				</div>
				<br/><br/>
			</div>
		</>
	)
}