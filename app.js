
require('dotenv').config()

const express = require('express')

let mustacheExpress = require('mustache-express')

/*************************************************/

var dbconn = require('./dbconn.js')

var con = dbconn.mysql_conn()

/*************************************************/

const app = express()

app.use(express.json())

// app.use(express.static('public'))

app.engine('html', mustacheExpress());

app.set('view engine', 'html');

/*************************************************/

const port = process.env.PORT || 3000

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})

/*************************************************/

app.get('/favicon.ico', (req, res) => {
	res.sendStatus(200)
})

app.get('/', (req, res) => {

	let obj = {
		max_salary: process.env.max_salary,
		season: process.env.season
	}

	let query = `SELECT id, LNF, most_recent_team_name FROM owner_valid ORDER BY LNF`

	con.query(query, function (err, owners) {
		if (err) {
			console.log(err)
			res.json(err)
			return
		}

		obj.owners = owners

		const player_query = `SELECT id AS player_id, salary, team, LNF AS lnf FROM player_pool_detail WHERE pos='whichpos' AND season = ${process.env.season} ORDER BY lnf`

		query = player_query.replace("whichpos", "C")

		con.query(query, function (err, catchers) {
			if (err) {
				console.log(err)
				res.json(err)
				return
			}

			obj.catchers = catchers

			query = player_query.replace("whichpos", "1B")

			con.query(query, function (err, first_basemen) {
				if (err) {
					console.log(err)
					res.json(err)
					return
				}

				obj.first_basemen = first_basemen

				query = player_query.replace("whichpos", "2B")

				con.query(query, function (err, second_basemen) {
					if (err) {
						console.log(err)
						res.json(err)
						return
					}

					obj.second_basemen = second_basemen

					query = player_query.replace("whichpos", "3B")

					con.query(query, function (err, third_basemen) {
						if (err) {
							console.log(err)
							res.json(err)
							return
						}

						obj.third_basemen = third_basemen

						query = player_query.replace("whichpos", "SS")

						con.query(query, function (err, shortstops) {
							if (err) {
								console.log(err)
								res.json(err)
								return
							}

							obj.shortstops = shortstops

							query = player_query.replace("whichpos", "OF")

							con.query(query, function (err, outfield) {
								if (err) {
									console.log(err)
									res.json(err)
									return
								}

								obj.outfield = outfield

								query = player_query.replace("whichpos", "SP")

								con.query(query, function (err, SP) {
									if (err) {
										console.log(err)
										res.json(err)
										return
									}

									obj.SP = SP

									query = player_query.replace("whichpos", "RP")

									con.query(query, function (err, RP) {
										if (err) {
											console.log(err)
											res.json(err)
											return
										}

										obj.RP = RP

										res.render ('index', obj)
									})
								})
							})
						})
					})
				})
			})
		})
	})
})

app.get('/data', (req, res) => {

	let query = `SELECT id, LNF, most_recent_team_name FROM owner_valid ORDER BY LNF`

	con.query(query, function (err, owners) {
		if (err) {
			console.log(err)
			res.json(err)
			return
		}

		let owners_obj = {}

		for (owner of owners) {
			owners_obj[owner.id] = {
				LNF: owner.LNF,
				most_recent_team_name: owner.most_recent_team_name
			}
		}

		query = `SELECT id, pos, salary, team FROM player_pool_detail ORDER BY LNF`

		con.query(query, function (err, players) {
			if (err) {
				console.log(err)
				res.json(err)
				return
			}

			let players_obj = {}

			for (player of players) {
				players_obj[player.id] = {
					team: player.team,
					pos: player.pos,
					salary: player.salary,
					team: player.team
				}
			}

			const obj = {
				owners: owners_obj,
				players: players_obj
			}

			res.json(obj)
		})
	})
})

app.post('/add_team', (req, res) => {

	console.dir(req.body)

	const { bank, owner_id, roster, salary, season, team_name } = req.body

	const team_name_esc = con.escape(team_name)

	let query = `INSERT INTO ownersXseasons SET owner_id = ${owner_id}, team_name = ${team_name_esc}, season = ${season}`

	con.query(query, function (err, data) {
		if (err) {
			console.log(err)
			res.json(err)
			return
		}

		query = `INSERT INTO ownersXrosters (owner_id, player_id, season) VALUES `

		for (player_id of roster) {
			query += `(${owner_id}, ${player_id}, ${season}), `
		}

		query = query.substring(0, (query.length - 2))

		con.query(query, function (err, data) {
			if (err) {
				console.log(err)
				res.json(err)
				return
			}

			res.json({status: "ok"})
		})
	})
})
