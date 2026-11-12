CREATE TABLE `telegram_updates` (
	`update_id` integer PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`reply_text` text NOT NULL,
	`reply_status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`replied_at` integer
);
