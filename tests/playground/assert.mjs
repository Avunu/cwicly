// Dependency-free assertion tally shared by the runtime tests.
export function tally() {
	let failures = 0;
	return {
		check(name, cond, detail = "") {
			const ok = Boolean(cond);
			if (!ok) failures++;
			console.log(`  ${ok ? "✓" : "✗ FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
			return ok;
		},
		get failures() {
			return failures;
		},
	};
}

/** Notices from phpJson() rendered for a failure detail. */
export function noticeDetail(notices) {
	return notices.length ? `${notices.length} notice(s): ${notices.slice(0, 4).join(" | ")}` : "";
}

/** E_DEPRECATED / E_USER_DEPRECATED entries from phpJson() notices. */
export function deprecations(notices) {
	return notices.filter((n) => n.startsWith("[8192]") || n.startsWith("[16384]"));
}
