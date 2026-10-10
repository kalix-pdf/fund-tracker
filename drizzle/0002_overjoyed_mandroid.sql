CREATE TABLE `fund_additions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`for_month` text NOT NULL,
	`amount_centavos` integer NOT NULL,
	`note` text,
	`created_at` integer NOT NULL,
	`voided_at` integer,
	CONSTRAINT "chk_fund_amount_positive" CHECK("fund_additions"."amount_centavos" > 0)
);
--> statement-breakpoint
CREATE INDEX `idx_fund_additions_month` ON `fund_additions` (`for_month`);--> statement-breakpoint
CREATE INDEX `idx_requests_released_at` ON `requests` (`released_at`);--> statement-breakpoint
CREATE INDEX `idx_requests_reimbursed_at` ON `requests` (`reimbursed_at`);--> statement-breakpoint
CREATE INDEX `idx_requests_refunded_at` ON `requests` (`refunded_at`);