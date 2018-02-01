CREATE KEYSPACE IF NOT EXISTS ks_drivers WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '3' };

USE ks_drivers;

CREATE TYPE ks_drivers.point (
    x int,
    y int
);

CREATE TABLE IF NOT EXISTS ks_drivers.drivers (
	driverId int PRIMARY KEY, 
	name text, 
	phone text, 
	location frozen <point>, 
	availability boolean,
	activity boolean
);