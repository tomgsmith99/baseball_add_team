<?php

include "/Applications/MAMP/htdocs/baseball_preseason/year.php";

include "/Applications/MAMP/htdocs/baseball_preseason/includes/dbconn.php";

$dbconn = getDBconn();

/*********************************/

$query = "SELECT Players.Player_ID, Players.Fname, Players.Lname FROM Players JOIN players_current ON Players.Player_ID = players_current.player_id WHERE Players.ESPN_Stats_ID = 0 LIMIT 100";

$result = mysqli_query($dbconn, $query);

while ($row = mysqli_fetch_array($result)) {

	$found = 0;

	$player_id = $row["Player_ID"];

	$lname = str_replace(" ", "+", $row["Lname"]); // Take care of last names like "De La Rosa"

	$url = "http://www.google.com/search?as_q=" . $row["Fname"] . "+" . $lname . "+" . "espn";

	echo "search url: " . $url . "\n";

	$results_page = file_get_contents($url);

	if ($results_page) {

		$urls = array(
			"https://www.espn.com/mlb/player/_/id/",
			"http://espn.go.com/mlb/player/stats/_/id/",
			"http://espn.go.com/mlb/player/_/id/",
			"http://espn.go.com/mlb/player/splits/_/id/"
		);

		foreach ($urls as $espn_url) {
			$a = explode($espn_url, $results_page);

			if (count($a) > 1) {
				$found = 1;
				break;
			}
		}

		if ($found) {
			// $a = explode("/", $a[1]);

			$espn_id = substr($a[1], 0, 5);

			echo "The espn_id is: " . $espn_id . "\n";

			$query = "UPDATE Players SET ESPN_Stats_ID = " . $espn_id . " WHERE Player_ID = " . $player_id;

			mysqli_query($dbconn, $query);
		}
		else {
			echo "COULD NOT FIND A PLAYER ID\n";
		}
	}
	else {
		echo "There was a problem getting the player Page.";
	}

	echo "*************************************\n";

}

exit;
