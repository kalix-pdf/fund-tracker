CREATE TABLE `requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`requester_name` text NOT NULL,
	`department` text NOT NULL,
	`purpose` text NOT NULL,
	`amount_centavos` integer NOT NULL,
	`status` text DEFAULT 'PENDING_APPROVAL' NOT NULL,
	`liquidated_centavos` integer,
	`settlement_centavos` integer,
	`reimbursement_status` text,
	`created_at` integer NOT NULL,
	`approved_at` integer,
	`released_at` integer,
	`completed_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_requests_status` ON `requests` (`status`);--> statement-breakpoint
CREATE INDEX `idx_requests_department` ON `requests` (`department`);