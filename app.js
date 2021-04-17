
const express = require('express')
let mustacheExpress = require('mustache-express');

/*************************************************/

var dbconn = require('./dbconn.js')

var con = dbconn.mysql_conn()

/*************************************************/

const app = express()

app.use(express.json());

app.use(express.static('public'))

app.engine('html', mustacheExpress());

app.set('view engine', 'html');

// app.set('views', `${__dirname}/views`);

/*************************************************/

const port = process.env.PORT || 3000

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})

/*************************************************/

app.get('/', (req, res) => {

	var obj = {
		api_base: process.env.API_BASE,
		API_KEY: process.env.API_KEY
	}

	var query = `SELECT owner_id, LNF FROM owners WHERE family_status=1 ORDER BY LNF`

	console.log(query)

	con.query(query, function (err, owners) {
		if (err) {
			console.log(err)
			res.json(err)
			return
		}

		obj.owners = owners

		console.dir(owners)

		const player_query = "SELECT pc.player_id, pc.salary, pc.team, p.lnf FROM players_current AS pc, players AS p WHERE pos='whichpos' AND pc.player_id = p.player_id ORDER BY p.lnf"

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
