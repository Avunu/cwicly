# Changelog

## [1.6.0](https://github.com/Avunu/cwicly/compare/v1.5.0...v1.6.0) (2026-09-29)


### Features

* auto-upgrades ([47357c4](https://github.com/Avunu/cwicly/commit/47357c4081dcaa7ca605dd379555af1df60647d7))
* auto-upgrades ([23cca59](https://github.com/Avunu/cwicly/commit/23cca594db70524ef3a093c335b90ea231eb345d))
* **security:** add Upload_Paths helper for contained upload paths ([a5946be](https://github.com/Avunu/cwicly/commit/a5946beb4006c9848823f89f748055d9736b60c4))


### Bug Fixes

* **deps:** pull gutenberg-downgrade from GitHub instead of a sibling path repo ([ad53a1c](https://github.com/Avunu/cwicly/commit/ad53a1c4a79116a77b010b82ee6fda42a990c27b))
* **deps:** pull gutenberg-downgrade from GitHub instead of a sibling path repo ([f25d10d](https://github.com/Avunu/cwicly/commit/f25d10d447bfebf4081a308aac8d3ca88ccaa0b9))
* **deps:** update svg-sanitize and drop bundled HTMLPurifier ([9387d6f](https://github.com/Avunu/cwicly/commit/9387d6f2348b3f0d20151631affdc16e68326098))
* in-iframe active selection styling ([a3646d9](https://github.com/Avunu/cwicly/commit/a3646d942f26ea05a1c1af6edda9a9f50613884a))
* in-iframe active selection styling ([056758f](https://github.com/Avunu/cwicly/commit/056758facfe2c8fc219691d7670cf6692d1d7058))
* **nix:** repoint GD path repo at the store copy instead of deleting it ([83a4e16](https://github.com/Avunu/cwicly/commit/83a4e16d64cd0f35f6fd3145373ddf2a2c412e79))
* **nix:** split c4 lock into no-dev (zip) and full (checks) variants ([7bd7dcc](https://github.com/Avunu/cwicly/commit/7bd7dcc10f1c9034fd09b94d334fa1b8350cb412))
* **nix:** strip GD repo and finalise lock in patchPhase so the c4 hook configures repos correctly ([661cb54](https://github.com/Avunu/cwicly/commit/661cb5402ada040ce2514aa02eea845fda550ff4))
* **release:** bump the real plugin header Version via release-please ([7aac490](https://github.com/Avunu/cwicly/commit/7aac4907a43bae5cb09d36e244dcbea5dc5ae79f))
* **release:** bump the real plugin header Version via release-please ([5835f3c](https://github.com/Avunu/cwicly/commit/5835f3cf766fdd499ceef99e5ddfcc5d2973ea1b))
* **security:** harden icon/font upload and delete endpoints ([9b0182a](https://github.com/Avunu/cwicly/commit/9b0182a8f3c03fc2e3a82b42f1b46d53954a2b3c))
* **security:** restrict REST option writes to an allowlist ([695890b](https://github.com/Avunu/cwicly/commit/695890b8b8bbc51c151bbf8625d298159de388fe))
* **security:** strip remote SVG refs, gate raw HTML fields, drop shell_exec ([c8990ab](https://github.com/Avunu/cwicly/commit/c8990ab6b7587f77c19b161687206d2891822384))
* **security:** tighten backend REST permissions and mask user data ([2626849](https://github.com/Avunu/cwicly/commit/262684990da0db2b1749160b2c71ad08b6b23290))


### Reverts

* GitHub update checker and license remnants ([b4dcd41](https://github.com/Avunu/cwicly/commit/b4dcd413c4664490300e50def994579524cd625e))


### Miscellaneous Chores

* **main:** release 1.5.0 ([61ae907](https://github.com/Avunu/cwicly/commit/61ae9079255dcc3e223a0372c74639a52ff9059d))
* **main:** release 1.5.0 ([9ae18c4](https://github.com/Avunu/cwicly/commit/9ae18c41ba5215df2a12a56ce57b625f6c70da43))
* **options:** purge all legacy license options on activation ([3c565e1](https://github.com/Avunu/cwicly/commit/3c565e15e492415427bd90fe92442abec27c9867))
* remove legacy updater code entirely ([5a16539](https://github.com/Avunu/cwicly/commit/5a1653960e9e1a72be4c6388256937ca3c345796))

## [1.5.0](https://github.com/Avunu/cwicly/compare/v1.4.8...v1.5.0) (2026-09-29)


### Features

* auto-upgrades ([47357c4](https://github.com/Avunu/cwicly/commit/47357c4081dcaa7ca605dd379555af1df60647d7))
* auto-upgrades ([23cca59](https://github.com/Avunu/cwicly/commit/23cca594db70524ef3a093c335b90ea231eb345d))
* **security:** add Upload_Paths helper for contained upload paths ([a5946be](https://github.com/Avunu/cwicly/commit/a5946beb4006c9848823f89f748055d9736b60c4))


### Bug Fixes

* **deps:** pull gutenberg-downgrade from GitHub instead of a sibling path repo ([ad53a1c](https://github.com/Avunu/cwicly/commit/ad53a1c4a79116a77b010b82ee6fda42a990c27b))
* **deps:** pull gutenberg-downgrade from GitHub instead of a sibling path repo ([f25d10d](https://github.com/Avunu/cwicly/commit/f25d10d447bfebf4081a308aac8d3ca88ccaa0b9))
* **deps:** update svg-sanitize and drop bundled HTMLPurifier ([9387d6f](https://github.com/Avunu/cwicly/commit/9387d6f2348b3f0d20151631affdc16e68326098))
* in-iframe active selection styling ([a3646d9](https://github.com/Avunu/cwicly/commit/a3646d942f26ea05a1c1af6edda9a9f50613884a))
* in-iframe active selection styling ([056758f](https://github.com/Avunu/cwicly/commit/056758facfe2c8fc219691d7670cf6692d1d7058))
* **nix:** repoint GD path repo at the store copy instead of deleting it ([83a4e16](https://github.com/Avunu/cwicly/commit/83a4e16d64cd0f35f6fd3145373ddf2a2c412e79))
* **nix:** split c4 lock into no-dev (zip) and full (checks) variants ([7bd7dcc](https://github.com/Avunu/cwicly/commit/7bd7dcc10f1c9034fd09b94d334fa1b8350cb412))
* **nix:** strip GD repo and finalise lock in patchPhase so the c4 hook configures repos correctly ([661cb54](https://github.com/Avunu/cwicly/commit/661cb5402ada040ce2514aa02eea845fda550ff4))
* **release:** bump the real plugin header Version via release-please ([7aac490](https://github.com/Avunu/cwicly/commit/7aac4907a43bae5cb09d36e244dcbea5dc5ae79f))
* **release:** bump the real plugin header Version via release-please ([5835f3c](https://github.com/Avunu/cwicly/commit/5835f3cf766fdd499ceef99e5ddfcc5d2973ea1b))
* **security:** harden icon/font upload and delete endpoints ([9b0182a](https://github.com/Avunu/cwicly/commit/9b0182a8f3c03fc2e3a82b42f1b46d53954a2b3c))
* **security:** restrict REST option writes to an allowlist ([695890b](https://github.com/Avunu/cwicly/commit/695890b8b8bbc51c151bbf8625d298159de388fe))
* **security:** strip remote SVG refs, gate raw HTML fields, drop shell_exec ([c8990ab](https://github.com/Avunu/cwicly/commit/c8990ab6b7587f77c19b161687206d2891822384))
* **security:** tighten backend REST permissions and mask user data ([2626849](https://github.com/Avunu/cwicly/commit/262684990da0db2b1749160b2c71ad08b6b23290))


### Reverts

* GitHub update checker and license remnants ([b4dcd41](https://github.com/Avunu/cwicly/commit/b4dcd413c4664490300e50def994579524cd625e))


### Miscellaneous Chores

* **options:** purge all legacy license options on activation ([3c565e1](https://github.com/Avunu/cwicly/commit/3c565e15e492415427bd90fe92442abec27c9867))
* remove legacy updater code entirely ([5a16539](https://github.com/Avunu/cwicly/commit/5a1653960e9e1a72be4c6388256937ca3c345796))
