ALTER TABLE `task` ADD `creator_id` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `task` ADD `image` text;--> statement-breakpoint
ALTER TABLE `task` ADD `urgency` text DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `banned` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `ban_reason` text;--> statement-breakpoint
ALTER TABLE `user` ADD `ban_expires` integer;