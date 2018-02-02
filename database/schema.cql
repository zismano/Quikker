CREATE KEYSPACE IF NOT EXISTS ks_drivers WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '3' };

USE ks_drivers;

CREATE TYPE ks_drivers.point (
    x int,
    y int
);

CREATE TABLE IF NOT EXISTS ks_drivers.drivers (
	updated_at timestamp, 
	driverId int, 
	name text, 
	phone text, 
	location frozen <point>, 
	availability boolean,
	activity boolean,
	primary key(driverId)	
);

CREATE INDEX ON ks_drivers.drivers (availability);

CREATE INDEX ON ks_drivers.drivers (activity);
