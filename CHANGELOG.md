# Change Log

All notable changes to the "positron-r-tester" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## [0.0.1]

### Added
- Initial release
- Test discovery for testthat tests in non-package R projects
- Integration with Positron's Test Explorer sidebar
- Support for running individual tests, test files, and entire test suites
- Automatic test file watching and refresh
- Support for `test_that()` test blocks
- Conformation to configuration option `positron.r.testing` to enable/disable test explorer

### Requirements
- R version 4.2.0 or higher
- `testthat` package
- Tests organized in `tests/testthat/` directory structure