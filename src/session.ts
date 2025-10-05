import * as positron from 'positron';
import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

import { getObserver, waitForFile } from './utils';

export async function checkInstalled(pkgName: string,
	pkgVersion?: string): Promise<boolean> {

	const hasR = await positron.runtime.getRegisteredRuntimes().then((runtimes) => runtimes.some((runtime) => runtime.languageId === 'r'));
	if (!hasR) {
		throw new Error(vscode.l10n.t("No R runtime available."));
	}

	// Execute R code to dump package information
	const tmpPath = path.join(os.tmpdir(), `r_packages_${Date.now()}.json`);
	const rTmpPath = tmpPath.replace(/\\/g, '/');

	const rCode = `
    (function() {
      jsonlite::write_json(
        {
          do.call(rbind, lapply(.libPaths(), function(lib) {
            if (!dir.exists(lib)) return(NULL)

            pkgs <- installed.packages(lib.loc = lib)[, c("Package", "Version"), drop = FALSE]
            if (nrow(pkgs) == 0) return(NULL)

            df <- data.frame(
              Package = pkgs[, "Package"],
              Version = pkgs[, "Version"],
              },
              stringsAsFactors = FALSE
            )

            df
          })) -> result

          if (is.null(result)) list() else result[order(result$Package, result$LibPath), ]
        },
        path = "${rTmpPath}",
        auto_unbox = TRUE
      )
    })()
  `.trim();

	const observer = getObserver("Error refreshing packages: {0}");

	let pkgInfo: { name: string; version: string }[] = [];

	try {
		await positron.runtime.executeCode(
			'r',
			rCode,
			false,
			undefined,
			positron.RuntimeCodeExecutionMode.Silent,
			undefined,
			observer
		);

		await waitForFile(tmpPath);

		const contents = fs.readFileSync(tmpPath, 'utf-8');
		const parsed: {
			Package: string;
			Version: string;
			LibPath: string;
			LocationType: string;
			Title: string;
			Loaded: boolean;
		}[] = JSON.parse(contents);

		try {
			fs.unlinkSync(tmpPath);
		} catch (unlinkErr) {
			console.warn(vscode.l10n.t('[Positron] Failed to delete temp file: '), unlinkErr);
		}

		pkgInfo = parsed.map(pkg => ({
			name: pkg.Package,
			version: pkg.Version,
		}));

	} catch (err) {
		vscode.window.showErrorMessage(
			vscode.l10n.t('[R Tester] Failed to fetch R information: {0}', err instanceof Error ? err.message : String(err))
		);
		throw err;
	}

	pkgInfo = pkgInfo.filter(pkg => pkg.name === pkgName);

	if (pkgInfo.length === 0) {
		return false;
	}
	if (pkgVersion) {
		return pkgInfo.some(pkg => pkg.version === pkgVersion);
	}
	return true;
}

export async function getLocale(): Promise<Locale> {
	const tmpPath = path.join(os.tmpdir(), `r_locale_${Date.now()}.txt`);
	const rTmpPath = tmpPath.replace(/\\/g, '/');

	const rCode = `
      writeLines(Sys.getenv("LANG"), "${rTmpPath}")
    `.trim();

	const observer = getObserver("Error fetching locale: {0}");

	try {
		await positron.runtime.executeCode(
			'r',
			rCode,
			false,
			undefined,
			positron.RuntimeCodeExecutionMode.Silent,
			undefined,
			observer
		);

		await waitForFile(tmpPath);

		const lang = fs.readFileSync(tmpPath, 'utf-8').trim();

		try {
			fs.unlinkSync(tmpPath);
		} catch (unlinkErr) {
			console.warn(vscode.l10n.t('[Positron] Failed to delete temp file: '), unlinkErr);
		}

		return { LANG: lang };
	} catch (err) {
		vscode.window.showErrorMessage(
			vscode.l10n.t('[R Tester] Failed to fetch locale: {0}', err instanceof Error ? err.message : String(err))
		);
		throw err;
	}
}

interface Locale {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	LANG: string;
	[key: string]: string;
}