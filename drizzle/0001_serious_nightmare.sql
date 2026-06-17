CREATE TABLE `commits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`sha` text NOT NULL,
	`message` text NOT NULL,
	`author` text NOT NULL,
	`committed_at` text,
	`url` text NOT NULL,
	`synced_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commits_project_sha` ON `commits` (`project_id`,`sha`);