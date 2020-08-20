<?php

include "/Applications/MAMP/htdocs/baseball_preseason/includes/year.php";

include "/Applications/MAMP/htdocs/baseball_preseason/includes/dbconn.php";

$dbconn = getDBconn();

// **************************************************************

$query = "SELECT * FROM players_temp WHERE found = 0";

$result = mysqli_query($dbconn, $query);

if (mysqli_error($dbconn)) {
	echo mysqli_error($dbconn);
	exit;
}

$num_rows = mysqli_num_rows($result);

echo "the number of players not yet found in the players_temp table is: " . $num_rows . "\n";

while ($row = mysqli_fetch_array($result)) {

	$query = "SELECT * FROM Players WHERE FnamePlain = '" . $row["FnamePlain"] . "' ";
	$query .= "AND LnamePlain = '" . $row["LnamePlain"] . "' ";
	// $query .= "AND Minit = '" . $row["Minit"] . "' ";
	// $query .= "AND Suffix = '" . $row["Suffix"] . "' ";
	$query .= "AND Retired != 1";

	echo $query . "\n";

	$r = mysqli_query($dbconn, $query);

	if (mysqli_error($dbconn)) {
		echo mysqli_error($dbconn);
		exit;
	}

	$num_rows = mysqli_num_rows($r);

	echo "the number of matching rows is: " . $num_rows . "\n";

	if ($num_rows === 0) {

		echo "\n\n*********************\n";
		echo "could not find this player in the Players table:\n";
		echo "\n";
		echo $row["Fname"] . " " . $row["Lname"];
		echo "\n";
		echo "do you want to add this player to the Players table with the following query?\n";

		$query = "INSERT INTO Players SET Fname='" . $row["Fname"] . "', ";
		$query .= "Lname='" . $row["Lname"] . "', ";
		$query .= "FnamePlain='" . $row["FnamePlain"] . "', ";
		$query .= "LnamePlain='" . $row["LnamePlain"] . "', ";
		$query .= "FNF='" . $row["Fname"] . " " . $row["Lname"] . "', ";
		$query .= "LNF='" . $row["Lname"] . ", " . $row["Fname"] . "', ";
		// $query .= "Minit='" . $row["Minit"] . "', ";
		// $query .= "Suffix='" . $row["Suffix"] . "', ";

		$query .= "YearAdded=" . $year;

		echo $query . "\n";

		echo "y/n: ";

		$line = trim(fgets(STDIN));

		if ($line === "y") {
			mysqli_query($dbconn, $query);

			if (mysqli_error($dbconn)) {
				echo mysqli_error($dbconn);
				exit;
			}
			else {
				$player_id = mysqli_insert_id($dbconn);
				add_player_to_this_year_table(
					$player_id,
					$row["salary"],
					$row["team"],
					$row["pos"],
					$row["p_type"],
					$row["FnamePlain"],
					$row["LnamePlain"]
				);
			}
		}
	}

	if ($num_rows === 1) {

		$player = mysqli_fetch_array($r);

		add_player_to_this_year_table(
			$player["Player_ID"],
			$r["salary"],
			$row["team"],
			$row["pos"],
			$row["p_type"]
		);
	}

	if ($num_rows > 1) {
		echo "\n";
		exit;
	}
}

function add_player_to_this_year_table($player_id, $salary, $team, $pos, $ptype, $fnameplain, $lnameplain) {
	global $dbconn;
	global $year;

	$query = "INSERT INTO players_current SET ";
	$query .= "player_id=" . $player_id . ", ";
	$query .= "salary=" . $salary . ", ";
	$query .= "team='" . $team . "', ";
	$query .= "pos='" . $pos . "', ";
	$query .= "p_type='" . $ptype . "'";

	echo "the query is: " . $query . "\n";

	mysqli_query($dbconn, $query);

	if (mysqli_error($dbconn)) {
		echo mysqli_error($dbconn);
		exit;
	}

	$query = "UPDATE players_temp SET found = 1 WHERE";
	$query .= " salary=" . $salary;
	$query .= " AND team='" . $team . "'";
	$query .= " AND pos='" . $pos . "'";
	$query .= " AND p_type='" . $ptype . "'";
	$query .= "AND FnamePlain='" . $fnameplain . "' ";
	$query .= "AND LnamePlain='" . $lnameplain . "'";

	echo "the query is: " . $query . "\n";

	mysqli_query($dbconn, $query);

	if (mysqli_error($dbconn)) {
		echo mysqli_error($dbconn);
		exit;
	}
}

exit;
