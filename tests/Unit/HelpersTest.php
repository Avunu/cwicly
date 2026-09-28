<?php

declare(strict_types=1);

namespace Cwicly\Tests\Unit;

use Brain\Monkey\Functions;
use Cwicly\Helpers;
use Cwicly\Tests\Support\UnitTestCase;

/**
 * Helpers: the grab-bag class every subsystem calls into. These are the pure /
 * near-pure members with real WordPress surface area stubbed by Brain Monkey.
 */
final class HelpersTest extends UnitTestCase
{
    public function testGetCurrentUserRolesWhenLoggedOut(): void
    {
        Functions\when('is_user_logged_in')->justReturn(false);
        $this->assertSame([], Helpers::get_current_user_roles());
    }

    public function testGetCurrentUserRolesReturnsArrayCast(): void
    {
        Functions\when('is_user_logged_in')->justReturn(true);
        $user = (object) ['roles' => ['editor']];
        Functions\when('wp_get_current_user')->justReturn($user);

        $this->assertSame(['editor'], Helpers::get_current_user_roles());
    }

    public function testStrposaNegatesItsName(): void
    {
        // Guards a real footgun: strposa() encodes the haystack array and
        // searches it for the needle, i.e. it answers "is $str contained
        // anywhere in json_encode($arr)", not "does $str appear at a position".
        // Pinning current behavior so refactors stay honest.
        Functions\when('wp_json_encode')->alias(static fn ($v): string => json_encode($v));
        $this->assertTrue(Helpers::strposa('div', ['section', 'div']));
        $this->assertFalse(Helpers::strposa('span', ['section', 'div']));
    }

    public function testCheckIfExists(): void
    {
        $this->assertTrue(Helpers::check_if_exists(0));
        $this->assertTrue(Helpers::check_if_exists('0'));
        $this->assertTrue(Helpers::check_if_exists('value'));
        $this->assertFalse(Helpers::check_if_exists(''));
        $this->assertFalse(Helpers::check_if_exists(null));
        $this->assertFalse(Helpers::check_if_exists(false));
        $this->assertFalse(Helpers::check_if_exists([]));
    }

    public function testGetServerAddressPrefersServerAddr(): void
    {
        $backup = $_SERVER;
        $_SERVER = ['SERVER_ADDR' => '10.0.0.1'];
        try {
            $this->assertSame('10.0.0.1', Helpers::get_server_address());
        } finally {
            $_SERVER = $backup;
        }
    }

    public function testGetServerAddressFallsBackToServerName(): void
    {
        $backup = $_SERVER;
        $_SERVER = ['SERVER_NAME' => 'localhost'];
        try {
            // gethostbyname('localhost') resolves to 127.0.0.1 on any sane box.
            $this->assertMatchesRegularExpression('/^\d+\.\d+\.\d+\.\d+$/', Helpers::get_server_address());
        } finally {
            $_SERVER = $backup;
        }
    }
}
