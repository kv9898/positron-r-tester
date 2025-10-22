# Positron R Tester

A Positron extension that brings R (testthat) test discovery and execution to the Test Explorer sidebar for non-package R projects.

## Overview

Positron R Tester enables you to view and run your R testthat tests directly from Positron's Test Explorer sidebar, even when you're not working within an R package structure. This extension is designed specifically for standalone R projects that use testthat for testing but aren't organized as formal R packages.

## Features

- **Test Discovery**: Automatically discovers testthat test files in your project
- **Test Explorer Integration**: View all your tests in Positron's Test Explorer sidebar
- **Individual Test Execution**: Run individual tests, test files, or entire test suites
- **Test Results**: See test results directly in the Test Explorer with pass/fail status
- **File Watching**: Automatically updates test list when test files are added, modified, or removed

## Requirements

- **Positron**: This extension requires Positron (not VS Code)
- **R**: R version 4.2.0 or higher
- **testthat**: The testthat R package must be installed
- **devtools**: The devtools R package must be installed for running tests in Positron
- **Project Structure**: Tests should be organized in a `tests/testthat/` directory structure
  - Test files should follow the naming convention `test-*.R` or `test_*.R`
  - Tests should use `testthat::test_that()` and `testthat::describe()` functions

## Installation

1. Install the extension from the Positron extensions marketplace
2. Ensure you have R 4.2.0+ and testthat installed
3. Open an R project with tests in the `tests/testthat/` directory

## Configuration

Enable or disable the test explorer through Positron settings:

- `positron.r.testing`: Enable/disable R testing features (default: enabled when testthat is detected)

## Usage

1. Open an R project containing a `tests/testthat/` directory
2. The Test Explorer will automatically discover your tests
3. Click on the Testing icon in the sidebar to view all discovered tests
4. Run tests by clicking the play button next to individual tests, test files, or the entire suite
5. View test results in the Test Explorer with pass/fail indicators

## Known Limitations

- **Non-Package Projects Only**: This extension is designed for non-package R projects. If your project has a DESCRIPTION file indicating it's an R package, the extension will not activate (use Positron's built-in package testing features instead)
- **testthat Required**: Only works with projects using the testthat testing framework

## Contributing

Contributions are welcome! Please visit the [GitHub repository](https://github.com/kv9898/positron-r-tester) to report issues or submit pull requests.

## License

This extension includes code derived from Positron, which is licensed under the Elastic License 2.0.

## Acknowledgments

This extension is built upon testing infrastructure from [Positron](https://github.com/posit-dev/positron), developed by Posit Software, PBC.
