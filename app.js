
require('dotenv').config()

const express = require('express')

const mustacheExpress = require('mustache-express')

/*************************************************/

const dbconn = require('./dbconn.js')

const con = dbconn.mysql_conn()

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
// Get players

let positions = require('./data/positions.json')

let players_obj = {}

let query = `SELECT id, LNF, pos, salary, team FROM player_pool_detail ORDER BY LNF`

con.query(query, function (err, players) {
	if (err) {
		console.log(err)
		return
	}

	for (i = 0; i < positions.length; i++) {

		positions[i].players = []

		for (player of players) {
			if (player.pos == positions[i].pos) {

				positions[i].players.push({
					id: player.id,
					lnf: player.LNF,
					salary: player.salary,
					team: player.team
				})
			}
		}

		for (player of players) {
			players_obj[player.id] = {
				team: player.team,
				pos: player.pos,
				salary: player.salary,
				team: player.team
			}
		}
	}
})

// Get owners

let owners_arr = []

query = `SELECT id, LNF, most_recent_team_name FROM owner_valid ORDER BY LNF`

con.query(query, function (err, owners) {
	if (err) {
		console.log(err)
		return
	}

	for (owner of owners) {
		owners_arr.push(owner)
	}
})

/*************************************************/

app.get('/favicon.ico', (req, res) => {
	res.sendStatus(200)
})

app.get('/', (req, res) => {

	let obj = {
		max_salary: process.env.max_salary,
		season: process.env.season,
		owners: owners_arr,
		positions: positions
	}

	res.render ('index', obj)
})

app.get('/data', (req, res) => {

	let owners_obj = {}

	for (owner of owners_arr) {
		owners_obj[owner.id] = {
			LNF: owner.LNF,
			most_recent_team_name: owner.most_recent_team_name
		}
	}

	const obj = {
		owners: owners_obj,
		players: players_obj
	}

	res.json(obj)

})

app.post('/add_team', (req, res) => {

	console.dir(req.body)

	const { bank, owner_id, roster, salary, season, team_name } = req.body

	const team_name_esc = con.escape(team_name)

	let query = `INSERT INTO ownersXseasons SET owner_id = ${owner_id}, team_name = ${team_name_esc}, season = ${season}, salary = ${salary}, bank = ${bank}`

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
