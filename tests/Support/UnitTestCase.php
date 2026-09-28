<?php

declare(strict_types=1);

namespace Cwicly\Tests\Support;

use Brain\Monkey;
use Mockery;
use PHPUnit\Framework\TestCase;

/**
 * Base class for suites that stub WordPress with Brain Monkey rather than
 * loading it. cwicly's classes are legacy procedural-leaning PHP: tests stay
 * narrow (one method, one behavior) and define only the WP functions each
 * exercised path actually calls.
 */
abstract class UnitTestCase extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Monkey\setUp();
    }

    protected function tearDown(): void
    {
        // Brain Monkey / Mockery expectations are verified in Monkey\tearDown();
        // count them so expectation-only tests are not reported as risky.
        $this->addToAssertionCount(max(0, Mockery::getContainer()->mockery_getExpectationCount()));
        Monkey\tearDown();
        parent::tearDown();
    }
}
