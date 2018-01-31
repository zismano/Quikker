CREATE KEYSPACE IF NOT EXISTS ks_drivers WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1' };

USE ks_drivers;

CREATE TABLE ks_drivers.drivers (
	driverId int PRIMARY KEY, 
	name text, 
	phone text, 
	location_x int,
	location_y int, 
	availability boolean,
	activity boolean
);