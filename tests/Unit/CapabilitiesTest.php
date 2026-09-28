<?php

declare(strict_types=1);

namespace Cwicly\Tests\Unit;

use Brain\Monkey\Functions;
use Cwicly\Capabilities;
use Cwicly\Tests\Support\UnitTestCase;

/**
 * Capabilities::permission_for_user() / user_can_raw_html(): the role-editor
 * gate that decides whether a user may store raw HTML in ACF fields. This is
 * the security boundary added by the maintenance fork, so it gets direct
 * coverage: explicit per-user toggle > role toggle > unfiltered_html fallback.
 */
final class CapabilitiesTest extends UnitTestCase
{
    public function testMissingUserFallsBackToUnfilteredHtml(): void
    {
        // permission_for_user() returns null for user id 0 (falsy), so the
        // core unfiltered_html capability decides.
        Functions\expect('get_option')->once()->with('cwicly_role_editor')->andReturn(false);
        Functions\expect('user_can')->once()->with(0, 'unfiltered_html')->andReturn(false);

        $this->assertFalse(Capabilities::user_can_raw_html(0));
    }

    public function testExplicitUserToggleOverridesRole(): void
    {
        $roleEditor = [
            'administrator' => ['blockToolbar' => ['dynamicRawHtml' => true]],
            'user_5' => ['blockToolbar' => ['dynamicRawHtml' => false]],
        ];
        Functions\expect('get_option')->once()->with('cwicly_role_editor')->andReturn($roleEditor);

        // User 5 has an explicit deny even though their role would allow it.
        $this->assertFalse(Capabilities::user_can_raw_html(5));
    }

    public function testRoleToggleAppliesWhenNoUserOverride(): void
    {
        $roleEditor = ['editor' => ['blockToolbar' => ['dynamicRawHtml' => false]]];
        $user = (object) ['roles' => ['editor']];
        Functions\expect('get_option')->once()->with('cwicly_role_editor')->andReturn($roleEditor);
        Functions\expect('get_userdata')->once()->with(7)->andReturn($user);

        $this->assertFalse(Capabilities::user_can_raw_html(7));
    }

    public function testFallsBackToUnfilteredHtml(): void
    {
        // No role editor configured at all -> permission_for_user returns null.
        Functions\expect('get_option')->once()->with('cwicly_role_editor')->andReturn(false);
        Functions\expect('user_can')->once()->with(9, 'unfiltered_html')->andReturn(true);

        $this->assertTrue(Capabilities::user_can_raw_html(9));
    }
}
