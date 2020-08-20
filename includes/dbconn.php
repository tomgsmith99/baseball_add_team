<?php

include "/Applications/MAMP/htdocs/baseball_preseason/.env.php";

function getDBconn($dbname = "baseball") {

	$mysqli = new mysqli($GLOBALS["DB_HOST"], $GLOBALS["DB_USERNAME"], $GLOBALS["DB_PASSWORD"], $dbname, $GLOBALS["DB_PORT"]);

	if ($mysqli->connect_error) {
		echo "<p>could not connect to db.";

		die('Connect Error (' . $mysqli->connect_errno . ') '
			. $mysqli->connect_error);
	}
	else {
		// echo "<p>The db connection worked.";
	}

	return $mysqli;
}