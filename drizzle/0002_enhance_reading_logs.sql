DROP INDEX `books_title_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `books_title_unique` ON `books` (lower("title"));--> statement-breakpoint
ALTER TABLE `reading_logs` ADD `previous_book_status` text;--> statement-breakpoint
ALTER TABLE `reading_logs` ADD `previous_book_started_at` text;--> statement-breakpoint
ALTER TABLE `reading_logs` ADD `created_book` integer;