# Change Log

All notable changes to the "positron-r-tester" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## 0.0.4

- Fix running single tests on modern `testthat` (3.2.0+): use the `desc` argument instead of `filter` for `test_file()`, which previously errored with `unused argument (filter = ...)`. Fixes running individual `test_that()` / `describe()` tests.
- Fix `split2` import: the module exports a callable function directly, so `import * as split2` was non-callable (TS2349). Switched to `import split2 = require('split2')`.

## 0.0.3

- Emit an error message if `devtools` package is not installed when attempting to run tests.

## 0.0.2

- Add `devtools` package as a requirement for running tests in Positron.

## 0.0.1

### Added
- Initial release
- Test discovery for testthat tests in non-package R projects
- Integration with Positron's Test Explorer sidebar
- Support for running individual tests, test files, and entire test suites
- Automatic test file watching and refresh
- Support for `test_that()` and `describe()` test blocks
- Conformation to configuration option `positron.r.testing` to enable/disable test explorer

### Requirements
- R version 4.2.0 or higher
- `testthat` package
- Tests organized in `tests/testthat/` directory structure