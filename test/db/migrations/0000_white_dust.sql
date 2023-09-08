-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

CREATE TABLE IF NOT EXISTS `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`first_name` numeric DEFAULT (NULL),
	`middle_name` numeric DEFAULT (NULL),
	`last_name` numeric DEFAULT (NULL),
	`phone` numeric DEFAULT (NULL),
	`email` numeric DEFAULT (NULL),
	`address` numeric DEFAULT (NULL),
	`postalZip` numeric DEFAULT (NULL),
	`region` numeric DEFAULT (NULL),
	`country` numeric DEFAULT (NULL),
	`list` numeric DEFAULT (NULL),
	`text` text DEFAULT (NULL),
	`numberrange` integer DEFAULT (NULL),
	`currency` numeric DEFAULT (NULL),
	`alphanumeric` numeric,
	`born_day` numeric,
	`marital_status` numeric DEFAULT (NULL)
);
