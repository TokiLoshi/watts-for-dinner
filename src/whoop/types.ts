// WHOOP API v2 types (https://developer.whoop.com/api). Only fields we use are
// required; everything WHOOP marks as score data is optional until SCORED.

export type ScoreState = "SCORED" | "PENDING_SCORE" | "UNSCORABLE";

export type Recovery = {
	cycle_id: number;
	sleep_id: string;
	user_id: number;
	created_at: string;
	updated_at: string;
	score_state: ScoreState;
	score?: {
		user_calibrating: boolean;
		recovery_score: number;
		resting_heart_rate: number;
		hrv_rmssd_milli: number;
		spo2_percentage?: number;
		skin_temp_celsius?: number;
	};
};

export type Cycle = {
	id: number;
	user_id: number;
	created_at: string;
	updated_at: string;
	start: string;
	end: string | null;
	timezone_offset: string;
	score_state: ScoreState;
	score?: {
		strain: number;
		kilojoule: number;
		average_heart_rate: number;
		max_heart_rate: number;
	};
	step_count?: number;
};

export type Sleep = {
	id: string;
	cycle_id: number;
	v1_id?: number | null;
	user_id: number;
	created_at: string;
	updated_at: string;
	start: string;
	end: string;
	timezone_offset: string;
	nap: boolean;
	score_state: ScoreState;
	score?: {
		stage_summary: {
			total_in_bed_time_milli: number;
			total_awake_time_milli: number;
			total_no_data_time_milli: number;
			total_light_sleep_time_milli: number;
			total_slow_wave_sleep_time_milli: number;
			total_rem_sleep_time_milli: number;
			sleep_cycle_count: number;
			disturbance_count: number;
		};
		sleep_needed: {
			baseline_milli: number;
			need_from_sleep_debt_milli: number;
			need_from_recent_strain_milli: number;
			need_from_recent_nap_milli: number;
		};
		respiratory_rate?: number;
		sleep_performance_percentage?: number;
		sleep_consistency_percentage?: number;
		sleep_efficiency_percentage?: number;
	};
};

export type Collection<T> = {
	records: T[];
	next_token?: string | null;
};

/** Normalized OAuth token set. `expiresAt` is epoch milliseconds. */
export type TokenSet = {
	accessToken: string;
	refreshToken: string | null;
	expiresAt: number;
	scope: string;
};

export type WhoopScope =
	| "offline"
	| "read:profile"
	| "read:recovery"
	| "read:cycles"
	| "read:sleep"
	| "read:workout"
	| "read:body_measurement";
