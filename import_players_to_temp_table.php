<?php

include "/Applications/MAMP/htdocs/baseball_preseason/includes/year.php";

include "/Applications/MAMP/htdocs/baseball_preseason/includes/dbconn.php";

$dbconn = getDBconn();

// open players.txt file
// each row in the players.txt file should look like this:
// C	MOLINA	YADIER	960	STL

$players = file("players.txt");

$text_file_num_rows = count($players);

echo "the number of rows in the players.txt file is: " . $text_file_num_rows . "\n";

$query = "SELECT * FROM players_temp";

$result = mysqli_query($dbconn, $query);

if (mysqli_error($dbconn)) {
	echo mysqli_error($dbconn);
	exit;
}

$num_rows = mysqli_num_rows($result);

echo "the number of rows in the players_temp table is: " . $num_rows . "\n";

if ($num_rows != 0) {
	echo "The players_temp table is not empty. Please empty the table before running the script.";
	exit;
}

echo "The players_temp table is empty, so we are going to start populating that table.\n";

echo "OK to continue?\n";

echo "y/n: ";

$line = trim(fgets(STDIN));

if ($line != "y") {
	exit;
}

foreach ($players as $index => $row) {

	$fields = explode("\t", trim($row));

	echo "the row is: " . json_encode($fields) . "\n";

	$pos = $fields[0];

	$last_name = $fields[1];

	$first_name = $fields[2];

	$salary = $fields[3];

	$team = $fields[4];

	$last_name_plain = preg_replace("/[^A-Za-z0-9]/", "", strtolower($last_name));

	$first_name_plain = preg_replace("/[^A-Za-z0-9]/", "", strtolower($first_name));

	echo "the fname is: " . $first_name_plain . "\n";

	echo "the lname is: " . $last_name_plain . "\n";

	$first_name = mysqli_real_escape_string($dbconn, ucfirst(strtolower($first_name)));
	$last_name = mysqli_real_escape_string($dbconn, ucfirst(strtolower($last_name)));

	$query = "INSERT INTO players_temp ";
	$query .= "SET Lname='" . $last_name . "', ";
	$query .= "Fname='" . $first_name . "', ";
	$query .= "LnamePlain='" . $last_name_plain . "', ";
	$query .= "FnamePlain='" . $first_name_plain . "', ";
	$query .= "Pos='" . $pos . "', ";
	$query .= "Salary=" . $salary . ", ";
	$query .= "Team='" . $team . "', ";

	if ($Pos === "RP" || $Pos === "SP") {
		$p_type = $pos;
	}
	else {
		$p_type = "Batter";
	}

	$query .= "p_type='" . $p_type . "'";

	echo $query . "\n";

	$result = mysqli_query($dbconn, $query);

	if (mysqli_error($dbconn)) {
		echo mysqli_error($dbconn);
		exit;
	}
}

exit;
