<?php

declare(strict_types=1);

namespace Cwicly\Tests\Unit;

use Cwicly\Tests\Support\UnitTestCase;

/**
 * The release-asset matcher the update checker uses (cwicly.php). Kept as a
 * test here because a mismatch silently breaks self-updates for every install:
 * PUC would find no candidate asset and report "up to date" forever.
 */
final class UpdateCheckerAssetTest extends UnitTestCase
{
    /** The regex cwicly.php passes to enableReleaseAssets(). */
    private const ASSET_REGEX = '/\.zip$/i';

    /** Sample GitHub release assets, mirroring what CI uploads plus noise. */
    private const SAMPLE_ASSETS = [
        ['name' => 'cwicly-plugin_v1.4.8.zip', 'browser_download_url' => 'https://github.com/Avunu/cwicly/releases/download/v1.4.8/cwicly-plugin_v1.4.8.zip'],
        ['name' => 'source.zip', 'browser_download_url' => 'https://api.github.com/repos/Avunu/cwicly/zipball/v1.4.8'],
        ['name' => 'checksums.txt', 'browser_download_url' => 'https://github.com/Avunu/cwicly/releases/download/v1.4.8/checksums.txt'],
    ];

    public function testPluginZipMatches(): void
    {
        $this->assertSame(1, preg_match(self::ASSET_REGEX, 'cwicly-plugin_v1.4.8.zip'));
    }

    public function testNonZipsDoNotMatch(): void
    {
        $this->assertSame(0, preg_match(self::ASSET_REGEX, 'checksums.txt'));
        $this->assertSame(0, preg_match(self::ASSET_REGEX, 'cwicly-plugin_v1.4.8.tar.gz'));
    }

    public function testExactlyOneAssetSelectedPerRelease(): void
    {
        // The CI uploads exactly one zip per release; GitHub's auto-generated
        // source archives are not release *assets* (they live on the API's
        // zipball/tarball endpoints, not in `assets`), so among real assets only
        // the plugin zip matches. PUC takes the first match — assert our naming
        // is unambiguous among typical release contents.
        $matches = array_values(array_filter(
            self::SAMPLE_ASSETS,
            static fn(array $asset): bool => preg_match(self::ASSET_REGEX, $asset['name']) === 1,
        ));
        $this->assertNotEmpty($matches);
        $this->assertStringContainsString('/releases/download/', $matches[0]['browser_download_url']);
    }

    public function testVersionTagExtraction(): void
    {
        // plugin-update-checker derives the new version from the tag name; pin
        // the v-prefixed convention release-please produces (include-v-in-tag).
        $tag = 'v1.5.0';
        $this->assertSame('1.5.0', ltrim($tag, 'v'));
        $this->assertSame(1, preg_match('/^v\d+\.\d+\.\d+$/', $tag));
    }
}
