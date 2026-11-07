CREATE TABLE `books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`author` text,
	`cover_url` text,
	`total_pages` integer,
	`status` text DEFAULT 'reading' NOT NULL,
	`started_at` text,
	`finished_at` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `books_title_unique` ON `books` (`title`);--> statement-breakpoint
CREATE TABLE `gym_workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workout_date` text NOT NULL,
	`split` text NOT NULL,
	`duration_minutes` integer,
	`exercises` text NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `gym_workouts_date_idx` ON `gym_workouts` (`workout_date`);--> statement-breakpoint
CREATE INDEX `gym_workouts_split_idx` ON `gym_workouts` (`split`);--> statement-breakpoint
CREATE TABLE `meals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`log_date` text NOT NULL,
	`description` text,
	`calories` integer NOT NULL,
	`protein_g` integer DEFAULT 0 NOT NULL,
	`carbs_g` integer DEFAULT 0 NOT NULL,
	`fat_g` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `meals_date_idx` ON `meals` (`log_date`);--> statement-breakpoint
CREATE TABLE `mtg_decks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`commander` text NOT NULL,
	`color_identity` text NOT NULL,
	`commander_art_url` text,
	`decklist_url` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mtg_decks_name_unique` ON `mtg_decks` (`name`);--> statement-breakpoint
CREATE TABLE `reading_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`log_date` text NOT NULL,
	`book_id` integer NOT NULL,
	`pages` integer NOT NULL,
	`minutes` integer,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reading_logs_date_idx` ON `reading_logs` (`log_date`);--> statement-breakpoint
CREATE INDEX `reading_logs_book_idx` ON `reading_logs` (`book_id`);